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
import {
    TranslationstudioTranslatable,
    FieldSchema,
} from "../../../../../Types";
import { IStrapiComponentSchemaMap, IStrapiSchemaEntry, IStrapiSchemaEntryAttributes } from "./getContentType";
import jsonToHtml from "./jsonToHtml";
import * as crypto from "crypto";

const Logger = {
    log: typeof strapi !== "undefined" ? strapi.log : console,
    info: (val:any) => Logger.log.info(val),
    warn: (val:any) => Logger.log.warn(val),
    error: (val:any) => Logger.log.error(val),
    debug: (val:any) => Logger.log.debug(val)
}

export default async function processComponent(
    fieldName: string,
    value: any,
    componentSchema: IStrapiSchemaEntry,
    schemata: IStrapiComponentSchemaMap
): Promise<TranslationstudioTranslatable[]> 
{

    const contentFields: TranslationstudioTranslatable[] = [];
    Logger.info("Processing dynamic field " + fieldName);

    if (!componentSchema || !componentSchema.attributes)
        return [];

    const schemaAttributes = componentSchema.attributes || {};
    const dataToProcess = value || {};

    const candidates = Array.isArray(dataToProcess) ? dataToProcess : [dataToProcess];
    for (const item of candidates) {
        const processedFields = await processComponentFields(
            item,
            schemaAttributes,
            fieldName,
            schemata
        );
        if (processedFields.length > 0)
            contentFields.push(...processedFields);
    }

    return contentFields;
};

const shouldSkipField = (key: string, fieldSchema: FieldSchema): boolean => {
    return key === "id" || fieldSchema.private;
};

const isTranslatableField = (type: string): boolean => {
    return ["string", "text", "blocks", "richtext"].includes(type);
};

const getTranslatedValue = (type: string, value: any): string => {
    if (type === "blocks") {
        return value ? jsonToHtml(value) : "";
    }
    return value.toString();
};

const buildTranslatable = (
    key: string,
    fieldSchema: FieldSchema,
    value: string,
    uuid = ""
): TranslationstudioTranslatable => {
    return {
        field: key,
        type: ["richtext", "blocks"].includes(fieldSchema.type) ? "html" : "text",
        translatableValue: [value],
        realType: fieldSchema.type,
        uuid: uuid
    };
};

const processComponentFields = async (
    componentData: any,
    schema: IStrapiSchemaEntryAttributes,
    parentField: string,
    schemata: IStrapiComponentSchemaMap
): Promise<TranslationstudioTranslatable[]> => {

    const contentFields: TranslationstudioTranslatable[] = [];
    const uuid = crypto.randomUUID();
    for (const [key, fieldSchema] of Object.entries(schema)) 
    {
        if (shouldSkipField(key, fieldSchema)) continue;

        const value = componentData?.[key];
        if (!value)
            continue;

        if (fieldSchema.type === "component") 
        {
            if (!value.__component) 
                continue;

            const targetSchema = schemata[value.__component];
            if (!targetSchema)
                continue;

            const nestedFields = await processComponent(
                `${parentField}.${key}`,
                value,
                targetSchema,
                schemata
            );

            if (nestedFields.length > 0)
                contentFields.push(...nestedFields);

            continue;
        }

        if (!isTranslatableField(fieldSchema.type)) continue;
        if (value === null || value === undefined || value === "") continue;

        const translatedValue = getTranslatedValue(fieldSchema.type, value);
        const translatable = buildTranslatable(
            key,
            fieldSchema,
            translatedValue,
            uuid
        );

        componentData.__tsuid = uuid;
        contentFields.push(translatable);
    }

    return contentFields;
};
