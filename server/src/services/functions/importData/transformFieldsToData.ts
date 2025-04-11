import { TranslationstudioTranslatable } from "../../../../../translationstudio/Types";
import htmlToJson from "./htmlToJson";

export function transformFieldsToData(fields: TranslationstudioTranslatable[]) {
  return fields.reduce((acc, field) => {
    // Handle null or undefined translatableValue
    if (!field.translatableValue) {
      acc[field.field] = "";
      return acc;
    }

    // Handle blocks/richtext fields
    if (field.realType === "blocks") {
      acc[field.field] = htmlToJson(field.translatableValue[0] || "");
    } else if (field.realType === "richtext") {
      acc[field.field] = field.translatableValue[0] || "";
    } else {
      // Join multiple values with spaces for regular fields
      acc[field.field] =
        Array.isArray(field.translatableValue) &&
        field.translatableValue.length > 1
          ? field.translatableValue.join(" ")
          : field.translatableValue[0] || "";
    }
    return acc;
  }, {} as Record<string, any>);
}
