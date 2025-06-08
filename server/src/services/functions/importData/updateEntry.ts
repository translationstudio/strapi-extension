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
import { IStrapiSchema, IStrapiSchemaEntry, IStrapiSchemaEntryAttributes } from '../exportData/getContentType';

const Logger = {
    log: typeof strapi !== "undefined" ? strapi.log : console,
    info: (val: any) => Logger.log.info(val),
    warn: (val: any) => Logger.log.warn(val),
    error: (val: any) => Logger.log.error(val),
    debug: (val: any) => Logger.log.debug(val)
}

const DEFAULT_FIELDS = [
    "id",
    "documentId",
    "createdAt",
    "updatedAt", ,
    "createdBy",
    "updatedBy",
    "publishedAt",
    "locale",
    "localizations"
];

const getContentFields = function(schema:IStrapiSchemaEntryAttributes)
{
    const nullFields:string[] = [];
    for (let field in schema)
    {
        if (!DEFAULT_FIELDS.includes(field))
            nullFields.push(field);
    }
    return nullFields;
}

const getInvalidOrNullFields = function(document:any, schema:IStrapiSchemaEntryAttributes)
{
    if (!document)
        return getContentFields(schema);

    const nullFields:string[] = [];
    let fieldsValid = 0;
    for (let field in document)
    {
        if (DEFAULT_FIELDS.includes(field))
            continue;

        if (document[field] === null)
            nullFields.push(field);
        else
            fieldsValid++;
    }

    /* we have fields other than the default fields and they are invalid */
    if (nullFields.length > 0 || fieldsValid > 0)
        return nullFields;

    return getContentFields(schema);
}

export function appendMissingFields(data: Record<string, any>, sourceEntry: any, targetSchema: IStrapiSchema, targetEntry) {

    const nullFields = getInvalidOrNullFields(targetEntry, targetSchema.entry.attributes)
    if (nullFields.length === 0)
        return;

    let count = 0;
    Logger.info("Adding missing fields to new locale: " + nullFields.join(", "));
    for (let field of nullFields)
    {
        if (data[field])
        {
            Logger.info("Field already present: " + field);
            continue;
        }

        if (!sourceEntry[field])
        {
            Logger.info("No valid source langauge field value for " + field + " - skipping it.");
            continue;
        }

        if (!targetSchema.entry.attributes[field])
        {
            Logger.warn("Schema does not contain field " + field);
            continue;
        }

        Logger.info("Adding missing field and value for " + field);
        data[field] = sourceEntry[field]
        count++;
    }

    if (count > 0)
        Logger.info(count + " missing fields added.");
}


export async function updateEntry(
    contentTypeID: string,
    entryID: string,
    targetLocale: string,
    data: Record<string, any>,
) {

    strapi.log.info("Updating target entry " + contentTypeID + "::" + entryID + " in locale " + targetLocale)
    const newEntry = await strapi.documents(contentTypeID as any).update({
        documentId: entryID,
        locale: targetLocale,
        data: data,
    });

    if (!newEntry)
        throw new Error("Cannot update target entry " + contentTypeID + "::" + entryID + " in locale " + targetLocale);
}