function parseInlineElements(text: string): any[] {
  // If text is plain with no HTML tags, return it as is
  if (!text.includes('<')) {
    return [{ type: 'text', text }];
  }

  // Process links first (as they might contain formatting)
  const linkRegex = /<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  if (text.includes('<a ')) {
    let linkMatch;
    let lastIndex = 0;
    const elements = [];

    while ((linkMatch = linkRegex.exec(text)) !== null) {
      const [fullMatch, url, linkContent] = linkMatch;

      // Add any text before this link
      if (linkMatch.index > lastIndex) {
        const beforeText = text.substring(lastIndex, linkMatch.index);
        if (beforeText) {
          elements.push(...parseInlineElements(beforeText));
        }
      }

      // Add the link
      elements.push({
        type: 'link',
        url,
        children: parseInlineElements(linkContent),
      });

      lastIndex = linkMatch.index + fullMatch.length;
    }

    // Add any remaining text after the last link
    if (lastIndex < text.length) {
      const afterText = text.substring(lastIndex);
      if (afterText) {
        elements.push(...parseInlineElements(afterText));
      }
    }

    return elements;
  }

  // Process formatting tags
  const formatRegex = /<(strong|em|u|del)>([\s\S]*?)<\/\1>/;
  const match = formatRegex.exec(text);

  if (match) {
    const [fullMatch, tag, content] = match;
    const beforeText = text.substring(0, match.index);
    const afterText = text.substring(match.index + fullMatch.length);
    const elements = [];

    // Add any text before the tag
    if (beforeText) {
      elements.push(...parseInlineElements(beforeText));
    }

    // Process the content inside the tag (recursively to handle nested tags)
    const nestedElements = parseInlineElements(content);

    // Apply the current tag formatting to all nested elements
    nestedElements.forEach((element) => {
      if (tag === 'strong') element.bold = true;
      else if (tag === 'em') element.italic = true;
      else if (tag === 'u') element.underline = true;
      else if (tag === 'del') element.strikethrough = true;
    });

    elements.push(...nestedElements);

    // Add any text after the tag
    if (afterText) {
      elements.push(...parseInlineElements(afterText));
    }

    return elements;
  }

  // If we get here, there are no more tags to process
  return [{ type: 'text', text }];
}

export default parseInlineElements;
