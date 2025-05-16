import { processDynamicZones } from '../../../../../server/src/services/functions/importData/processDynamicZones';
import { TranslationstudioTranslatable } from '../../../../../Types';

jest.mock('../../../../../server/src/services/functions/importData/transformFieldsToData', () => ({
  transformFieldsToData: (fields: any[]) => {
    // Simplified mock implementation
    return fields.reduce((acc, field) => {
      acc[field.field] = field.translatableValue[0];
      return acc;
    }, {});
  },
}));

describe('processDynamicZones', () => {
  it('should process dynamic zone fields', () => {
    // Arrange
    const dynamicZoneFields = new Map<number, TranslationstudioTranslatable[]>();
    dynamicZoneFields.set(1, [
      {
        field: 'heading',
        type: 'text',
        translatableValue: ['Dynamic Zone Heading'],
        realType: 'string',
        componentInfo: {
          namePath: ['dynamiczone'],
          id: 1,
          schemaName: 'components.heading',
        },
      },
    ]);
    dynamicZoneFields.set(2, [
      {
        field: 'text',
        type: 'html',
        translatableValue: ['<p>Dynamic Zone Text</p>'],
        realType: 'richtext',
        componentInfo: {
          namePath: ['dynamiczone'],
          id: 2,
          schemaName: 'components.paragraph',
        },
      },
    ]);

    const acc: Record<string, any> = {};
    const existingEntry = {
      dynamiczone: [
        {
          id: 101,
          __component: 'components.heading',
          heading: 'Old Heading',
        },
        {
          id: 102,
          __component: 'components.paragraph',
          text: '<p>Old Text</p>',
        },
      ],
    };

    // Act
    const result = processDynamicZones(dynamicZoneFields, acc, existingEntry);

    // Assert
    expect(result).toEqual({
      dynamiczone: [
        {
          __component: 'components.heading',
          heading: 'Dynamic Zone Heading',
          id: 101,
        },
        {
          __component: 'components.paragraph',
          text: '<p>Dynamic Zone Text</p>',
          id: 102,
        },
      ],
    });
  });

  it('should handle dynamic zones with no matching existing components', () => {
    // Arrange
    const dynamicZoneFields = new Map<number, TranslationstudioTranslatable[]>();
    dynamicZoneFields.set(1, [
      {
        field: 'content',
        type: 'text',
        translatableValue: ['New Content'],
        realType: 'string',
        componentInfo: {
          namePath: ['dynamiczone'],
          id: 1,
          schemaName: 'components.new-type',
        },
      },
    ]);

    const acc: Record<string, any> = {};
    const existingEntry = {
      dynamiczone: [
        {
          id: 101,
          __component: 'components.different-type',
          content: 'Different Content',
        },
      ],
    };

    // Act
    const result = processDynamicZones(dynamicZoneFields, acc, existingEntry);

    // Assert
    expect(result).toEqual({
      dynamiczone: [
        {
          __component: 'components.new-type',
          content: 'New Content',
          // No ID since there was no matching component
        },
      ],
    });
  });

  it('should handle empty dynamic zone fields', () => {
    // Arrange
    const dynamicZoneFields = new Map<number, TranslationstudioTranslatable[]>();
    const acc: Record<string, any> = { existingField: 'value' };
    const existingEntry = {};

    // Act
    const result = processDynamicZones(dynamicZoneFields, acc, existingEntry);

    // Assert
    expect(result).toEqual({ existingField: 'value' });
  });

  it('should sort dynamic zone components by their index', () => {
    // Arrange
    const dynamicZoneFields = new Map<number, TranslationstudioTranslatable[]>();
    dynamicZoneFields.set(3, [
      {
        field: 'text',
        type: 'text',
        translatableValue: ['Third Component'],
        realType: 'string',
        componentInfo: {
          namePath: ['dynamiczone'],
          id: 3,
          schemaName: 'components.text',
        },
      },
    ]);
    dynamicZoneFields.set(1, [
      {
        field: 'text',
        type: 'text',
        translatableValue: ['First Component'],
        realType: 'string',
        componentInfo: {
          namePath: ['dynamiczone'],
          id: 1,
          schemaName: 'components.text',
        },
      },
    ]);

    const acc: Record<string, any> = {};
    const existingEntry = {};

    // Act
    const result = processDynamicZones(dynamicZoneFields, acc, existingEntry);

    // Assert
    expect(result.dynamiczone[0].text).toBe('First Component');
    expect(result.dynamiczone[1].text).toBe('Third Component');
  });
});
