import { ActionIcon, Button, Select, Text, TextInput } from "@mantine/core";
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

type Property = "enum" | "minLength" | "maxLength" | "pattern" | "format";

const StringEditor: React.FC<TypeEditorProps> = ({
  schema,
  validationNode,
  onChange,
  readOnly = false,
}) => {
  const t = useTranslation();
  const [enumValue, setEnumValue] = useState("");

  const minLengthId = useId();
  const maxLengthId = useId();
  const patternId = useId();
  const formatId = useId();

  // Extract string-specific validations
  const minLength = withObjectSchema(schema, (s) => s.minLength, undefined);
  const maxLength = withObjectSchema(schema, (s) => s.maxLength, undefined);
  const pattern = withObjectSchema(schema, (s) => s.pattern, undefined);
  const format = withObjectSchema(schema, (s) => s.format, undefined);
  const enumValues = withObjectSchema(
    schema,
    (s) => (s.enum as string[]) || [],
    [],
  );

  // Handle validation change
  const handleValidationChange = (property: Property, value: unknown) => {
    // Create a safe base schema
    const baseSchema = isBooleanSchema(schema)
      ? { type: "string" as const }
      : { ...schema };

    // Get all validation props except type and description
    const { type: _, description: __, ...validationProps } = baseSchema;

    // Create the updated validation schema
    const updatedValidation: ObjectJSONSchema = {
      ...validationProps,
      type: "string",
      [property]: value,
    };

    // Call onChange with the updated schema (even if there are validation errors)
    onChange(updatedValidation);
  };

  // Handle adding enum value
  const handleAddEnumValue = () => {
    if (!enumValue.trim()) return;

    if (!enumValues.includes(enumValue)) {
      handleValidationChange("enum", [...enumValues, enumValue]);
    }

    setEnumValue("");
  };

  // Handle removing enum value
  const handleRemoveEnumValue = (index: number) => {
    const newEnumValues = [...enumValues];
    newEnumValues.splice(index, 1);

    if (newEnumValues.length === 0) {
      // If empty, remove the enum property entirely
      const baseSchema = isBooleanSchema(schema)
        ? { type: "string" as const }
        : { ...schema };

      // Use a type safe approach
      if (!isBooleanSchema(baseSchema) && "enum" in baseSchema) {
        const { enum: _, ...rest } = baseSchema;
        onChange(rest as ObjectJSONSchema);
      } else {
        onChange(baseSchema as ObjectJSONSchema);
      }
    } else {
      handleValidationChange("enum", newEnumValues);
    }
  };

  const minMaxError = useMemo(
    () =>
      validationNode?.validation.errors?.find((err) => err.path[0] === "length")
        ?.message,
    [validationNode],
  );

  const minLengthError = useMemo(
    () =>
      validationNode?.validation.errors?.find(
        (err) => err.path[0] === "minLength",
      )?.message,
    [validationNode],
  );

  const maxLengthError = useMemo(
    () =>
      validationNode?.validation.errors?.find(
        (err) => err.path[0] === "maxLength",
      )?.message,
    [validationNode],
  );

  const patternError = useMemo(
    () =>
      validationNode?.validation.errors?.find(
        (err) => err.path[0] === "pattern",
      )?.message,
    [validationNode],
  );

  const formatError = useMemo(
    () =>
      validationNode?.validation.errors?.find((err) => err.path[0] === "format")
        ?.message,
    [validationNode],
  );

  const minLengthValue = minLength ?? "";
  const maxLengthValue = maxLength ?? "";
  const patternValue = pattern ?? "";
  const formatValue = format || "none";
  const needsDetail =
    !readOnly ||
    minLengthValue !== "" ||
    maxLengthValue !== "" ||
    patternValue !== "" ||
    formatValue !== "none" ||
    enumValues.length > 0;

  return (
    <div className={styles.stack}>
      <div className={styles.grid}>
        {readOnly && !needsDetail && (
          <Text className={styles.helperText}>{t.stringNoConstraint}</Text>
        )}

        {(!readOnly || minLengthValue !== "") && (
          <TextInput
            id={minLengthId}
            type="number"
            min={0}
            value={minLengthValue}
            disabled={readOnly}
            onChange={(e) => {
              const value = e.target.value
                ? Number(e.target.value)
                : undefined;
              handleValidationChange("minLength", value);
            }}
            label={t.stringMinimumLengthLabel}
            placeholder={t.stringMinimumLengthPlaceholder}
            error={minMaxError || minLengthError || undefined}
            size="xs"
          />
        )}

        {(!readOnly || maxLengthValue !== "") && (
          <TextInput
            id={maxLengthId}
            type="number"
            min={0}
            disabled={readOnly}
            value={maxLengthValue}
            onChange={(e) => {
              const value = e.target.value
                ? Number(e.target.value)
                : undefined;
              handleValidationChange("maxLength", value);
            }}
            label={t.stringMaximumLengthLabel}
            placeholder={t.stringMaximumLengthPlaceholder}
            error={minMaxError || maxLengthError || undefined}
            size="xs"
          />
        )}
      </div>

      {(!readOnly || patternValue !== "") && (
        <TextInput
          id={patternId}
          type="text"
          value={patternValue}
          onChange={(e) => {
            const value = e.target.value || undefined;
            handleValidationChange("pattern", value);
          }}
          label={t.stringPatternLabel}
          placeholder={t.stringPatternPlaceholder}
          error={patternError || undefined}
          size="xs"
        />
      )}

      {(!readOnly || formatValue !== "none") && (
        <Select
          id={formatId}
          value={formatValue}
          onChange={(value) => {
            handleValidationChange(
              "format",
              value === "none" || value === null ? undefined : value,
            );
          }}
          label={t.stringFormatLabel}
          placeholder={t.stringFormatSelectPlaceholder}
          data={[
            { value: "none", label: t.stringFormatNone },
            { value: "date-time", label: t.stringFormatDateTime },
            { value: "date", label: t.stringFormatDate },
            { value: "time", label: t.stringFormatTime },
            { value: "email", label: t.stringFormatEmail },
            { value: "uri", label: t.stringFormatUri },
            { value: "uuid", label: t.stringFormatUuid },
            { value: "hostname", label: t.stringFormatHostname },
            { value: "ipv4", label: t.stringFormatIpv4 },
            { value: "ipv6", label: t.stringFormatIpv6 },
          ]}
          error={formatError || undefined}
          size="xs"
        />
      )}

      {(!readOnly || enumValues.length > 0) && (
        <div className={cn(styles.section, styles.divider)}>
          <Text size="sm" fw={500}>
            {t.stringAllowedValuesEnumLabel}
          </Text>

          <div className={styles.enumList}>
            {enumValues.length > 0 ? (
              enumValues.map((value) => (
                <div key={`enum-string-${value}`} className={styles.enumItem}>
                  <span className={styles.enumValue}>{value}</span>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="xs"
                    type="button"
                    onClick={() =>
                      handleRemoveEnumValue(enumValues.indexOf(value))
                    }
                  >
                    <X size={12} />
                  </ActionIcon>
                </div>
              ))
            ) : (
              <Text className={styles.helperText}>
                {t.stringAllowedValuesEnumNone}
              </Text>
            )}
          </div>

          <div className={styles.enumActions}>
            <TextInput
              type="text"
              value={enumValue}
              onChange={(e) => setEnumValue(e.target.value)}
              placeholder={t.stringAllowedValuesEnumAddPlaceholder}
              size="xs"
              className={styles.enumInput}
              onKeyDown={(e) => e.key === "Enter" && handleAddEnumValue()}
            />
            <Button
              type="button"
              onClick={handleAddEnumValue}
              size="xs"
              variant="light"
            >
              {t.stringAllowedValuesEnumAddLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StringEditor;
