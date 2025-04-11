import parseInlineElements from './parseInlineElements';

function parseHeading(tag: string, innerText: string) {
  const level = parseInt(tag[1]);
  return {
    type: 'heading',
    level,
    children: [{ type: 'text', text: innerText.trim() }],
  };
}

function parseParagraph(innerText: string) {
  return {
    type: 'paragraph',
    children: parseInlineElements(innerText),
  };
}

function parseList(tag: string, innerText: string) {
  const listType = tag === 'ul' ? 'unordered' : 'ordered';
  const listItems: any[] = [];
  const listItemRegex = /<li>(.*?)<\/li>/g;
  let itemMatch;

  while ((itemMatch = listItemRegex.exec(innerText)) !== null) {
    listItems.push({
      type: 'list-item',
      children: parseInlineElements(itemMatch[1]),
    });
  }

  return {
    type: 'list',
    format: listType,
    children: listItems,
  };
}

function htmlToJson(htmlData: string): any[] {
  const jsonData: any[] = [];

  // Parse block elements
  const blockRegex = /<(h[1-3]|p|ul|ol)(?:[^>]*?)>([\s\S]*?)<\/\1>/g;
  let match;

  while ((match = blockRegex.exec(htmlData)) !== null) {
    const [, tag, content] = match;

    switch (tag) {
      case 'h1':
      case 'h2':
      case 'h3':
        jsonData.push(parseHeading(tag, content));
        break;
      case 'p':
        // Process links inside paragraph
        if (content.includes('<a ')) {
          const linkRegex = /<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
          let linkMatch;
          let lastIndex = 0;
          const children = [];

          // Add empty text node at the beginning
          children.push({ type: 'text', text: '' });

          while ((linkMatch = linkRegex.exec(content)) !== null) {
            const [fullMatch, url, linkText] = linkMatch;

            // Add text before link if any
            if (linkMatch.index > lastIndex) {
              const beforeLinkText = content.substring(lastIndex, linkMatch.index);
              if (beforeLinkText) {
                children.push({ type: 'text', text: beforeLinkText });
              }
            }

            // Add the link
            children.push({
              type: 'link',
              url,
              children: [{ type: 'text', text: linkText }],
            });

            lastIndex = linkMatch.index + fullMatch.length;
          }

          // Add text after the last link if any
          const afterLastLink = content.substring(lastIndex);
          if (afterLastLink) {
            children.push({ type: 'text', text: afterLastLink });
          } else {
            // Add empty text node at the end if there's no content after the link
            children.push({ type: 'text', text: '' });
          }

          jsonData.push({
            type: 'paragraph',
            children,
          });
        } else {
          jsonData.push(parseParagraph(content));
        }
        break;
      case 'ul':
      case 'ol':
        jsonData.push(parseList(tag, content));
        break;
    }
  }

  return jsonData;
}

export default htmlToJson;
