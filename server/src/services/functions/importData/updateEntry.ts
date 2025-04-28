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

  // Process data recursively to handle blocks in all nested structures
  const processedData = processDataRecursively(data);

  // Filter out non-localized fields
  const localizedData: Record<string, any> = {};

  for (const field in processedData) {
    // Check if field exists in attributes and is localized
    if (
      attributes[field] &&
      (!attributes[field].pluginOptions?.i18n ||
        attributes[field].pluginOptions?.i18n?.localized !== false)
    ) {
      localizedData[field] = processedData[field];
    }
  }

  await strapi.documents(contentTypeID as any).update({
    documentId: entryID,
    locale: targetLocale,
    data: localizedData,
  });

  if (originalEntry.publishedAt !== null) {
    await strapi.documents(contentTypeID as any).publish({
      documentId: entryID,
      locale: sourceLocale,
    });
  }
}

export function processDataRecursively(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // Handle arrays (for repeatable components and dynamic zones)
  if (Array.isArray(data)) {
    return data.map((item) => processDataRecursively(item));
  }

  // Process object properties
  const result: Record<string, any> = {};

  for (const key in data) {
    const value = data[key];

    if (
      typeof value === 'string' &&
      (key.includes('Blocks') || key.includes('RTBlocks') || key === 'blocks')
    ) {
      // Convert HTML to JSON structure expected by Strapi blocks
      result[key] = htmlToJson(value);
    }
    // Handle nested objects (components, etc.)
    else if (value && typeof value === 'object') {
      result[key] = processDataRecursively(value);
    }
    // Keep other values as is
    else {
      result[key] = value;
    }
  }

  return result;
}
