import parseInlineElements from '../../../../../server/src/services/functions/importData/parseInlineElements';

describe('parseInlineElements', () => {
  test('handles plain text', () => {
    const result = parseInlineElements('Hello world');
    expect(result).toEqual([
      { type: 'text', text: '' },
      { type: 'text', text: 'Hello world' },
      { type: 'text', text: '' },
    ]);
  });

  test('handles basic formatting', () => {
    const html =
      '<strong>Bold</strong> and <em>italic</em> and <u>underline</u> and <code>code</code>';
    const result = parseInlineElements(html);
    expect(result).toEqual([
      { type: 'text', text: '' },
      { type: 'text', text: 'Bold', bold: true },
      { type: 'text', text: ' and ' },
      { type: 'text', text: 'italic', italic: true },
      { type: 'text', text: ' and ' },
      { type: 'text', text: 'underline', underline: true },
      { type: 'text', text: ' and ' },
      { type: 'text', text: 'code', code: true },
      { type: 'text', text: '' },
    ]);
  });

  test('handles links', () => {
    const html = '<a href="https://example.com">Link text</a>';
    const result = parseInlineElements(html);
    expect(result).toEqual([
      { type: 'text', text: '' },
      {
        type: 'link',
        url: 'https://example.com',
        children: [{ type: 'text', text: 'Link text' }],
      },
      { type: 'text', text: '' },
    ]);
  });

  test('handles strikethrough', () => {
    const text = 'Normal ~~strikethrough~~ text';
    const result = parseInlineElements(text);
    expect(result).toEqual([
      { type: 'text', text: '' },
      { type: 'text', text: 'Normal ' },
      { type: 'text', text: 'strikethrough', strikethrough: true },
      { type: 'text', text: ' text' },
      { type: 'text', text: '' },
    ]);
  });

  test('handles formatted text inside links', () => {
    const html = '<a href="https://example.com"><strong>Bold</strong> and <em>italic</em></a>';
    const result = parseInlineElements(html);
    expect(result).toEqual([
      { type: 'text', text: '' },
      {
        type: 'link',
        url: 'https://example.com',
        children: [
          { type: 'text', text: 'Bold', bold: true },
          { type: 'text', text: ' and ' },
          { type: 'text', text: 'italic', italic: true },
        ],
      },
      { type: 'text', text: '' },
    ]);
  });

  test('handles complex mixed content', () => {
    const html =
      'Start <strong>bold</strong> middle ~~strike~~ <a href="https://test.com"><em>italic link</em></a> end';
    const result = parseInlineElements(html);
    expect(result).toEqual([
      { type: 'text', text: '' },
      { type: 'text', text: 'Start ' },
      { type: 'text', text: 'bold', bold: true },
      { type: 'text', text: ' middle ' },
      { type: 'text', text: 'strike', strikethrough: true },
      { type: 'text', text: ' ' },
      {
        type: 'link',
        url: 'https://test.com',
        children: [{ type: 'text', text: 'italic link', italic: true }],
      },
      { type: 'text', text: ' end' },
      { type: 'text', text: '' },
    ]);
  });
});
