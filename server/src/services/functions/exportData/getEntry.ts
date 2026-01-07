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
interface Attribute {
  type: string;
  component?: string;
  components?: string[];
}

interface Schema {
  attributes: Record<string, Attribute>;
}

const getComponentSchema = async (componentName: string): Promise<Schema | null> => {
  try {
    return await strapi.components[componentName];
  } catch (error) {
    strapi.log.error(`Failed to get component schema for ${componentName}:`, error);
    return null;
  }
};

const buildPopulateConfig = async (schema: Schema): Promise<Record<string, any>> => {
  const populate: Record<string, any> = {};

  for (const [fieldName, attribute] of Object.entries(schema.attributes)) {
    if (attribute.type === 'component') {
      const componentSchema = await getComponentSchema(attribute.component);
      if (componentSchema) {
        const nestedPopulate = await buildPopulateConfig(componentSchema);
        populate[fieldName] = {
          populate: Object.keys(nestedPopulate).length ? nestedPopulate : '*',
        };
      } else {
        populate[fieldName] = { populate: '*' };
      }
    } else if (attribute.type === 'dynamiczone') {
      populate[fieldName] = { populate: '*' };
    }
  }

  return populate;
};
const requireTargetEntry = async (
  contentTypeID: string,
  entryID: string | undefined,
  locale: string,
  logError = true
) => {
  try {
    const contentType = await strapi.contentTypes[contentTypeID];
    const populateConfig = await buildPopulateConfig(contentType);

    const query = {
      locale,
      populate: populateConfig,
    };

    if (entryID) {
      Object.assign(query, { documentId: entryID });
    }

    const entry = await strapi.documents(contentTypeID as any).findFirst(query);
    if (entry) return entry;
  } catch (error) {
    strapi.log.error(error.message ?? error);
  }

  if (logError) strapi.log.warn('Could not find entry ' + entryID + ' in locale ' + locale);

  return null;
};

const getEntry = async (
  contentTypeID: string,
  entryID: string | undefined,
  locale: string,
  logError = true
) => {
  try {
    const contentType = await strapi.contentTypes[contentTypeID];
    const populateConfig = await buildPopulateConfig(contentType);

    const query = {
      locale: locale,
      documentId: entryID,
      populate: populateConfig,
    };

    const entry = await strapi.documents(contentTypeID as any).findFirst(query);
    if (entry) {
      strapi.log.info('Obtained ' + contentTypeID + '::' + entryID + ' in ' + locale);
      return entry;
    }
  } catch (error) {
    strapi.log.error(error.message ?? error);
  }

  strapi.log.warn('Could not find entry ' + entryID + ' in locale ' + locale);
  return null;
};

export { requireTargetEntry };
export default getEntry;
