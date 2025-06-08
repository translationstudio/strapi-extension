import jsonToHtml from '../../../../server/src/services/functions/exportData/jsonToHtml';

describe('jsonToHtml', () => {
  test('handles empty or invalid input', () => {
    expect(jsonToHtml(null)).toBe('');
    expect(jsonToHtml(undefined)).toBe('');
    expect(jsonToHtml({})).toBe('');
    expect(jsonToHtml([])).toBe('');
  });

  test('converts simple paragraph', () => {
    const input = [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Hello world' }],
      },
    ];
    expect(jsonToHtml(input)).toBe('<p>Hello world</p>');
  });

  test('converts formatted text', () => {
    const input = [
      {
        type: 'paragraph',
        children: [
          { type: 'text', text: 'This is ', bold: true },
          { type: 'text', text: 'formatted ', italic: true },
          { type: 'text', text: 'text', underline: true },
          { type: 'text', text: ' with code', code: true },
        ],
      },
    ];
    expect(jsonToHtml(input)).toBe(
      '<p><strong>This is </strong><em>formatted </em><u>text</u><code> with code</code></p>'
    );
  });

  test('converts links', () => {
    const input = [
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
    ];
    expect(jsonToHtml(input)).toBe('<p><a href="https://example.com">Link text</a></p>');
  });

  test('converts lists', () => {
    const input = [
      {
        type: 'list',
        format: 'unordered',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'text', text: 'Item 1' }],
          },
          {
            type: 'list-item',
            children: [{ type: 'text', text: 'Item 2', bold: true }],
          },
        ],
      },
    ];
    expect(jsonToHtml(input)).toBe('<ul><li>Item 1</li><li><strong>Item 2</strong></li></ul>');
  });

  test('converts headings', () => {
    const input = [
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
    ];
    expect(jsonToHtml(input)).toBe('<h1>Title</h1><h2>Subtitle</h2>');
  });

  test('converts blockquotes', () => {
    const input = [
      {
        type: 'quote',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'Quote text' }],
          },
        ],
      },
    ];
    expect(jsonToHtml(input)).toBe('<blockquote><p>Quote text</p></blockquote>');
  });

  test('converts code blocks', () => {
    const input = [
      {
        type: 'code',
        children: [{ type: 'text', text: 'const x = 42;' }],
      },
    ];
    expect(jsonToHtml(input)).toBe('<pre><code>const x = 42;</code></pre>');
  });

  test('converts complex mixed content', () => {
    const input = [
      {
        type: 'paragraph',
        children: [
          { type: 'text', text: 'Start ' },
          { type: 'text', text: 'bold', bold: true },
          { type: 'text', text: ' middle ' },
          {
            type: 'link',
            url: 'https://test.com',
            children: [{ type: 'text', text: 'link', italic: true }],
          },
          { type: 'text', text: ' end' },
        ],
      },
    ];
    expect(jsonToHtml(input)).toBe(
      '<p>Start <strong>bold</strong> middle <a href="https://test.com"><em>link</em></a> end</p>'
    );
  });

  test('handles strikethrough with markdown syntax', () => {
    const input = [
      {
        type: 'paragraph',
        children: [
          { type: 'text', text: 'Normal ' },
          { type: 'text', text: 'strikethrough', strikethrough: true },
          { type: 'text', text: ' text' },
        ],
      },
    ];
    expect(jsonToHtml(input)).toBe('<p>Normal ~~strikethrough~~ text</p>');
  });
});
