import { parseNewValuesIntoStructure } from '../../../../../server/src/services/functions/importData/parseNewValuesIntoStructure';

describe('parseNewValuesIntoStructure', () => {
  // Test case 1: Standard case with matching number of newValues and children
  it('should correctly map newValues to the structure', () => {
    const originalStructure = [
      {
        type: 'paragraph',
        children: [
          { type: 'text', text: '', bold: true },
          { type: 'text', bold: true, text: '', italic: true },
        ],
      },
      {
        type: 'paragraph',
        children: [
          { text: '', type: 'text', bold: true },
          { text: '', type: 'text', bold: true, underline: true },
        ],
      },
    ];

    const newValues = ['fat ', 'fatitalics ', 'fat ', 'fatunderlined'];

    const expectedOutput = [
      {
        type: 'paragraph',
        children: [
          { type: 'text', text: 'fat ', bold: true },
          { type: 'text', bold: true, text: 'fatitalics ', italic: true },
        ],
      },
      {
        type: 'paragraph',
        children: [
          { text: 'fat ', type: 'text', bold: true },
          { text: 'fatunderlined', type: 'text', bold: true, underline: true },
        ],
      },
    ];

    expect(parseNewValuesIntoStructure(originalStructure, newValues)).toEqual(expectedOutput);
  });

  it('should ignore extra values when there are more newValues than children', () => {
    const originalStructure = [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: '', bold: true }],
      },
    ];

    const newValues = ['fat ', 'fatitalics ', 'extraValue'];

    const expectedOutput = [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'fat ', bold: true }],
      },
    ];

    expect(parseNewValuesIntoStructure(originalStructure, newValues)).toEqual(expectedOutput);
  });

  // Test case 3: Fewer newValues than children
  it('should leave extra children empty if there are fewer newValues than children', () => {
    const originalStructure = [
      {
        type: 'paragraph',
        children: [
          { type: 'text', text: '', bold: true },
          { type: 'text', bold: true, text: '', italic: true },
        ],
      },
    ];

    const newValues = ['fat '];

    const expectedOutput = [
      {
        type: 'paragraph',
        children: [
          { type: 'text', text: 'fat ', bold: true },
          { type: 'text', bold: true, text: '', italic: true },
        ],
      },
    ];

    expect(parseNewValuesIntoStructure(originalStructure, newValues)).toEqual(expectedOutput);
  });

  // Test case 4: Edge case with empty newValues array
  it('should handle empty newValues array gracefully', () => {
    const originalStructure = [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: '', bold: true }],
      },
    ];

    const newValues: any = [];

    const expectedOutput = [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: '', bold: true }],
      },
    ];

    expect(parseNewValuesIntoStructure(originalStructure, newValues)).toEqual(expectedOutput);
  });

  // Test case 5: New structure with varying numbers of children per paragraph
  it('should correctly handle different numbers of children in different paragraphs', () => {
    const originalStructure = [
      {
        type: 'paragraph',
        children: [
          { type: 'text', text: '', bold: true },
          { type: 'text', bold: true, text: '', italic: true },
        ],
      },
      {
        type: 'paragraph',
        children: [
          { text: '', type: 'text', bold: true },
          { text: '', type: 'text', bold: true, underline: true },
          { text: '', type: 'text', bold: true },
        ],
      },
    ];

    const newValues = ['fat ', 'fatitalics ', 'fat ', 'fatunderlined', 'extraValue'];

    const expectedOutput = [
      {
        type: 'paragraph',
        children: [
          { type: 'text', text: 'fat ', bold: true },
          { type: 'text', bold: true, text: 'fatitalics ', italic: true },
        ],
      },
      {
        type: 'paragraph',
        children: [
          { text: 'fat ', type: 'text', bold: true },
          { text: 'fatunderlined', type: 'text', bold: true, underline: true },
          { text: 'extraValue', type: 'text', bold: true },
        ],
      },
    ];

    expect(parseNewValuesIntoStructure(originalStructure, newValues)).toEqual(expectedOutput);
  });
});
