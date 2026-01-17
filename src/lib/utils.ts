import { type ClassValue, clsx } from "clsx";
import type { Translation } from "../i18n/translation-keys.ts";
import type { SchemaType } from "../types/jsonSchema.ts";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Helper functions for backward compatibility
export const getTypeColor = (type: SchemaType): string => {
  switch (type) {
    case "string":
      return "jsonjoy-type-pill jsonjoy-type-pill--string";
    case "number":
    case "integer":
      return "jsonjoy-type-pill jsonjoy-type-pill--number";
    case "boolean":
      return "jsonjoy-type-pill jsonjoy-type-pill--boolean";
    case "object":
      return "jsonjoy-type-pill jsonjoy-type-pill--object";
    case "array":
      return "jsonjoy-type-pill jsonjoy-type-pill--array";
    case "null":
      return "jsonjoy-type-pill jsonjoy-type-pill--null";
  }
};

// Get type display label
export const getTypeLabel = (t: Translation, type: SchemaType): string => {
  switch (type) {
    case "string":
      return t.schemaTypeString;
    case "number":
    case "integer":
      return t.schemaTypeNumber;
    case "boolean":
      return t.schemaTypeBoolean;
    case "object":
      return t.schemaTypeObject;
    case "array":
      return t.schemaTypeArray;
    case "null":
      return t.schemaTypeNull;
  }
};
