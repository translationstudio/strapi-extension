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
 * @returns {ContentNode[]} - Array of structured text elements
 */
interface TextNode {
  type: 'text';
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
  strikethrough?: boolean;
}

interface LinkNode {
  type: 'link';
  url: string;
  children: TextNode[];
}

type ContentNode = TextNode | LinkNode;

function parseInlineElements(text: string): ContentNode[] {
  const elements: ContentNode[] = [];

  // Add empty text node at start
  elements.push({ type: 'text', text: '' });

  // Parse inline elements including nested formatting in links
  const regex =
    /<a\s+href="([^"]+)">(.*?)<\/a>|<(strong|em|u|code|del)>(.*?)<\/\3>|~~([^~]+)~~|([^<~]+)/gs;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const [full, href, linkContent, tag, content, strikethrough, plainText] = match;

    if (href && linkContent) {
      // Handle link with potential nested formatting
      const linkChildren = parseInlineElements(linkContent).filter(
        (node) => node.type === 'text' && node.text !== ''
      );

      elements.push({
        type: 'link',
        url: href,
        children: linkChildren as TextNode[],
      });
    } else if (tag && content) {
      // Handle regular formatting tags
      const textNode: TextNode = { type: 'text', text: content };
      switch (tag) {
        case 'strong':
          textNode.bold = true;
          break;
        case 'em':
          textNode.italic = true;
          break;
        case 'u':
          textNode.underline = true;
          break;
        case 'code':
          textNode.code = true;
          break;
        case 'del':
          textNode.strikethrough = true;
          break;
      }
      elements.push(textNode);
    } else if (strikethrough) {
      elements.push({ type: 'text', text: strikethrough, strikethrough: true });
    } else if (plainText) {
      if (plainText.trim()) {
        elements.push({ type: 'text', text: plainText });
      } else if (plainText.includes(' ')) {
        elements.push({ type: 'text', text: plainText });
      }
    }
  }

  // Add empty text node at end
  elements.push({ type: 'text', text: '' });

  return elements;
}

export default parseInlineElements;
