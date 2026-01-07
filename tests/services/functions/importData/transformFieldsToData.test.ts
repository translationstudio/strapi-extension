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
import { describe, test, expect } from '@jest/globals';
import { transformFieldsToData } from '../../../../server/src/services/functions/importData/transformFieldsToData';

describe('transformFieldsToData', () => {
  test('should transform single value fields', () => {
    const fields = [
      { field: 'title', translatableValue: ['Hello'] },
      { field: 'description', translatableValue: ['World'] },
    ];

    const result = transformFieldsToData(fields as any);

    expect(result).toEqual({
      title: 'Hello',
      description: 'World',
    });
  });

  test('should join array values with space', () => {
    const fields = [{ field: 'title', translatableValue: ['Hello', 'World'] }];

    const result = transformFieldsToData(fields as any);

    expect(result).toEqual({
      title: 'Hello World',
    });
  });

  test('should handle empty values', () => {
    const fields = [
      { field: 'title', translatableValue: [] },
      { field: 'description', translatableValue: null },
    ];

    const result = transformFieldsToData(fields as any);

    expect(result).toEqual({
      title: '',
      description: '',
    });
  });
});
