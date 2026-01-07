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
export type StatusVariant = 'success' | 'warning' | 'neutral';

export interface StatusInfo {
  text: string;
  variant: StatusVariant;
}

export const getHistoryStatus = (timeInTranslation: number, timeImported: number): StatusInfo => {
  if (timeInTranslation < timeImported) {
    return { text: 'Translated', variant: 'success' };
  }
  if (timeInTranslation > timeImported) {
    return { text: 'In translation', variant: 'warning' };
  }
  return { text: '', variant: 'neutral' };
};

export const getCombinedStatus = (allStatuses: StatusInfo[]): StatusInfo => {
  if (allStatuses.some((s) => s.text === 'In translation')) {
    return { text: 'In translation', variant: 'warning' };
  }
  if (allStatuses.some((s) => s.text === 'Translated')) {
    return { text: 'Translated', variant: 'success' };
  }
  return { text: '', variant: 'neutral' };
};
