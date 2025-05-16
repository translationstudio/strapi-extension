import { organizeFields } from '../../../../../server/src/services/functions/importData/organizeFields';
import { TranslationstudioTranslatable } from '../../../../../Types';

describe('organizeFields', () => {
  it('should organize fields into regular, component, and dynamic zone categories', () => {
    // Arrange
    const mockFields: TranslationstudioTranslatable[] = [
      // Regular field
      {
        field: 'title',
        type: 'text',
        translatableValue: ['Hello World'],
        realType: 'string',
      },
      // Component field
      {
        field: 'headline',
        type: 'text',
        translatableValue: ['Component Headline'],
        realType: 'string',
        componentInfo: {
          namePath: ['content', 'header'],
          id: 1,
          schemaName: 'content.header',
        },
      },
      // Another component field with same path
      {
        field: 'subheadline',
        type: 'text',
        translatableValue: ['Component Subheadline'],
        realType: 'string',
        componentInfo: {
          namePath: ['content', 'header'],
          id: 1,
          schemaName: 'content.header',
        },
      },
      // Dynamic zone field
      {
        field: 'text',
        type: 'text',
        translatableValue: ['Dynamic Zone Text'],
        realType: 'string',
        componentInfo: {
          namePath: ['dynamiczone', 'content'],
          id: 5,
          schemaName: 'components.text-block',
        },
      },
    ];

    // Act
    const result = organizeFields(mockFields);

    // Assert
    expect(result.regularFields).toHaveLength(1);
    expect(result.regularFields[0].field).toBe('title');

    expect(result.componentFieldsMap.size).toBe(1);
    expect(result.componentFieldsMap.get('content.header')).toHaveLength(2);
    expect(result.componentFieldsMap.get('content.header')?.[0].field).toBe('headline');
    expect(result.componentFieldsMap.get('content.header')?.[1].field).toBe('subheadline');

    expect(result.dynamicZoneFields.size).toBe(1);
    expect(result.dynamicZoneFields.get(5)).toHaveLength(1);
    expect(result.dynamicZoneFields.get(5)?.[0].field).toBe('text');
  });

  it('should handle empty input', () => {
    // Arrange
    const mockFields: TranslationstudioTranslatable[] = [];

    // Act
    const result = organizeFields(mockFields);

    // Assert
    expect(result.regularFields).toHaveLength(0);
    expect(result.componentFieldsMap.size).toBe(0);
    expect(result.dynamicZoneFields.size).toBe(0);
  });

  it('should handle all regular fields', () => {
    // Arrange
    const mockFields: TranslationstudioTranslatable[] = [
      {
        field: 'title',
        type: 'text',
        translatableValue: ['Title 1'],
        realType: 'string',
      },
      {
        field: 'description',
        type: 'html',
        translatableValue: ['<p>Description</p>'],
        realType: 'richtext',
      },
    ];

    // Act
    const result = organizeFields(mockFields);

    // Assert
    expect(result.regularFields).toHaveLength(2);
    expect(result.componentFieldsMap.size).toBe(0);
    expect(result.dynamicZoneFields.size).toBe(0);
  });
});
