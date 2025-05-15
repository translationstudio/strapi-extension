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
/**
 * Parses HTML and markdown-formatted text into a structured format for richtext fields
 * @param {string} text - The HTML/markdown text to parse
 * @returns {any[]} - Array of structured text elements
 */
function parseInlineElements(text: string): any[] {
  const elements: any[] = [];

  // Add empty text node at start
  elements.push({ type: 'text', text: '' });

  // Parse inline elements
  const regex =
    /<(strong|em|u|code|del|a)\s*(?:href="([^"]+)")?>([^<]+)<\/\1>|~~([^~]+)~~|([^<~]+)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const [, tag, href, content, strikethrough, plainText] = match;

    if (plainText) {
      elements.push({ type: 'text', text: plainText });
    } else if (strikethrough) {
      elements.push({ type: 'text', text: strikethrough, strikethrough: true });
    } else if (tag === 'a') {
      elements.push({
        type: 'link',
        url: href,
        children: [
          {
            type: 'text',
            text: content,
            // Parse formatting within link text
            ...(content.includes('**') && { bold: true }),
            ...(content.includes('*') && { italic: true }),
            ...(content.includes('_') && { underline: true }),
            ...(content.includes('~~') && { strikethrough: true }),
            ...(content.includes('`') && { code: true }),
          },
        ],
      });
    } else {
      const textNode = { type: 'text', text: content };
      switch (tag) {
        case 'strong':
          textNode['bold'] = true;
          break;
        case 'em':
          textNode['italic'] = true;
          break;
        case 'u':
          textNode['underline'] = true;
          break;
        case 'code':
          textNode['code'] = true;
          break;
      }
      elements.push(textNode);
    }
  }

  // Add empty text node at end
  elements.push({ type: 'text', text: '' });

  return elements;
}

export default parseInlineElements;
