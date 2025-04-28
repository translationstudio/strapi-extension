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
import { TranslationstudioTranslatable } from "../../../../../translationstudio/Types";
import htmlToJson from "./htmlToJson";

export function transformFieldsToData(fields: TranslationstudioTranslatable[]) {
  return fields.reduce((acc, field) => {
    // Handle null or undefined translatableValue
    if (!field.translatableValue) {
      acc[field.field] = "";
      return acc;
    }

    // Handle blocks/richtext fields
    if (field.realType === "blocks") {
      acc[field.field] = htmlToJson(field.translatableValue[0] || "");
    } else if (field.realType === "richtext") {
      acc[field.field] = field.translatableValue[0] || "";
    } else {
      // Join multiple values with spaces for regular fields
      acc[field.field] =
        Array.isArray(field.translatableValue) &&
        field.translatableValue.length > 1
          ? field.translatableValue.join(" ")
          : field.translatableValue[0] || "";
    }
    return acc;
  }, {} as Record<string, any>);
}
