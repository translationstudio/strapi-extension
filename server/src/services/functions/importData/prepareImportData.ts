/*
Strapi - translationstudio extension
Copyright (C) 2025 I-D Media GmbH, idmedia.com

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, see https://www.gnu.org/licenses/old-licenses/gpl-2.0.html
*/
import { TranslatedDocumentReplaceFields, TranslationstudioTranslatable } from "../../../../../Types";
import { IStrapiSchema, IStrapiSchemaEntry } from "../exportData/getContentType";
import htmlToJson from "./htmlToJson";

const Logger = {
    log: typeof strapi !== "undefined" ? strapi.log : console,
    info: (val:any) => Logger.log.info(val),
    warn: (val:any) => Logger.log.warn(val),
    error: (val:any) => Logger.log.error(val),
    debug: (val:any) => Logger.log.debug(val)
}

const removeComponentIds = function(elem:any)
{
    const list = Array.isArray(elem) ? elem : [elem];
    for (let obj of list)
    {
        if (obj.__component && obj.id)
            delete obj.id;

        for (let key in obj)
        {
            const child = obj[key];
            if (Array.isArray(child) && Array.length > 0)
                removeComponentIds(child);
            else if (typeof child === "object")
                removeComponentIds(child);
        }
    }
}

/**
 * 
 * @param strapiEntry Strapi document
 * @param replacableFields List of fields to replace
 * @returns List of fields replaced
 */
function replaceDynamicZones(strapiEntry: any, replacableFields: TranslatedDocumentReplaceFields) 
{
    const fields:string[] = [];
    for (let key in strapiEntry) 
    {
        if (replacableFields[key])
        {
            removeComponentIds(replacableFields[key]);
            strapiEntry[key] = replacableFields[key];
            fields.push(key);
        }
    }

    if (fields.length > 0)
        Logger.info(fields.length + " dynamic fields/components replaced for later merge: " + fields.join(", "));

    return fields;
}

/**
 * Merge a simple text field
 * 
 * @param translatables Translated elements
 * @param existingEntry Existing Strapi document
 * @param map Map to save updated entries in for later strapi update operation. Might be a separate record or a 
 * dynamic block entry itself
 * @returns true if (and only if) an update was performed
 */
const mergeValue = function(field:string, translatable:TranslationstudioTranslatable, targetSchema: IStrapiSchemaEntry, map:Record<string, any>)
{
    if (translatable.translatableValue.length === 0)
        return false;

    
    if (targetSchema.attributes[field] === undefined)
    {
        Logger.info("Field " + field + " does not exist in schema. Skipping it");
        Logger.info(targetSchema)
        return false;
    }

    if (translatable.translatableValue[0] === "")
    {
        Logger.info("Skipping empty translated content for field " + field);
        return false;
    }

     // Handle blocks fields differently
    if (translatable.realType === 'blocks') 
    {
        Logger.info("Merge block field " + field);
        map[field] = htmlToJson(translatable.translatableValue[0] || '');
        return true;
    } 

    if (translatable.type === "text")
    {
        Logger.info("Merge text field " + field);
        map[field] = translatable.translatableValue[0];
        return true;
    }

    Logger.warn("Did not process " + field);
    return false;
}

/**
 * Merge all simple text fields that are not part of any dynamic zone or content block, i.e. which do not
 * have UUID referenced by translationstudio
 * 
 * @param translatables Translated elements
 * @param existingEntry Existing Strapi document
 * @param targetSchema Schema of entry
 * @param map Map to save updated entries in for later strapi update operation
 * @returns true if fields were updated
 */
const mergeSimpleFields = function (translatables: TranslationstudioTranslatable[], existingEntry: any, targetSchema: IStrapiSchema, map:Record<string, any>) {
    
    let count = 0;

    for (const candidate of translatables) 
    {
        const field = candidate.field;
        if (!candidate.uuid && mergeValue(field, candidate, targetSchema.entry, map))
            count++;
    }

    if (count > 0)
    {
        Logger.info("Updated " + count + " simple text fields");
        return true;
    }

    return false;
}

type UuidMap = {
    [uuid:string] : {
        entry: any;
        schema: IStrapiSchemaEntry
    }
}

/**
 * Build a map in which strapi zone/component entries are mapped by uid for easy access
 * Translatable fields will have a uuid entry which corresponds to the existing strapi component entry
 * 
 * @param existingEntry Strapi document
 * @param schemaMap Available schemata
 * @param map Target Map
 * @returns Target Map
 */
const buildMapOfUuids = function(existingEntry:any, schemaMap: IStrapiSchema, map:UuidMap)
{
    if (typeof existingEntry !== "object")
        return map;

    const componentName = existingEntry["__component"] ?? "";    
    const schema = componentName && schemaMap.components[componentName] ? schemaMap.components[componentName] : null;
    if (componentName && !schema)
        Logger.warn("Cannot find component schema " + componentName);

    for (const key of Object.keys(existingEntry))
    {
        if (key === "__component")
            continue;

        /** the entry does have a component name, if not, there is something suspicious */
        if (schema !== null && key === "__tsuid")
        {
            map[existingEntry[key]] = {
                entry: existingEntry,
                schema: schema
            };

            continue;
        }
    
        const child = existingEntry[key];
        if (child)
        {
            if (Array.isArray(child))
            {
                for (let e of child)
                    buildMapOfUuids(e, schemaMap, map);
            }
            else
                buildMapOfUuids(child, schemaMap, map);
        }
    }

    if (existingEntry["__tsuid"])
    {
        delete existingEntry["__tsuid"];
        Logger.info("Removed cusom property __tsuid");
    }

    return map;
}

const mergeDynamicZones = function (translatables: TranslationstudioTranslatable[], schemaMap: IStrapiSchema, existingEntry: any)
{
    if (translatables.length === 0)
    {
        Logger.info("Skipping merging of dynamic zones, because none are present.");
        return;
    }

    const map:UuidMap = { };
    buildMapOfUuids(existingEntry, schemaMap, map);
    const mapSize = Object.keys(map).length; 
    if (mapSize === 0)
    {
        Logger.warn("Could not create a uuid map");
        return false;
    }

    Logger.info("Built uuid map with " + mapSize + " entry(s)");
    
    let count = 0;
    for (const translatable of translatables)
    {
        if (!translatable.uuid)
            continue;

        const uuid = translatable.uuid;
        if (!map[uuid])
            continue;

        const entry = map[uuid];
        const schema = entry.schema;
        if (!schema)
        {
            Logger.warn("Cannot find schema by uuid #" + uuid);
            continue;
        }

        if (mergeValue(translatable.field, translatable, schema, entry.entry))
            count++;
    }

    if (count > 0)
    {
        Logger.info("Updated " + count + " entries in dynamic zones/content blocks");
        return true;
    }

    return false;
}

export function prepareImportData(
    translatables: TranslationstudioTranslatable[],
    keepData: TranslatedDocumentReplaceFields,
    existingEntry: any,
    targetSchema: IStrapiSchema
): Record<string, any> | null {

    const result:Record<string, any> = { };
    
    const simpleUpdated = mergeSimpleFields(translatables, existingEntry, targetSchema, result);
    let otherUpdated = false;

    const vsFields = replaceDynamicZones(existingEntry, keepData);
    if (vsFields.length > 0)
    {
        if (mergeDynamicZones(translatables, targetSchema, existingEntry))
        {
            vsFields.forEach(field => result[field] = existingEntry[field]);
            otherUpdated = true;
        }
        else
            Logger.warn("Could not merge dynamic fields");
    }

    if (simpleUpdated || otherUpdated)
        return result;
    else
        return null;
}
