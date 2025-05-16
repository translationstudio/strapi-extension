import htmlToJson from '../../../../../server/src/services/functions/importData/htmlToJson';

// Create a standalone implementation of processDataRecursively for testing
export function processDataRecursively(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // Handle arrays (for repeatable components and dynamic zones)
  if (Array.isArray(data)) {
    return data.map((item) => processDataRecursively(item));
  }

  // Process object properties
  const result: Record<string, any> = {};

  for (const key in data) {
    const value = data[key];

    // Check if this is an HTML string in a RichTextBlocks field
    if (
      typeof value === 'string' &&
      (key.includes('Blocks') || key.includes('RTBlocks') || key === 'blocks')
    ) {
      // Convert HTML to JSON structure expected by Strapi blocks
      result[key] = htmlToJson(value);
    }
    // Handle nested objects (components, etc.)
    else if (value && typeof value === 'object') {
      result[key] = processDataRecursively(value);
    }
    // Keep other values as is
    else {
      result[key] = value;
    }
  }

  return result;
}

// Mock htmlToJson for the tests
jest.mock('../../../../../server/src/services/functions/importData/htmlToJson', () => {
  return jest.fn().mockImplementation((html) => {
    // Return a simplified block structure for testing
    if (html.includes('<strong>')) {
      return [
        {
          type: 'paragraph',
          children: [{ type: 'text', text: html.replace(/<[^>]*>/g, ''), bold: true }],
        },
      ];
    } else if (html.includes('<em>')) {
      return [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              text: html.replace(/<[^>]*>/g, ''),
              italic: true,
            },
          ],
        },
      ];
    } else {
      return [
        {
          type: 'paragraph',
          children: [{ type: 'text', text: html.replace(/<[^>]*>/g, '') }],
        },
      ];
    }
  });
});

describe('processDataRecursively', () => {
  it('should convert HTML strings in blocks fields to JSON', () => {
    const data = {
      title: 'Normal Field',
      RichTextBlocks: '<p><strong>Bold</strong> text</p>',
      nested: {
        RTBlocks: '<p><em>Italic</em></p>',
      },
    };

    const result = processDataRecursively(data);

    expect(result.title).toBe('Normal Field');
    expect(Array.isArray(result.RichTextBlocks)).toBe(true);
    expect(result.RichTextBlocks[0]).toHaveProperty('type', 'paragraph');
    expect(Array.isArray(result.nested.RTBlocks)).toBe(true);
  });

  it('should handle arrays for repeatable components', () => {
    const data = {
      repeatable: [
        { text: 'Item 1', blocks: '<p>HTML 1</p>' },
        { text: 'Item 2', blocks: '<p>HTML 2</p>' },
      ],
    };

    const result = processDataRecursively(data);

    expect(Array.isArray(result.repeatable)).toBe(true);
    expect(result.repeatable).toHaveLength(2);
    expect(Array.isArray(result.repeatable[0].blocks)).toBe(true);
    expect(Array.isArray(result.repeatable[1].blocks)).toBe(true);
  });

  it('should handle empty objects', () => {
    const result = processDataRecursively({});
    expect(result).toEqual({});
  });

  it('should handle null and undefined values', () => {
    expect(processDataRecursively(null)).toBeNull();
    expect(processDataRecursively(undefined)).toBeUndefined();
  });

  it('should preserve non-object values', () => {
    expect(processDataRecursively('string')).toBe('string');
    expect(processDataRecursively(123)).toBe(123);
    expect(processDataRecursively(true)).toBe(true);
  });
});
