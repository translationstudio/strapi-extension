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
import { Entry } from '../../../../Types';

export const getEntryTitle = (entry: Entry): string => {
  const titleFields = ['title', 'name', 'headline'];

  for (const field of titleFields) {
    if (entry[field] && typeof entry[field] === 'string') {
      return entry[field];
    }
  }

  const excludedFields = ['id', 'documentId', 'createdAt', 'updatedAt', 'publishedAt', 'locale'];
  for (const [key, value] of Object.entries(entry)) {
    if (!excludedFields.includes(key) && typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return `Entry #${entry.documentId || entry.id}`;
};

export const getEntryId = (entry: Entry): string => {
  return entry.documentId || entry.id;
};
