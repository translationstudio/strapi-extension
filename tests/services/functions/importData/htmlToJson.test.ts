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
import { describe, expect, it, test } from '@jest/globals';
import htmlToJson from '../../../../server/src/services/functions/importData/htmlToJson';

describe('htmlToJson', () => {
  test('should parse headings correctly', () => {
    const html = '<h1>Title</h1><h2>Subtitle</h2><h3>Section</h3>';
    const result = htmlToJson(html);
    expect(result).toEqual([
      {
        type: 'heading',
        level: 1,
        children: [{ type: 'text', text: 'Title' }],
      },
      {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'Subtitle' }],
      },
      {
        type: 'heading',
        level: 3,
        children: [{ type: 'text', text: 'Section' }],
      },
    ]);
  });

  test('should parse paragraphs with formatted text correctly', () => {
    const html =
      '<p><strong>Bold</strong> <em>Italic</em> <u>Underlined</u> <del>Strikethrough</del></p>';
    const result = htmlToJson(html);
    expect(result).toEqual([
      {
        type: 'paragraph',
        children: [
          { type: 'text', text: 'Bold', bold: true },
          { type: 'text', text: ' ' },
          { type: 'text', text: 'Italic', italic: true },
          { type: 'text', text: ' ' },
          { type: 'text', text: 'Underlined', underline: true },
          { type: 'text', text: ' ' },
          { type: 'text', text: 'Strikethrough', strikethrough: true },
        ],
      },
    ]);
  });

  test('should parse lists correctly', () => {
    const html = '<ul><li>Item 1</li><li><strong>Item 2</strong></li></ul>';
    const result = htmlToJson(html);
    expect(result).toEqual([
      {
        type: 'list',
        format: 'unordered',
        children: [
          { type: 'list-item', children: [{ type: 'text', text: 'Item 1' }] },
          {
            type: 'list-item',
            children: [{ type: 'text', text: 'Item 2', bold: true }],
          },
        ],
      },
    ]);
  });

  test('should parse links correctly', () => {
    const html = '<p><a href="https://example.com">Link text</a></p>';
    const result = htmlToJson(html);
    expect(result).toEqual([
      {
        type: 'paragraph',
        children: [
          {
            type: 'link',
            url: 'https://example.com',
            children: [{ type: 'text', text: 'Link text' }],
          },
        ],
      },
    ]);
  });

  it('should convert simple paragraph HTML to JSON blocks', () => {
    const html = '<p>Simple paragraph</p>';
    const result = htmlToJson(html);

    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('type', 'paragraph');
    expect(result[0].children[0]).toHaveProperty('text', 'Simple paragraph');
  });

  it('should convert formatting elements correctly', () => {
    const html = '<p><strong>Bold</strong> and <em>italic</em> text</p>';
    const result = htmlToJson(html);

    // The actual output has 4 elements, not 3 (Bold, and, italic, text)
    expect(result[0].children).toHaveLength(4);
    expect(result[0].children[0]).toHaveProperty('bold', true);
    expect(result[0].children[0]).toHaveProperty('text', 'Bold');

    expect(result[0].children[1]).toHaveProperty('text', ' and ');

    expect(result[0].children[2]).toHaveProperty('italic', true);
    expect(result[0].children[2]).toHaveProperty('text', 'italic');

    expect(result[0].children[3]).toHaveProperty('text', ' text');
  });

  it('should convert nested structures', () => {
    const html = '<h2>Heading</h2><ul><li>Item 1</li><li>Item 2</li></ul>';
    const result = htmlToJson(html);

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty('type', 'heading');
    expect(result[1]).toHaveProperty('type', 'list');
  });
});
