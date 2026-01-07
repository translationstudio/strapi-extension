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
export const getSearchableText = (item: any): string => {
  return `${item['project-name']} ${item['element-name']} ${item['element-uid']} ${item.targetLanguages.join(' ')} ${item.combinedStatus.text}`.toLowerCase();
};

export const filterBySearchTerm = <T extends any>(
  items: T[],
  searchTerm: string,
  getSearchableText: (item: T) => string
): T[] => {
  if (!searchTerm.trim()) return items;

  const lowerSearchTerm = searchTerm.toLowerCase();
  return items.filter((item) => getSearchableText(item).includes(lowerSearchTerm));
};
