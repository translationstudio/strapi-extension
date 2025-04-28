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
import jsonToHtml from "./jsonToHtml";

const processComponent = async (
  fieldName: string,
  componentName: string,
  value: any,
  schemaName: string,
  componentId?: number
): Promise<TranslationstudioTranslatable[]> => {
  const contentFields: TranslationstudioTranslatable[] = [];

  const componentSchema = await strapi.components[componentName as any];

  if (!componentSchema) {
    throw new Error(`Component schema not found for ${componentName}`);
  }

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
        item.id
      );
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
      componentId
    );
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
  schemaName: string
): TranslationstudioTranslatable => {
  return {
    field: key,
    type: ["richtext", "blocks"].includes(fieldSchema.type) ? "html" : "text",
    translatableValue: [value],
    realType: fieldSchema.type,
    componentInfo: {
      namePath: parentPath,
      id: componentId,
      schemaName: schemaName,
    },
  };
};

const processComponentFields = async (
  componentData: any,
  schema: Record<string, FieldSchema>,
  parentField: string,
  componentName: string,
  schemaName: string,
  componentId?: number
): Promise<TranslationstudioTranslatable[]> => {
  const contentFields: TranslationstudioTranslatable[] = [];
  const parentPath = parentField.split(".");

  for (const [key, fieldSchema] of Object.entries(schema)) {
    if (shouldSkipField(key, fieldSchema)) continue;

    const value = componentData?.[key];
    const fieldPath = `${parentField}.${key}`;

    if (fieldSchema.type === "component") {
      if (!fieldSchema.component) continue;

      const nestedFields = await processComponent(
        fieldPath,
        fieldSchema.component,
        value || {},
        fieldSchema.component,
        value?.id
      );
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
      parentPath,
      componentId,
      schemaName
    );
    contentFields.push(translatable);
  }

  return contentFields;
};

export default processComponent;
