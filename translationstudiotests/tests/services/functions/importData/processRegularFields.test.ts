import { processRegularFields } from '../../../../../server/src/services/functions/importData/processRegularFields';
import { TranslationstudioTranslatable } from '../../../../../Types';

describe('processRegularFields', () => {
  it('should process regular fields into an accumulator object', () => {
    // Arrange
    const regularFields: TranslationstudioTranslatable[] = [
      {
        field: 'title',
        type: 'text',
        translatableValue: ['Test Title'],
        realType: 'string',
      },
      {
        field: 'description',
        type: 'html',
        translatableValue: ['<p>Test Description</p>'],
        realType: 'richtext',
      },
    ];

    const acc: Record<string, any> = {};

    // Act
    const result = processRegularFields(regularFields, acc);

    // Assert
    expect(result).toEqual({
      title: 'Test Title',
      description: '<p>Test Description</p>',
    });
  });

  it('should update existing accumulator object', () => {
    // Arrange
    const regularFields: TranslationstudioTranslatable[] = [
      {
        field: 'newField',
        type: 'text',
        translatableValue: ['New Value'],
        realType: 'string',
      },
    ];

    const acc: Record<string, any> = {
      existingField: 'Existing Value',
    };

    // Act
    const result = processRegularFields(regularFields, acc);

    // Assert
    expect(result).toEqual({
      existingField: 'Existing Value',
      newField: 'New Value',
    });
  });

  it('should handle empty fields array', () => {
    // Arrange
    const regularFields: TranslationstudioTranslatable[] = [];
    const acc: Record<string, any> = {
      existingField: 'Existing Value',
    };

    // Act
    const result = processRegularFields(regularFields, acc);

    // Assert
    expect(result).toEqual({
      existingField: 'Existing Value',
    });
  });

  it('should use first element of translatableValue array', () => {
    // Arrange
    const regularFields: TranslationstudioTranslatable[] = [
      {
        field: 'multiValue',
        type: 'text',
        translatableValue: ['First Value', 'Second Value', 'Third Value'],
        realType: 'string',
      },
    ];

    const acc: Record<string, any> = {};

    // Act
    const result = processRegularFields(regularFields, acc);

    // Assert
    expect(result).toEqual({
      multiValue: 'First Value',
    });
  });
});
