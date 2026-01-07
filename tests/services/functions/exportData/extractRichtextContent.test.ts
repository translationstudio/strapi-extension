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
import extractRichtextContent from '../../../../server/src/services/functions/exportData/extractRichtextContent';
import { describe, test, expect } from '@jest/globals';

describe('extractRichtextContent', () => {
  test('should extract text from a single node with text', () => {
    const input = { text: 'Hello world' };
    expect(extractRichtextContent(input)).toEqual(['Hello world']);
  });

  test('should extract text from nested children', () => {
    const input = {
      children: [{ text: 'Hello' }, { text: 'world' }],
    };
    expect(extractRichtextContent(input)).toEqual(['Hello', 'world']);
  });

  test('should handle an array of nodes', () => {
    const input = [
      { text: 'First' },
      {
        children: [{ text: 'Second' }, { text: 'Third' }],
      },
    ];
    expect(extractRichtextContent(input)).toEqual(['First', 'Second', 'Third']);
  });

  test('should return empty array for empty input', () => {
    expect(extractRichtextContent({})).toEqual([]);
    expect(extractRichtextContent([])).toEqual([]);
  });

  test('should handle deeply nested structure', () => {
    const input = {
      children: [
        {
          children: [{ text: 'Deeply' }, { text: 'nested' }],
        },
        { text: 'content' },
      ],
    };
    expect(extractRichtextContent(input)).toEqual(['Deeply', 'nested', 'content']);
  });
});
