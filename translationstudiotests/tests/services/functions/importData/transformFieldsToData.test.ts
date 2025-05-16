import { describe, test, expect } from '@jest/globals';
import { transformFieldsToData } from '../../../../../server/src/services/functions/importData/transformFieldsToData';

describe('transformFieldsToData', () => {
  test('should transform single value fields', () => {
    const fields = [
      { field: 'title', translatableValue: ['Hello'] },
      { field: 'description', translatableValue: ['World'] },
    ];

    const result = transformFieldsToData(fields as any);

    expect(result).toEqual({
      title: 'Hello',
      description: 'World',
    });
  });

  test('should join array values with space', () => {
    const fields = [{ field: 'title', translatableValue: ['Hello', 'World'] }];

    const result = transformFieldsToData(fields as any);

    expect(result).toEqual({
      title: 'Hello World',
    });
  });

  test('should handle empty values', () => {
    const fields = [
      { field: 'title', translatableValue: [] },
      { field: 'description', translatableValue: null },
    ];

    const result = transformFieldsToData(fields as any);

    expect(result).toEqual({
      title: '',
      description: '',
    });
  });
});
