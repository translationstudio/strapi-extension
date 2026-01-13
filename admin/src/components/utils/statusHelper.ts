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
    | '';

export const getTranslationStatus = (entryId: string, historyData: any[]): TranslationStatus => {
    if (!Array.isArray(historyData) || historyData.length === 0) {
        return "";
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
    switch (status) {
        case "translated":
            return "success";
        case "in_translation":
            return "secondary";
        default:
            return "neutral";
    }
};

export const getStatusDisplayText = (status: TranslationStatus): string => {
    switch (status) {
        case "translated":
            return "Translated";
        case "in_translation":
            return "In Translation";
        case "not_translated":
            return "Not translated";
        default:
            return "n.a.";
    }
};
