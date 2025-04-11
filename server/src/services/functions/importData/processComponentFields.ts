import { TranslationstudioTranslatable } from "../../../../../translationstudio/Types";

// Helper function to handle repeatable components
function processRepeatableComponents(
  fields: TranslationstudioTranslatable[],
  existingEntry: any,
  rootPath: string
) {
  const existingComponents = existingEntry?.[rootPath] || [];
  const componentsById = new Map();

  fields.forEach((field) => {
    if (!field.componentInfo) {
      console.warn(`Component info missing for field: ${field.field}`);
      return;
    }

    const componentId = field.componentInfo.id;
    if (!componentsById.has(componentId)) {
      const existingComponent = existingComponents.find(
        (c: any) => c.id === componentId
      );
      componentsById.set(
        componentId,
        existingComponent ? { ...existingComponent } : {}
      );
    }
    const component = componentsById.get(componentId);
    component[field.field] = field.translatableValue[0];
  });

  return Array.from(componentsById.values())
    .map((comp) => {
      if (!existingComponents.find((ec: any) => ec.id === comp.id)) {
        const { id, ...rest } = comp;
        return rest;
      }
      return comp;
    })
    .filter((comp) => Object.keys(comp).length > 0);
}

// Helper function to handle nested components
function processNestedComponents(
  fields: TranslationstudioTranslatable[],
  pathParts: string[],
  existingEntry: any,
  acc: Record<string, any>
) {
  let current = acc;
  let currentExisting = existingEntry;

  pathParts.forEach((part, index) => {
    if (!current[part]) {
      current[part] = {};

      // Preserve existing IDs for nested components
      if (currentExisting?.[part]?.id) {
        current[part].id = currentExisting[part].id;
      }
    }

    if (index === pathParts.length - 1) {
      // Add fields at the final nesting level
      fields.forEach((field) => {
        current[part][field.field] = field.translatableValue[0];
      });
    } else {
      current = current[part];
      currentExisting = currentExisting?.[part];
    }
  });
}

// Main function to process component fields
export function processComponentFields(
  componentFieldsMap: Map<string, TranslationstudioTranslatable[]>,
  acc: Record<string, any>,
  existingEntry: any,
  targetSchema: any
): Record<string, any> {
  componentFieldsMap.forEach((fields, namePath) => {
    if (!fields.length) return;

    const pathParts = namePath.split(".");
    const rootPath = pathParts[0];
    const schema = targetSchema.attributes?.[rootPath];

    if (schema?.repeatable) {
      // Handle repeatable components
      acc[rootPath] = processRepeatableComponents(
        fields,
        existingEntry,
        rootPath
      );
    } else {
      // Handle nested components
      processNestedComponents(fields, pathParts, existingEntry, acc);
    }
  });

  return acc;
}
