import { ActionIcon, Button, Text, TextInput } from "@mantine/core";
import { X } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { useTranslation } from "../../../hooks/use-translation.ts";
import { cn } from "../../../lib/utils.ts";
import type { ObjectJSONSchema } from "../../../types/jsonSchema.ts";
import {
  isBooleanSchema,
  withObjectSchema,
} from "../../../types/jsonSchema.ts";
import type { TypeEditorProps } from "../TypeEditor.tsx";
import styles from "./TypeEditors.module.css";

interface NumberEditorProps extends TypeEditorProps {
  integer?: boolean;
}

type Property =
  | "minimum"
  | "maximum"
  | "exclusiveMinimum"
  | "exclusiveMaximum"
  | "multipleOf"
  | "enum";

const NumberEditor: React.FC<NumberEditorProps> = ({
  schema,
  validationNode,
  onChange,
  integer = false,
  readOnly = false,
}) => {
  const [enumValue, setEnumValue] = useState("");
  const t = useTranslation();

  const maximumId = useId();
  const minimumId = useId();
  const exclusiveMinimumId = useId();
  const exclusiveMaximumId = useId();
  const multipleOfId = useId();

  // Extract number-specific validations
  const minimum = withObjectSchema(schema, (s) => s.minimum, undefined);
  const maximum = withObjectSchema(schema, (s) => s.maximum, undefined);
  const exclusiveMinimum = withObjectSchema(
    schema,
    (s) => s.exclusiveMinimum,
    undefined,
  );
  const exclusiveMaximum = withObjectSchema(
    schema,
    (s) => s.exclusiveMaximum,
    undefined,
  );
  const multipleOf = withObjectSchema(schema, (s) => s.multipleOf, undefined);
  const enumValues = withObjectSchema(
    schema,
    (s) => (s.enum as number[]) || [],
    [],
  );

  // Handle validation change
  const handleValidationChange = (property: Property, value: unknown) => {
    // Create a safe base schema with necessary properties
    const baseProperties: Partial<ObjectJSONSchema> = {
      type: integer ? "integer" : "number",
    };

    // Copy existing validation properties (except type and description) if schema is an object
    if (!isBooleanSchema(schema)) {
      if (schema.minimum !== undefined) baseProperties.minimum = schema.minimum;
      if (schema.maximum !== undefined) baseProperties.maximum = schema.maximum;
      if (schema.exclusiveMinimum !== undefined)
        baseProperties.exclusiveMinimum = schema.exclusiveMinimum;
      if (schema.exclusiveMaximum !== undefined)
        baseProperties.exclusiveMaximum = schema.exclusiveMaximum;
      if (schema.multipleOf !== undefined)
        baseProperties.multipleOf = schema.multipleOf;
      if (schema.enum !== undefined) baseProperties.enum = schema.enum;
    }

    // Only add the property if the value is defined, otherwise remove it
    if (value !== undefined) {
      // Create updated object with modified property
      const updatedProperties: Partial<ObjectJSONSchema> = {
        ...baseProperties,
      };

      if (property === "minimum") updatedProperties.minimum = value as number;
      else if (property === "maximum")
        updatedProperties.maximum = value as number;
      else if (property === "exclusiveMinimum")
        updatedProperties.exclusiveMinimum = value as number;
      else if (property === "exclusiveMaximum")
        updatedProperties.exclusiveMaximum = value as number;
      else if (property === "multipleOf")
        updatedProperties.multipleOf = value as number;
      else if (property === "enum") updatedProperties.enum = value as unknown[];

      onChange(updatedProperties as ObjectJSONSchema);
      return;
    }

    // Handle removing a property (value is undefined)
    if (property === "minimum") {
      const { minimum: _, ...rest } = baseProperties;
      onChange(rest as ObjectJSONSchema);
      return;
    }

    if (property === "maximum") {
      const { maximum: _, ...rest } = baseProperties;
      onChange(rest as ObjectJSONSchema);
      return;
    }

    if (property === "exclusiveMinimum") {
      const { exclusiveMinimum: _, ...rest } = baseProperties;
      onChange(rest as ObjectJSONSchema);
      return;
    }

    if (property === "exclusiveMaximum") {
      const { exclusiveMaximum: _, ...rest } = baseProperties;
      onChange(rest as ObjectJSONSchema);
      return;
    }

    if (property === "multipleOf") {
      const { multipleOf: _, ...rest } = baseProperties;
      onChange(rest as ObjectJSONSchema);
      return;
    }

    if (property === "enum") {
      const { enum: _, ...rest } = baseProperties;
      onChange(rest as ObjectJSONSchema);
      return;
    }

    // Fallback case - just use the base properties
    onChange(baseProperties as ObjectJSONSchema);
  };

  // Handle adding enum value
  const handleAddEnumValue = () => {
    if (!enumValue.trim()) return;

    const numValue = Number(enumValue);
    if (Number.isNaN(numValue)) return;

    // For integer type, ensure the value is an integer
    const validValue = integer ? Math.floor(numValue) : numValue;

    if (!enumValues.includes(validValue)) {
      handleValidationChange("enum", [...enumValues, validValue]);
    }

    setEnumValue("");
  };

  // Handle removing enum value
  const handleRemoveEnumValue = (index: number) => {
    const newEnumValues = [...enumValues];
    newEnumValues.splice(index, 1);

    if (newEnumValues.length === 0) {
      // If empty, remove the enum property entirely by setting it to undefined
      handleValidationChange("enum", undefined);
    } else {
      handleValidationChange("enum", newEnumValues);
    }
  };

  const minMaxError = useMemo(
    () =>
      validationNode?.validation.errors?.find((err) => err.path[0] === "minMax")
        ?.message,
    [validationNode],
  );

  const redundantMinError = useMemo(
    () =>
      validationNode?.validation.errors?.find(
        (err) => err.path[0] === "redundantMinimum",
      )?.message,
    [validationNode],
  );

  const redundantMaxError = useMemo(
    () =>
      validationNode?.validation.errors?.find(
        (err) => err.path[0] === "redundantMaximum",
      )?.message,
    [validationNode],
  );

  const enumError = useMemo(
    () =>
      validationNode?.validation.errors?.find((err) => err.path[0] === "enum")
        ?.message,
    [validationNode],
  );

  const multipleOfError = useMemo(
    () =>
      validationNode?.validation.errors?.find(
        (err) => err.path[0] === "multipleOf",
      )?.message,
    [validationNode],
  );

  const hasConstraint =
    !!minimum ||
    !!maximum ||
    !!exclusiveMinimum ||
    !!exclusiveMaximum ||
    !!multipleOf ||
    enumValues.length > 0;

  return (
    <div className={styles.stack}>
      {readOnly && !hasConstraint && (
        <Text className={styles.helperText}>{t.numberNoConstraint}</Text>
      )}

      {(!readOnly || hasConstraint) && (
        <div className={styles.grid}>
          {(!readOnly || !!minimum) && (
            <TextInput
              id={minimumId}
              type="number"
              value={minimum !== undefined ? minimum : ""}
              onChange={(e) => {
                const value = e.target.value
                  ? Number(e.target.value)
                  : undefined;
                handleValidationChange("minimum", value);
              }}
              label={t.numberMinimumLabel}
              placeholder={t.numberMinimumPlaceholder}
              error={minMaxError || redundantMinError || undefined}
              size="xs"
              step={integer ? 1 : "any"}
            />
          )}

          {(!readOnly || !!maximum) && (
            <TextInput
              id={maximumId}
              type="number"
              value={maximum ?? ""}
              onChange={(e) => {
                const value = e.target.value
                  ? Number(e.target.value)
                  : undefined;
                handleValidationChange("maximum", value);
              }}
              label={t.numberMaximumLabel}
              placeholder={t.numberMaximumPlaceholder}
              error={minMaxError || redundantMaxError || undefined}
              size="xs"
              step={integer ? 1 : "any"}
            />
          )}
        </div>
      )}

      {(!readOnly || !!exclusiveMaximum || !!exclusiveMinimum) && (
        <div className={styles.grid}>
          {(!readOnly || !!exclusiveMinimum) && (
            <TextInput
              id={exclusiveMinimumId}
              type="number"
              value={exclusiveMinimum ?? ""}
              onChange={(e) => {
                const value = e.target.value
                  ? Number(e.target.value)
                  : undefined;
                handleValidationChange("exclusiveMinimum", value);
              }}
              label={t.numberExclusiveMinimumLabel}
              placeholder={t.numberExclusiveMinimumPlaceholder}
              error={minMaxError || redundantMinError || undefined}
              size="xs"
              step={integer ? 1 : "any"}
            />
          )}

          {(!readOnly || !!exclusiveMaximum) && (
            <TextInput
              id={exclusiveMaximumId}
              type="number"
              value={exclusiveMaximum ?? ""}
              onChange={(e) => {
                const value = e.target.value
                  ? Number(e.target.value)
                  : undefined;
                handleValidationChange("exclusiveMaximum", value);
              }}
              label={t.numberExclusiveMaximumLabel}
              placeholder={t.numberExclusiveMaximumPlaceholder}
              error={minMaxError || redundantMaxError || undefined}
              size="xs"
              step={integer ? 1 : "any"}
            />
          )}
        </div>
      )}

      {(!readOnly || !!multipleOf) && (
        <TextInput
          id={multipleOfId}
          type="number"
          value={multipleOf ?? ""}
          onChange={(e) => {
            const value = e.target.value ? Number(e.target.value) : undefined;
            handleValidationChange("multipleOf", value);
          }}
          label={t.numberMultipleOfLabel}
          placeholder={t.numberMultipleOfPlaceholder}
          error={multipleOfError || undefined}
          min={0}
          size="xs"
          step={integer ? 1 : "any"}
        />
      )}

      {(!readOnly || enumValues.length > 0) && (
        <div className={cn(styles.section, styles.divider)}>
          <Text size="sm" fw={500}>
            {t.numberAllowedValuesEnumLabel}
          </Text>

          {!!enumError && <Text className={styles.errorText}>{enumError}</Text>}

          <div className={styles.enumList}>
            {enumValues.length > 0 ? (
              enumValues.map((value, index) => (
                <div key={`enum-number-${value}`} className={styles.enumItem}>
                  <span className={styles.enumValue}>{value}</span>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="xs"
                    type="button"
                    onClick={() => handleRemoveEnumValue(index)}
                  >
                    <X size={12} />
                  </ActionIcon>
                </div>
              ))
            ) : (
              <Text className={styles.helperText}>
                {t.numberAllowedValuesEnumNone}
              </Text>
            )}
          </div>

          <div className={styles.enumActions}>
            <TextInput
              type="number"
              value={enumValue}
              onChange={(e) => setEnumValue(e.target.value)}
              placeholder={t.numberAllowedValuesEnumAddPlaceholder}
              size="xs"
              className={styles.enumInput}
              onKeyDown={(e) => e.key === "Enter" && handleAddEnumValue()}
              step={integer ? 1 : "any"}
            />
            <Button
              type="button"
              onClick={handleAddEnumValue}
              size="xs"
              variant="light"
            >
              {t.numberAllowedValuesEnumAddLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NumberEditor;
