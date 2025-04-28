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
const isFieldLocalizable = (fieldSchema: any, parentSchema: any): boolean => {
  // First check if field has explicit localization setting
  if (fieldSchema.pluginOptions?.i18n?.localized !== undefined) {
    return fieldSchema.pluginOptions.i18n.localized;
  }

  // If field doesn't have explicit setting but parent schema has i18n enabled,
  // then basic content fields are localizable by default
  if (parentSchema.pluginOptions?.i18n?.localized === true) {
    // These are the field types that can be localized
    const localizableTypes = ['string', 'text', 'blocks', 'richtext'];
    return localizableTypes.includes(fieldSchema.type);
  }
  return false;
};

export default isFieldLocalizable;
