/*
Strapi - translationstudio extension
Copyright (C) 2025 I-D Media GmbH, idmedia.com

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, see https://www.gnu.org/licenses/old-licenses/gpl-2.0.html
*/
import { describe } from '@jest/globals';
import { processComponentFields } from '../../../../server/src/services/functions/importData/processComponentFields';
import { TranslationstudioTranslatable } from '../../../../Types';

describe('processComponentFields', () => {
  it('should process non-repeatable component fields', () => {
    // Arrange
    const componentFields = new Map<string, TranslationstudioTranslatable[]>();
    componentFields.set('header', [
      {
        field: 'title',
        type: 'text',
        translatableValue: ['Component Title'],
        realType: 'string',
        componentInfo: {
          namePath: ['header'],
          id: 1,
          schemaName: 'components.header',
        },
      },
      {
        field: 'subtitle',
        type: 'text',
        translatableValue: ['Component Subtitle'],
        realType: 'string',
        componentInfo: {
          namePath: ['header'],
          id: 1,
          schemaName: 'components.header',
        },
      },
    ]);

    const acc: Record<string, any> = {};
    const existingEntry = {
      header: {
        id: 123,
        title: 'Old Title',
        subtitle: 'Old Subtitle',
      },
    };
    const targetSchema = {
      attributes: {
        header: {
          type: 'component',
          repeatable: false,
          component: 'components.header',
        },
      },
    };

    // Act
    const result = processComponentFields(componentFields, acc, existingEntry, targetSchema);

    // Assert
    expect(result).toEqual({
      header: {
        id: 123, // Should preserve ID
        title: 'Component Title',
        subtitle: 'Component Subtitle',
      },
    });
  });

  it('should process repeatable component fields', () => {
    // Arrange
    const componentFields = new Map<string, TranslationstudioTranslatable[]>();
    componentFields.set('items', [
      {
        field: 'text',
        type: 'text',
        translatableValue: ['Item 1 Text'],
        realType: 'string',
        componentInfo: {
          namePath: ['items'],
          id: 1,
          schemaName: 'components.item',
        },
      },
      {
        field: 'text',
        type: 'text',
        translatableValue: ['Item 2 Text'],
        realType: 'string',
        componentInfo: {
          namePath: ['items'],
          id: 2,
          schemaName: 'components.item',
        },
      },
    ]);

    const acc: Record<string, any> = {};
    const existingEntry = {
      items: [
        { id: 1, text: 'Old Item 1' },
        { id: 2, text: 'Old Item 2' },
        { id: 3, text: 'Old Item 3' }, // This should remain untouched
      ],
    };
    const targetSchema = {
      attributes: {
        items: {
          type: 'component',
          repeatable: true,
          component: 'components.item',
        },
      },
    };

    // Act
    const result = processComponentFields(componentFields, acc, existingEntry, targetSchema);

    // Assert
    expect(result).toEqual({
      items: [
        { id: 1, text: 'Item 1 Text' },
        { id: 2, text: 'Item 2 Text' },
      ],
    });
  });

  it('should handle nested component structure', () => {
    // Arrange
    const componentFields = new Map<string, TranslationstudioTranslatable[]>();
    componentFields.set('section.content', [
      {
        field: 'text',
        type: 'html',
        translatableValue: ['<p>Nested Content</p>'],
        realType: 'richtext',
        componentInfo: {
          namePath: ['section', 'content'],
          id: 5,
          schemaName: 'components.content',
        },
      },
    ]);

    const acc: Record<string, any> = {};
    const existingEntry = {
      section: {
        id: 10,
        content: {
          id: 5,
          text: '<p>Old content</p>',
        },
      },
    };
    const targetSchema = {
      attributes: {
        section: {
          type: 'component',
          repeatable: false,
          component: 'components.section',
        },
      },
    };

    // Act
    const result = processComponentFields(componentFields, acc, existingEntry, targetSchema);

    // Assert
    expect(result).toEqual({
      section: {
        id: 10,
        content: {
          id: 5,
          text: '<p>Nested Content</p>',
        },
      },
    });
  });

  it('should handle empty component fields map', () => {
    // Arrange
    const componentFields = new Map<string, TranslationstudioTranslatable[]>();
    const acc: Record<string, any> = { existingField: 'value' };
    const existingEntry = {};
    const targetSchema = { attributes: {} };

    // Act
    const result = processComponentFields(componentFields, acc, existingEntry, targetSchema);

    // Assert
    expect(result).toEqual({ existingField: 'value' });
  });
});
