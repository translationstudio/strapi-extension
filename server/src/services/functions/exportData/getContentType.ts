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
export interface IStrapiSchemaField {
    "type": string;
    "components"?: string[];
    "pluginOptions"?: {
        "i18n"?: {
            "localized": boolean;
        }
    }
}

export interface IStrapiSchemaEntryAttributes {
    [fieldName: string]: IStrapiSchemaField;
}

export interface IStrapiSchemaEntry {
    "kind": string;
    "collectionName": string;
    "pluginOptions": {
        "i18n"?: {
            "localized": boolean;
        }
    },
    "attributes": IStrapiSchemaEntryAttributes
}

export interface IStrapiComponentSchemaMap {
    [name:string] : IStrapiSchemaEntry
}
export interface IStrapiSchema {
    "entry": IStrapiSchemaEntry,
    "components": IStrapiComponentSchemaMap;
}

function getComponentSchemata(schema:IStrapiSchemaEntry) {
    const res:IStrapiComponentSchemaMap = { };
    
    for (let fieldName in schema.attributes)
    {
        const field = schema.attributes[fieldName];
        if (!field.components || !Array.isArray(field.components) || field.components.length === 0)
            continue;

        for (let type of field.components)
        {
            const schema = strapi.components[type];
            if (schema && schema.attributes)
                res[type] = schema;
        }
    }

    return res;
}


export default function getContentType(contentTypeID: string):IStrapiSchema|null {
    
    const contentType = strapi.contentType(contentTypeID as any);
    if (!contentType?.attributes)
    {
        strapi.log.error(`Content type or schema not found: ${contentTypeID}`);
        return null;
    }

    const res:IStrapiSchema = {
        entry: contentType as IStrapiSchemaEntry,
        components: getComponentSchemata(contentType as IStrapiSchemaEntry)
    }

    strapi.log.info("SChema loaded for " + contentTypeID + ". Component schemata loaded: " + Object.keys(res.components).length);
    return res;
};

