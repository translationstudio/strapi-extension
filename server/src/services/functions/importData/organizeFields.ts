import {
  OrganizedFields,
  TranslationstudioTranslatable,
} from "../../../../../translationstudio/Types";

export function organizeFields(
  fields: TranslationstudioTranslatable[]
): OrganizedFields {
  const componentFieldsMap = new Map<string, TranslationstudioTranslatable[]>();
  const dynamicZoneFields = new Map<number, TranslationstudioTranslatable[]>();
  const regularFields: TranslationstudioTranslatable[] = [];

  fields.forEach((field: TranslationstudioTranslatable) => {
    if (!field.componentInfo) {
      regularFields.push(field);
      return;
    }

    const { namePath, id } = field.componentInfo;
    const pathString = namePath.join(".");

    if (namePath[0] === "dynamiczone") {
      if (!dynamicZoneFields.has(id)) {
        dynamicZoneFields.set(id, []);
      }
      dynamicZoneFields.get(id)?.push(field);
    } else {
      if (!componentFieldsMap.has(pathString)) {
        componentFieldsMap.set(pathString, []);
      }
      componentFieldsMap.get(pathString)?.push(field);
    }
  });

  return { regularFields, componentFieldsMap, dynamicZoneFields };
}
