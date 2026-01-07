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
import { getHistoryStatus, getCombinedStatus, StatusInfo } from './historyStatusUtils';

export interface GroupedHistoryItem {
  'element-uid': string;
  'time-imported': number;
  'time-intranslation': number;
  targetLanguages: string[];
  allStatuses: StatusInfo[];
  latestTimeImported: number;
  latestTimeInTranslation: number;
  combinedStatus: StatusInfo;
}

export const groupHistoryData = (historyData: HistoryItem[]): GroupedHistoryItem[] => {
  if (!Array.isArray(historyData) || historyData.length === 0) return [];

  const grouped = historyData.reduce(
    (acc, item) => {
      const key = item['element-uid'];

      if (!acc[key]) {
        acc[key] = {
          ...item,
          targetLanguages: [item['target-language']],
          allStatuses: [getHistoryStatus(item['time-intranslation'], item['time-imported'])],
          latestTimeImported: item['time-imported'],
          latestTimeInTranslation: item['time-intranslation'],
        };
      } else {
        if (!acc[key].targetLanguages.includes(item['target-language'])) {
          acc[key].targetLanguages.push(item['target-language']);
        }

        acc[key].allStatuses.push(
          getHistoryStatus(item['time-intranslation'], item['time-imported'])
        );

        if (item['time-imported'] > acc[key].latestTimeImported) {
          acc[key].latestTimeImported = item['time-imported'];
          acc[key]['time-imported'] = item['time-imported'];
        }

        if (item['time-intranslation'] > acc[key].latestTimeInTranslation) {
          acc[key].latestTimeInTranslation = item['time-intranslation'];
          acc[key]['time-intranslation'] = item['time-intranslation'];
        }
      }

      return acc;
    },
    {} as Record<string, any>
  );

  return Object.values(grouped).map((item: any) => ({
    ...item,
    targetLanguages: item.targetLanguages.sort(),
    combinedStatus: getCombinedStatus(item.allStatuses),
  }));
};
