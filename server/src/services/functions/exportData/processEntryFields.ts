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
import jsonToHtml from './jsonToHtml';
import processComponent from './processComponent';
import isFieldLocalizable from './isFieldLocalizable';
import { TranslationstudioTranslatable } from '../../../../../Types';

const DEFAULT_FIELDS = new Set([
    'id',
    'documentId',
    'createdAt',
    'updatedAt',
    'publishedAt',
    'locale',
    'localizations',
    'updatedBy',
    'createdBy',
]);

export interface ExportedDocumentFields {
    fields: any[],
    keep: any
};

const isEmpty = (value: any) =>
    value === null || value === undefined || value === '';

const isTranslatableField = (fieldSchema: any) =>
    ['string', 'text', 'blocks', 'richtext'].includes(fieldSchema.type) &&
    fieldSchema.pluginOptions?.i18n?.localized !== false;

const processDynamicZone = async (key: string, value: any[], schema: any) => {
    const results = [];

    for (const component of value) {
        const componentName = component?.__component;
        if (!componentName) continue;

        const fields = await processComponent(
            key,
            componentName,
            component,
            componentName,
            component.id
        );
        results.push(...fields);
    }

    return results;
};

const processComponentField = async (key: string, value: any, fieldSchema: any) => {
    const results = [];

    if (fieldSchema.repeatable && Array.isArray(value)) {
        for (const component of value) {
            const fields = await processComponent(
                key,
                fieldSchema.component,
                component,
                fieldSchema.component,
                component.id
            );
            results.push(...fields);
        }
    } else {
        const fields = await processComponent(
            key,
            fieldSchema.component,
            value,
            fieldSchema.component,
            value.id
        );
        results.push(...fields);
    }

    return results;
};

const processRegularField = (key: string, value: any, fieldSchema: any):TranslationstudioTranslatable => {
    const translatedValue =
        fieldSchema.type === 'blocks' ? jsonToHtml(value) : value.toString();

    return {
        field: key,
        type: ['richtext', 'blocks'].includes(fieldSchema.type) ? 'html' : 'text',
        translatableValue: [translatedValue],
        realType: fieldSchema.type,
    };
};

const processEntryFields = async (entry: any, schema: any, locale: string): Promise<ExportedDocumentFields> => {
    const contentFields = [];
    const staticContent:any = { };
    
    let randomIdNumber = 0;

    for (const [key, value] of Object.entries(entry)) 
    {
        randomIdNumber++;
        
        if (shouldSkipField(key, value)) continue;

        const fieldSchema = schema[key];
        if (!fieldSchema) continue;

        /** ignore everything that is non-localiaable by default */
        if (!isFieldLocalizable(fieldSchema, schema))
            continue;

        if (isTranslatableField(fieldSchema)) {
            const translatedField = processRegularField(key, value, fieldSchema);
            contentFields.push(translatedField);
            staticContent[key] = value;
            continue;
        }

        {
            const zoneInfo = isDynamicZone(fieldSchema, value);
            if (zoneInfo.isZone) {
                if (zoneInfo.hasContent) {
                    const zoneFields = await processDynamicZone(key, value as any[], schema);
                    contentFields.push(...zoneFields);
                    staticContent[key] = value;
                }

                continue;
            }
        }

        const componentInfo = isComponent(fieldSchema);
        if (componentInfo.isZone) {
            const componentFields = await processComponentField(key, value, fieldSchema);
            contentFields.push(...componentFields);
            staticContent[key] = value;
        }
    }

    return {
        fields: contentFields,
        keep: staticContent
    };
};

const shouldSkipField = (key: string, value: any): boolean => {
    return DEFAULT_FIELDS.has(key) || isEmpty(value);
};

const isDynamicZone = (fieldSchema: any, value: any) => {
    return {
        isZone: fieldSchema.type === 'dynamiczone',
        hasContent: Array.isArray(value) && value.length > 0,
    }
};

const isComponent = (fieldSchema: any) => {
    return {
        isZone: fieldSchema.type === 'dynamiczone',
        hasContent: true
    }
};



export default processEntryFields;
