import { TranslationstudioTranslatable } from "../../../../../translationstudio/Types";

export function processRegularFields(
  regularFields: TranslationstudioTranslatable[],
  acc: Record<string, any>
): Record<string, any> {
  regularFields.forEach((field) => {
    acc[field.field] = field.translatableValue[0];
  });

  return acc;
}
