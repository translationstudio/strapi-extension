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
import { TranslationstudioTranslatable } from '../../../../../Types';
import { IStrapiComponentSchemaMap, IStrapiSchema, IStrapiSchemaEntry, IStrapiSchemaEntryAttributes, IStrapiSchemaField } from './getContentType';

const Logger = {
    log: typeof strapi !== "undefined" ? strapi.log : console,
    info: (val:any) => Logger.log.info(val),
    warn: (val:any) => Logger.log.warn(val),
    error: (val:any) => Logger.log.error(val),
    debug: (val:any) => Logger.log.debug(val)
}

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

const isSimpleTranslatableField = (fieldSchema: IStrapiSchemaField) =>
    ['string', 'text', 'blocks', 'richtext'].includes(fieldSchema.type) &&
    fieldSchema.pluginOptions?.i18n?.localized === true;

const processDynamicZone = async (key: string, value: any[], schemata: IStrapiComponentSchemaMap) => {
    const results = [];

    for (const component of value) {
        const componentName = component?.__component;
        if (!componentName) continue;

        const schema = schemata[componentName];
        if (!schema) continue;

        const fields = await processComponent(
            key,
            component,
            schema,
            schemata
        );
        if (fields.length > 0)
            results.push(...fields);
    }

    return results;
};

const processComponentField = async (key: string, value: any, fieldSchema: any, schemata: IStrapiComponentSchemaMap) => {
    const results = [];

    const candidates: any[] = Array.isArray(value) ? value : [value];

    for (const component of candidates) {
        const componentName = component?.__component;
        if (!componentName) continue;

        const schema = schemata[componentName];
        if (!schema) continue;

        const fields = await processComponent(
            key,
            component,
            schema,
            schemata
        );
        if (fields.length > 0)
            results.push(...fields);
    }

    return results;
};

const processRegularField = (key: string, value: any, fieldSchema: IStrapiSchemaField): TranslationstudioTranslatable => {
    const translatedValue =
        fieldSchema.type === 'blocks' ? jsonToHtml(value) : value.toString();

    return {
        field: key,
        type: ['richtext', 'blocks'].includes(fieldSchema.type) ? 'html' : 'text',
        translatableValue: [translatedValue],
        realType: fieldSchema.type,
    };
};

export function IsLocalisableSchema(schema: IStrapiSchemaEntry) {
    return schema.pluginOptions?.i18n?.localized === true;
}

function IsLocalisedField(field: IStrapiSchemaField) {
    return field.pluginOptions?.i18n?.localized === true;
}

const processEntryFields = async (entry: any, schemaData: IStrapiSchema, _locale: string): Promise<ExportedDocumentFields> => {
    const contentFields = [];
    const staticContent: any = {};

    const schema = schemaData.entry.attributes;
    for (const [key, value] of Object.entries(entry)) {
        if (shouldSkipField(key, value))
            continue;

        const fieldSchema = schema[key];

        /** skip non-localisable fields */
        if (!fieldSchema || !IsLocalisedField(fieldSchema))
        {
            Logger.debug("SKipping non-local field " + key);
            continue;
        }

        if (isSimpleTranslatableField(fieldSchema)) {
            Logger.debug("Processing simple field "+ key);
            const translatedField = processRegularField(key, value, fieldSchema);
            contentFields.push(translatedField);

            continue;
        }

        const zoneInfo = isDynamicZone(fieldSchema, value);
        if (zoneInfo.isZone) {
            if (zoneInfo.hasContent) {
                Logger.debug("Processing dynamic zone field "+ key);

                const zoneFields = await processDynamicZone(key, value as any[], schemaData.components);
                contentFields.push(...zoneFields);
                staticContent[key] = value;
            }

            continue;
        }

        const componentInfo = isComponent(fieldSchema);
        if (componentInfo.isZone) {
            const componentFields = await processComponentField(key, value, fieldSchema, schemaData.components);
            contentFields.push(...componentFields);
            staticContent[key] = value;
        }
    }

    Logger.info("Process completed");
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
