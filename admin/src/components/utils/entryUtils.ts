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
export const determineEntryName = (
  fetchedEntryData: any,
  contentTypeDisplayName: string,
  entryId: string
): string => {
  if (!fetchedEntryData) return 'Untitled';

  const commonTitleFields = ['title', 'name', 'headline'];
  for (const field of commonTitleFields) {
    const key = Object.keys(fetchedEntryData).find((k) => k.toLowerCase() === field);
    if (key && typeof fetchedEntryData[key] === 'string' && fetchedEntryData[key].trim()) {
      return fetchedEntryData[key];
    }
  }

  const excludedFields = [
    'id',
    'createdAt',
    'updatedAt',
    'publishedAt',
    'locale',
    'createdBy',
    'updatedBy',
    'documentId',
    'provider',
    'resetPasswordToken',
    'confirmationToken',
    'password',
    'email',
    'slug',
    'link',
    'url',
    'image',
    'file',
    'media',
  ];

  for (const [key, value] of Object.entries(fetchedEntryData)) {
    if (!excludedFields.includes(key) && typeof value === 'string' && value.trim()) {
      return value;
    }
  }
  return `${contentTypeDisplayName} #${entryId}`;
};

export const createEntryUid = (isCollectionType: boolean, model: string, id: string): string => {
  return isCollectionType ? `${model}#${id}` : model;
};
