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
import { IStrapiComponentSchemaMap, IStrapiSchemaEntry } from "./getContentType";
import jsonToHtml from "./jsonToHtml";
import * as crypto from "crypto";

const processComponent = async (
    fieldName: string,
    componentName: string,
    value: any,
    schemaName: string,
    componentId: number | undefined,
    componentSchema: IStrapiSchemaEntry,
    schemata: IStrapiComponentSchemaMap
): Promise<TranslationstudioTranslatable[]> => {

    const contentFields: TranslationstudioTranslatable[] = [];

    if (!componentSchema || !componentSchema.attributes)
        return [];

    const schemaAttributes = componentSchema.attributes || {};
    const dataToProcess = value || {};

    // repeatable component
    if (Array.isArray(dataToProcess)) {
        for (const item of dataToProcess) {
            const processedFields = await processComponentFields(
                item,
                schemaAttributes,
                fieldName,
                componentName,
                schemaName,
                item.id,
                schemata
            );
            if (processedFields.length > 0)
                contentFields.push(...processedFields);
        }
    } else {
        // single component
        const processedFields = await processComponentFields(
            dataToProcess,
            schemaAttributes,
            fieldName,
            componentName,
            schemaName,
            componentId,
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
    parentPath: string[],
    componentId: number | undefined,
    schemaName: string,
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
    schema: Record<string, FieldSchema>,
    parentField: string,
    componentName: string,
    schemaName: string,
    componentId: number | number,
    schemata: IStrapiComponentSchemaMap
): Promise<TranslationstudioTranslatable[]> => {
    const contentFields: TranslationstudioTranslatable[] = [];
    const parentPath = parentField.split(".");
    for (const [key, fieldSchema] of Object.entries(schema)) 
    {
        if (shouldSkipField(key, fieldSchema)) continue;

        const value = componentData?.[key];
        if (!value)
            continue;

        const componentName = value?.__component;
        if (!componentName) continue;

        const schema = schemata[componentName];
        if (!schema) continue;

        const fieldPath = `${parentField}.${key}`;
        if (fieldSchema.type === "component") {
            if (!fieldSchema.component) continue;

            const nestedFields = await processComponent(
                fieldPath,
                fieldSchema.component,
                value,
                fieldSchema.component,
                value?.id,
                schema,
                schemata
            );
            if (nestedFields.length > 0)
                contentFields.push(...nestedFields);
            continue;
        }

        if (!isTranslatableField(fieldSchema.type)) continue;
        if (value === null || value === undefined || value === "") continue;

        const uuid = crypto.randomUUID();
        const translatedValue = getTranslatedValue(fieldSchema.type, value);
        const translatable = buildTranslatable(
            key,
            fieldSchema,
            translatedValue,
            parentPath,
            componentId,
            schemaName
        );

        value.__tsuid = uuid;
        contentFields.push(translatable);
    }

    return contentFields;
};

export default processComponent;
