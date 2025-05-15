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
import parseInlineElements from './parseInlineElements';

export default function htmlToJson(html: string): any[] {
  // Helper function to parse HTML string
  function parseHTML(html: string): { tag: string; attrs: any; content: string }[] {
    const elements: { tag: string; attrs: any; content: string }[] = [];
    const tagRegex = /<([a-z]+)((?:\s+[a-z-]+="[^"]*")*)\s*>([\s\S]*?)<\/\1>/gi;
    let match;

    while ((match = tagRegex.exec(html)) !== null) {
      const [, tag, attributes, content] = match;
      const attrs: any = {};

      // Parse attributes
      const attrRegex = /([a-z-]+)="([^"]*)"/gi;
      let attrMatch;
      while ((attrMatch = attrRegex.exec(attributes)) !== null) {
        attrs[attrMatch[1]] = attrMatch[2];
      }

      elements.push({ tag, attrs, content });
    }
    return elements;
  }

  function parseFormattedText(text: string): any {
    const textNode: any = { type: 'text', text };

    // Check for formatting
    if (text.includes('<strong>') || text.includes('**')) textNode.bold = true;
    if (text.includes('<em>') || text.includes('*')) textNode.italic = true;
    if (text.includes('<u>') || text.includes('_')) textNode.underline = true;
    if (text.includes('<code>') || text.includes('`')) textNode.code = true;
    if (text.includes('<del>') || text.includes('~~')) textNode.strikethrough = true;

    // Clean up the text by removing HTML tags
    textNode.text = text
      .replace(/<[^>]+>/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/_/g, '')
      .replace(/`/g, '')
      .replace(/~~/g, '');

    return textNode;
  }

  function parseList(html: string, format: 'ordered' | 'unordered'): any {
    const listItems = html.match(/<li>([\s\S]*?)<\/li>/g) || [];

    return {
      type: 'list',
      format,
      children: listItems.map((item) => ({
        type: 'list-item',
        children: parseListContent(item.replace(/<li>|<\/li>/g, '')),
      })),
    };
  }

  function parseListContent(content: string): any[] {
    const children = [{ type: 'text', text: '' }];

    // Parse links first
    const linkRegex = /<a\s+href="([^"]+)">([\s\S]*?)<\/a>/g;
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const [fullMatch, href, linkText] = match;

      // Add any text before the link
      if (match.index > lastIndex) {
        const textBefore = content.slice(lastIndex, match.index);
        if (textBefore) {
          children.push(parseFormattedText(textBefore));
        }
      }

      // Add the link
      children.push({
        type: 'link',
        url: href,
        children: [parseFormattedText(linkText)],
      });

      lastIndex = match.index + fullMatch.length;
    }

    // Add any remaining text
    if (lastIndex < content.length) {
      const remainingText = content.slice(lastIndex);
      if (remainingText) {
        children.push(parseFormattedText(remainingText));
      }
    }

    children.push({ type: 'text', text: '' });
    return children;
  }

  const blocks: any[] = [];
  const elements = parseHTML(html);

  for (const element of elements) {
    switch (element.tag.toLowerCase()) {
      case 'ul':
        blocks.push(parseList(element.content, 'unordered'));
        break;
      case 'ol':
        blocks.push(parseList(element.content, 'ordered'));
        break;
      // Add other block types if needed
    }
  }

  return blocks;
}
