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

const processRegularField = (key: string, value: any, fieldSchema: any) => {
  const translatedValue =
    fieldSchema.type === 'blocks' ? jsonToHtml(value) : value.toString();

  return {
    field: key,
    type: ['richtext', 'blocks'].includes(fieldSchema.type) ? 'html' : 'text',
    translatableValue: [translatedValue],
    realType: fieldSchema.type,
  };
};

const processEntryFields = async (entry: any, schema: any, locale: string) => {
  const contentFields = [];

  for (const [key, value] of Object.entries(entry)) {
    if (shouldSkipField(key, value)) continue;

    const fieldSchema = schema[key];
    if (!fieldSchema) continue;

    if (isDynamicZone(fieldSchema, value, schema)) {
      const zoneFields = await processDynamicZone(key, value as any[], schema);
      contentFields.push(...zoneFields);
      continue;
    }

    if (isComponent(fieldSchema, value, schema)) {
      const componentFields = await processComponentField(key, value, fieldSchema);
      contentFields.push(...componentFields);
      continue;
    }

    if (isTranslatableField(fieldSchema)) {
      const translatedField = processRegularField(key, value, fieldSchema);
      contentFields.push(translatedField);
    }
  }

  return contentFields;
};

const shouldSkipField = (key: string, value: any): boolean => {
  return DEFAULT_FIELDS.has(key) || isEmpty(value);
};

const isDynamicZone = (fieldSchema: any, value: any, schema: any): boolean => {
  return fieldSchema.type === 'dynamiczone' && isFieldLocalizable(fieldSchema, schema) && Array.isArray(value);
};

const isComponent = (fieldSchema: any, value: any, schema: any): boolean => {
  return fieldSchema.type === 'component' && isFieldLocalizable(fieldSchema, schema);
};

export default processEntryFields;
