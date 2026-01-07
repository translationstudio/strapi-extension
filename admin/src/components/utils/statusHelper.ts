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
import { formatDate } from './formatDate';

export type TranslationStatus =
  | 'translated'
  | 'in_translation'
  | 'not_translated'
  | 'error_fetching_history';

export const getTranslationStatus = (entryId: string, historyData: any[]): TranslationStatus => {
  if (!Array.isArray(historyData) || historyData.length === 0) {
    return 'error_fetching_history';
  }

  const matchingItems = historyData.filter((h: any) => h['element-uid'].includes(entryId));

  if (matchingItems.length === 0) {
    return 'not_translated';
  }

  const hasInTranslation = matchingItems.some((item: any) => {
    const timeInTranslation = item['time-intranslation'] || 0;
    const timeImported = item['time-imported'] || 0;
    return timeInTranslation > timeImported;
  });

  if (hasInTranslation) {
    return 'in_translation';
  }

  const hasTranslated = matchingItems.some((item: any) => {
    const timeImported = item['time-imported'] || 0;
    return timeImported > 0;
  });

  return hasTranslated ? 'translated' : 'not_translated';
};

export const getTargetLanguages = (entryId: string, historyData: any[]): string[] => {
  if (!Array.isArray(historyData) || historyData.length === 0) return [];

  const matchingItems = historyData.filter((h: any) => h['element-uid'].includes(entryId));
  const languages = [...new Set(matchingItems.map((item: any) => item['target-language']))];

  return languages.sort();
};

export const getTranslationDate = (entryId: string, historyData: any[]): string => {
  if (!Array.isArray(historyData) || historyData.length === 0) return '';

  const matchingItems = historyData.filter((h: any) => h['element-uid'].includes(entryId));
  if (matchingItems.length === 0) return '';

  const latestImportTime = Math.max(
    ...matchingItems.map((item: any) => item['time-imported'] || 0)
  );

  return latestImportTime > 0 ? formatDate(latestImportTime) : '';
};

export const getStatusBadgeVariant = (status: TranslationStatus): string => {
  const variants = {
    translated: 'success',
    in_translation: 'secondary',
    error_fetching_history: 'danger',
    not_translated: 'neutral',
  };
  return variants[status] || 'neutral';
};

export const getStatusDisplayText = (status: TranslationStatus): string => {
  const texts = {
    translated: 'Translated',
    in_translation: 'In Translation',
    error_fetching_history: 'Error fetching history',
    not_translated: 'Not Translated',
  };
  return texts[status] || 'Not Translated';
};
