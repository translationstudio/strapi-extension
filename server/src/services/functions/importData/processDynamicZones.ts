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
import { TranslationstudioTranslatable } from "../../../../../Types";
import { transformFieldsToData } from "./transformFieldsToData";

export function processDynamicZones(
  dynamicZoneFields: Map<number, TranslationstudioTranslatable[]>,
  acc: Record<string, any>,
  existingEntry: any
): Record<string, any> {
  if (dynamicZoneFields.size > 0) {
    const existingDynamicZone = existingEntry?.dynamiczone || [];

    acc.dynamiczone = Array.from(dynamicZoneFields.entries())
      .sort(([a], [b]) => a - b)
      .map(([_, fields]) => {
        // Check if componentInfo exists
        if (!fields[0].uuid) {
          strapi.log.warn(`Component info missing for dynamic zone field: ${fields[0].field}`);
          return null; // Will be filtered out below
        }

        const  schemaName  = fields[0].uuid;
        const componentData = transformFieldsToData(fields);

        // Try to find matching existing component
        const matchingComponent = existingDynamicZone.find(
          (comp: any) => comp.__component === schemaName
        );

        return {
          __component: schemaName,
          ...componentData,
          ...(matchingComponent?.id ? { id: matchingComponent.id } : {}),
        };
      })
      .filter(Boolean); // Remove null entries
  }

  return acc;
}
