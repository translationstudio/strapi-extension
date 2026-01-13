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

const getSortValue = (item: any, sortField: SortField): string|number => {
    switch (sortField) {
        case "project-name":
        case "element-uid":
            return item["element-uid"] ?? "";
        case "status":
            return item["status"] ?? "";
        case "element-name":
            return item["element-name"];
        case "target-language":
            return item["targetLanguage"] ?? "";
        case "time-imported":
            return item.timeUpdated ?? 0;
        default:
            return "";
    }
};

const compareValues = function(a:string|number, b:string|number)
{
    if (typeof a === "number" && typeof b === "number")
        return a - b;
    else
        return (a as string).localeCompare(b as string);
}

export const sortItems = <T extends any>(items: T[], sortState: SortState): T[] => {
    return [...items].sort((a, b) => {
        const aValue = getSortValue(a, sortState.field);
        const bValue = getSortValue(b, sortState.field);
        const result = compareValues(aValue, bValue);
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
