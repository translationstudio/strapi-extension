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

export default function htmlToJson(html: string): any[] {
  function parseHTML(html: string): { tag: string; attrs: any; content: string }[] {
    const elements: { tag: string; attrs: any; content: string }[] = [];
    const tagRegex = /<([a-z0-9]+)((?:\s+[a-z-]+="[^"]*")*)\s*>([\s\S]*?)<\/\1>/gi;
    let match;

    while ((match = tagRegex.exec(html)) !== null) {
      const [, tag, attributes, content] = match;
      const attrs: any = {};

      const attrRegex = /([a-z-]+)="([^"]*)"/gi;
      let attrMatch;
      while ((attrMatch = attrRegex.exec(attributes)) !== null) {
        attrs[attrMatch[1]] = attrMatch[2];
      }

      elements.push({ tag, attrs, content });
    }
    return elements;
  }

  function parseInlineContent(content: string): any[] {
    const segments: any[] = [];
    let currentText = '';
    let formatStack: { type: string; index: number }[] = [];
    let currentFormat = {
      bold: false,
      italic: false,
      underline: false,
      code: false,
      strikethrough: false,
    };

    const pushSegment = () => {
      if (currentText) {
        segments.push({
          type: 'text',
          text: currentText,
          ...Object.fromEntries(Object.entries(currentFormat).filter(([_, value]) => value)),
        });
        currentText = '';
      }
    };

    const tags = content.split(/(<[^>]+>|~~)/);

    for (const tag of tags) {
      if (!tag) continue;

      if (tag === '~~') {
        pushSegment();
        currentFormat.strikethrough = !currentFormat.strikethrough;
        continue;
      }

      if (tag.startsWith('<')) {
        pushSegment();

        if (tag.startsWith('</')) {
          const tagName = tag.slice(2, -1).toLowerCase();
          const lastTag = formatStack.pop();
          if (lastTag && lastTag.type === tagName) {
            switch (tagName) {
              case 'strong':
                currentFormat.bold = false;
                break;
              case 'em':
                currentFormat.italic = false;
                break;
              case 'u':
                currentFormat.underline = false;
                break;
              case 'code':
                currentFormat.code = false;
                break;
              case 'del':
                currentFormat.strikethrough = false;
                break;
            }
          }
        } else {
          const tagName = tag.slice(1, -1).toLowerCase();
          formatStack.push({ type: tagName, index: segments.length });
          switch (tagName) {
            case 'strong':
              currentFormat.bold = true;
              break;
            case 'em':
              currentFormat.italic = true;
              break;
            case 'u':
              currentFormat.underline = true;
              break;
            case 'code':
              currentFormat.code = true;
              break;
            case 'del':
              currentFormat.strikethrough = true;
              break;
          }
        }
      } else {
        currentText += tag;
      }
    }

    pushSegment();
    return segments.filter((segment) => segment.text.length > 0);
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
    const children = [];
    const linkRegex = /<a\s+href="([^"]+)">([\s\S]*?)<\/a>/g;
    let lastIndex = 0;
    let match: any;

    while ((match = linkRegex.exec(content)) !== null) {
      const [fullMatch, href, linkText] = match;

      if (match.index > lastIndex) {
        const textBefore = content.slice(lastIndex, match.index);
        if (textBefore.trim()) {
          children.push(...parseInlineContent(textBefore));
        }
      }

      children.push({
        type: 'link',
        url: href,
        children: parseInlineContent(linkText),
      });

      lastIndex = match.index + fullMatch.length;
    }

    if (lastIndex < content.length) {
      const remainingText = content.slice(lastIndex);
      if (remainingText.trim()) {
        children.push(...parseInlineContent(remainingText));
      }
    }

    return children;
  }

  function parseParagraph(content: string): any {
    return {
      type: 'paragraph',
      children: parseListContent(content),
    };
  }

  const blocks: any[] = [];
  const elements = parseHTML(html);

  if (elements.length === 0 && html.trim()) {
    blocks.push(parseParagraph(html));
    return blocks;
  }

  for (const element of elements) {
    switch (element.tag.toLowerCase()) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        blocks.push({
          type: 'heading',
          level: parseInt(element.tag.slice(1)),
          children: parseListContent(element.content),
        });
        break;
      case 'p':
        blocks.push(parseParagraph(element.content));
        break;
      case 'ul':
        blocks.push(parseList(element.content, 'unordered'));
        break;
      case 'ol':
        blocks.push(parseList(element.content, 'ordered'));
        break;
      case 'blockquote':
        blocks.push({
          type: 'quote',
          children: [parseParagraph(element.content)],
        });
        break;
      case 'pre':
        if (element.content.includes('<code>')) {
          blocks.push({
            type: 'code',
            children: parseInlineContent(element.content),
          });
        }
        break;
      default:
        blocks.push(parseParagraph(element.content));
    }
  }

  return blocks;
}
