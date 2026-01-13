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
import { HistoryItem } from '../../../../Types';
import { TranslationStatus } from './historyStatusUtils';

export type GroupedHistoryItem = {
    "element-name": string;
    'element-uid': string;
    timeUpdated:number;
    targetLanguage: string;
    status: TranslationStatus;
    id: string;
}

export function getElementStatus(elem:HistoryItem) : TranslationStatus
{
     if (elem['time-imported'] >= elem['time-intranslation'] && elem['time-imported'] >= elem['time-requested']) {
        return 'translated';
    }

    if (elem['time-intranslation'] >= elem['time-imported'] && elem['time-intranslation'] >= elem['time-requested'])
        return 'intranslation';

    return "queued";
}

export const groupHistoryData = (historyData: HistoryItem[]): GroupedHistoryItem[] => {
    
    if (!Array.isArray(historyData) || historyData.length === 0) 
        return [];

    const list:GroupedHistoryItem[] = [];
    
    for (const elem of historyData) {
        const status = getElementStatus(elem);

        const val:GroupedHistoryItem = {
            "element-name": elem['element-name'],
            'element-uid': elem['element-uid'],
            timeUpdated: elem['time-updated'],
            targetLanguage: elem['target-language'],
            status: status,
            id: elem.id
        }

        list.push(val);
    }

    return list;
};
