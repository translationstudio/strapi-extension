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
    console.error(`Failed to get component schema for ${componentName}:`, error);
    return null;
  }
};

const buildPopulateConfig = async (schema: Schema): Promise<Record<string, any>> => {
  const populate: Record<string, any> = {};

  for (const [fieldName, attribute] of Object.entries(schema.attributes)) {
    if (attribute.type === 'component') {
      const componentSchema = await getComponentSchema(attribute.component);
      if (componentSchema) {
        // Recursively build populate for nested components
        const nestedPopulate = await buildPopulateConfig(componentSchema);
        populate[fieldName] = {
          populate: Object.keys(nestedPopulate).length ? nestedPopulate : '*',
        };
      } else {
        populate[fieldName] = { populate: '*' };
      }
    } else if (attribute.type === 'dynamiczone') {
      // For dynamic zones, always use '*' for population
      // This addresses the error with polymorphic structures
      populate[fieldName] = { populate: '*' };
    }
  }

  return populate;
};

const getEntry = async (contentTypeID: string, entryID: string | undefined, locale: string) => {
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

    return entry;
  } catch (error) {
    console.error('Entry fetch error:', error);
    return null;
  }
};

export default getEntry;
