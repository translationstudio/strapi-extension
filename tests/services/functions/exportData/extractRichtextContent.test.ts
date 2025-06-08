import extractRichtextContent from '../../../../server/src/services/functions/exportData/extractRichtextContent';
import { describe, test, expect } from '@jest/globals';

describe('extractRichtextContent', () => {
  test('should extract text from a single node with text', () => {
    const input = { text: 'Hello world' };
    expect(extractRichtextContent(input)).toEqual(['Hello world']);
  });

  test('should extract text from nested children', () => {
    const input = {
      children: [{ text: 'Hello' }, { text: 'world' }],
    };
    expect(extractRichtextContent(input)).toEqual(['Hello', 'world']);
  });

  test('should handle an array of nodes', () => {
    const input = [
      { text: 'First' },
      {
        children: [{ text: 'Second' }, { text: 'Third' }],
      },
    ];
    expect(extractRichtextContent(input)).toEqual(['First', 'Second', 'Third']);
  });

  test('should return empty array for empty input', () => {
    expect(extractRichtextContent({})).toEqual([]);
    expect(extractRichtextContent([])).toEqual([]);
  });

  test('should handle deeply nested structure', () => {
    const input = {
      children: [
        {
          children: [{ text: 'Deeply' }, { text: 'nested' }],
        },
        { text: 'content' },
      ],
    };
    expect(extractRichtextContent(input)).toEqual(['Deeply', 'nested', 'content']);
  });
});
