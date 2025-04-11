import { TranslationstudioTranslatable } from "../../../../../translationstudio/Types";
import { transformFieldsToData } from "./transformFieldsToData";

export function processDynamicZones(
  dynamicZoneFields: Map<number, TranslationstudioTranslatable[]>,
  acc: Record<string, any>,
  existingEntry: any
): Record<string, any> {
  if (dynamicZoneFields.size > 0) {
    const existingDynamicZone = existingEntry?.dynamiczone || [];

    acc.dynamiczone = Array.from(dynamicZoneFields.entries())
      .sort(([a], [b]) => a - b)
      .map(([_, fields]) => {
        // Check if componentInfo exists
        if (!fields[0].componentInfo) {
          console.warn(
            `Component info missing for dynamic zone field: ${fields[0].field}`
          );
          return null; // Will be filtered out below
        }

        const { schemaName } = fields[0].componentInfo;
        const componentData = transformFieldsToData(fields);

        // Try to find matching existing component
        const matchingComponent = existingDynamicZone.find(
          (comp: any) => comp.__component === schemaName
        );

        return {
          __component: schemaName,
          ...componentData,
          ...(matchingComponent?.id ? { id: matchingComponent.id } : {}),
        };
      })
      .filter(Boolean); // Remove null entries
  }

  return acc;
}
