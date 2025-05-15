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
import htmlToJson from './htmlToJson';

export async function updateEntry(
  contentTypeID: string,
  entryID: string,
  sourceLocale: string,
  targetLocale: string,
  data: Record<string, any>,
  attributes: Record<string, any>
) {
  if (!entryID) {
    const singleTypeData = await strapi.documents(contentTypeID as any).findFirst();
    entryID = singleTypeData.documentId;
  }

  const originalEntry = await strapi.documents(contentTypeID as any).findFirst({
    documentId: entryID,
    locale: sourceLocale,
  });

  console.log('Original entry:', JSON.stringify(originalEntry, null, 2));

  // Process data recursively to handle blocks in all nested structures
  const processedData = processDataRecursively(data);
  console.log('Processed data:', JSON.stringify(processedData, null, 2));

  // Validate blocks data before update
  for (const [key, value] of Object.entries(processedData)) {
    if (attributes[key]?.type === 'blocks' && typeof value === 'string') {
      console.warn(
        `Field ${key} is a blocks field but received string value. Converting to blocks format.`
      );
      // Use htmlToJson instead of creating a simple paragraph
      processedData[key] = htmlToJson(value);
      console.log(`Converted ${key} blocks:`, JSON.stringify(processedData[key], null, 2));
    }
  }

  // Filter out non-localized fields
  const localizedData: Record<string, any> = {};
  console.log('Available attributes:', Object.keys(attributes));

  for (const field in processedData) {
    console.log(`Checking field ${field}:`, {
      hasAttribute: !!attributes[field],
      pluginOptions: attributes[field]?.pluginOptions,
    });

    // Check if field exists in attributes and is localized
    if (
      attributes[field] &&
      (!attributes[field].pluginOptions?.i18n ||
        attributes[field].pluginOptions?.i18n?.localized !== false)
    ) {
      localizedData[field] = processedData[field];
    }
  }
  console.log('Localized data to update:', JSON.stringify(localizedData, null, 2));

  const newEntry = await strapi.documents(contentTypeID as any).update({
    documentId: entryID,
    locale: targetLocale,
    data: localizedData,
  });
  console.log('');
  console.log('Updated entry:');
  console.log(JSON.stringify(newEntry, null, 2));
  console.log('');

  if (originalEntry.publishedAt !== null) {
    await strapi.documents(contentTypeID as any).publish({
      documentId: entryID,
      locale: sourceLocale,
    });
  }
}

export function processDataRecursively(data: any, schema?: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    if (data[0]?.fields) {
      const processedFields = {};

      for (const fieldData of data[0].fields) {
        if (fieldData.realType === 'blocks') {
          if (fieldData.translatableValue?.[0]) {
            // Convert HTML to blocks structure
            processedFields[fieldData.field] = htmlToJson(fieldData.translatableValue[0]);
            console.log(
              `Converted ${fieldData.field} blocks:`,
              JSON.stringify(processedFields[fieldData.field], null, 2)
            );
          }
        } else {
          processedFields[fieldData.field] = fieldData.translatableValue?.[0] || null;
        }
      }
      return processedFields;
    }
    return data.map((item) => processDataRecursively(item, schema));
  }

  // Process object properties
  const result = {};
  for (const key in data) {
    result[key] = processDataRecursively(data[key], schema);
  }
  return result;
}
