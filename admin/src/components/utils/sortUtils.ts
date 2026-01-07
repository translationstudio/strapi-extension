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
export type SortField =
  | 'project-name'
  | 'element-name'
  | 'element-uid'
  | 'status'
  | 'target-language'
  | 'time-imported';
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

export const getSortValue = (item: any, sortField: SortField): string => {
  if (sortField === 'status') {
    return item.combinedStatus.text.toLowerCase();
  }
  if (sortField === 'target-language') {
    return item.targetLanguages.join(', ').toLowerCase();
  }
  return item[sortField].toString().toLowerCase();
};

export const sortItems = <T extends any>(items: T[], sortState: SortState): T[] => {
  return [...items].sort((a, b) => {
    const aValue = getSortValue(a, sortState.field);
    const bValue = getSortValue(b, sortState.field);
    const result = aValue.localeCompare(bValue);

    return sortState.direction === 'asc' ? result : -result;
  });
};

export const getNextSortState = (currentState: SortState, clickedField: SortField): SortState => {
  if (currentState.field === clickedField) {
    return {
      field: clickedField,
      direction: currentState.direction === 'asc' ? 'desc' : 'asc',
    };
  }

  return {
    field: clickedField,
    direction: 'asc',
  };
};
