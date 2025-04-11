import { TranslationstudioTranslatable } from "../../../../../translationstudio/Types";
import { organizeFields } from "./organizeFields";
import { processRegularFields } from "./processRegularFields";
import { processComponentFields } from "./processComponentFields";
import { processDynamicZones } from "./processDynamicZones";

export function prepareImportData(
  translatables: TranslationstudioTranslatable[],
  existingEntry: any,
  targetSchema: any
): Record<string, any> {
  return translatables.reduce((acc, doc) => {
    const { regularFields, componentFieldsMap, dynamicZoneFields } =
      organizeFields(translatables);

    // Process each field category and update the accumulator
    const withRegularFields = processRegularFields(regularFields, acc);
    const withComponentFields = processComponentFields(
      componentFieldsMap,
      withRegularFields,
      existingEntry,
      targetSchema
    );
    const withDynamicZones = processDynamicZones(
      dynamicZoneFields,
      withComponentFields,
      existingEntry
    );

    return withDynamicZones;
  }, {} as Record<string, any>);
}
