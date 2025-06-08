import { extractContentAndEntryIds } from '../../../../server/src/services/functions/importData/extract';

describe('extract functions', () => {
  describe('extractContentAndEntryIds', () => {
    it('should extract content type ID and entry ID correctly', () => {
      const result = extractContentAndEntryIds('api::article.article#123');
      expect(result).toEqual(['api::article.article', '123']);
    });

    it('should handle single types (no entry ID)', () => {
      const result = extractContentAndEntryIds('api::homepage.homepage');
      expect(result).toEqual(['api::homepage.homepage', undefined]);
    });
  });
});
