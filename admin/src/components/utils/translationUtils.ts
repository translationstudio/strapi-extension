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
  MappingsResponse,
  TranslationRequest,
  TranslationRequestTranslations,
} from '../../../../Types';

export const determineEntryName = (
  fetchedEntryData: any,
  contentTypeDisplayName: string
): string => {
  if (!fetchedEntryData) return 'Untitled';

  // common title field names
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

  return `${contentTypeDisplayName} Entry`;
};

export const createTranslationPayload = (
  selectedLang: MappingsResponse,
  dueDate: number,
  isEmail: boolean,
  isMachineTranslation: boolean,
  email: string,
  isUrgent: boolean,
  contentTypeDisplayName: string,
  entryUid: string,
  entryName: string
): TranslationRequest => {
  const translationObjects: TranslationRequestTranslations[] = selectedLang.targets.map(
    (targetLang) => ({
      source: selectedLang.source,
      target: targetLang,
      connector: selectedLang.connector,
    })
  );

  return {
    duedate: dueDate,
    email: isEmail && !isMachineTranslation ? email : '',
    urgent: isMachineTranslation ? true : isUrgent,
    'project-name': contentTypeDisplayName,
    translations: translationObjects,
    entry: {
      uid: entryUid,
      name: entryName,
    },
  };
};

export const getSubmitLabel = (
  selectedEntriesCount: number,
  isUrgent: boolean,
  isMachineTranslation: boolean
): string => {
  const entryText = selectedEntriesCount === 1 ? 'entry' : 'entries';

  if (isMachineTranslation) return `Translate ${selectedEntriesCount} ${entryText} with AI`;
  else if (isUrgent) return `Translate ${selectedEntriesCount} ${entryText} immediately`;
  else return `Request translation for ${selectedEntriesCount} ${entryText}`;
};

export const createEntryUid = (contentType: any, entryId: string): string => {
  return contentType.kind === 'collectionType' ? `${contentType.uid}#${entryId}` : contentType.uid;
};
