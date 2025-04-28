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
  OrganizedFields,
  TranslationstudioTranslatable,
} from "../../../../../Types";

export function organizeFields(
  fields: TranslationstudioTranslatable[]
): OrganizedFields {
  const componentFieldsMap = new Map<string, TranslationstudioTranslatable[]>();
  const dynamicZoneFields = new Map<number, TranslationstudioTranslatable[]>();
  const regularFields: TranslationstudioTranslatable[] = [];

  fields.forEach((field: TranslationstudioTranslatable) => {
    if (!field.componentInfo) {
      regularFields.push(field);
      return;
    }

    const { namePath, id } = field.componentInfo;
    const pathString = namePath.join(".");

    if (namePath[0] === "dynamiczone") {
      if (!dynamicZoneFields.has(id)) {
        dynamicZoneFields.set(id, []);
      }
      dynamicZoneFields.get(id)?.push(field);
    } else {
      if (!componentFieldsMap.has(pathString)) {
        componentFieldsMap.set(pathString, []);
      }
      componentFieldsMap.get(pathString)?.push(field);
    }
  });

  return { regularFields, componentFieldsMap, dynamicZoneFields };
}
