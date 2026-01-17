import { Switch, Text, TextInput } from "@mantine/core";
import { useId, useMemo, useState } from "react";
import { useTranslation } from "../../../hooks/use-translation.ts";
import { getArrayItemsSchema } from "../../../lib/schemaEditor.ts";
import { cn } from "../../../lib/utils.ts";
import type {
  ObjectJSONSchema,
  SchemaType,
} from "../../../types/jsonSchema.ts";
import {
  isBooleanSchema,
  withObjectSchema,
} from "../../../types/jsonSchema.ts";
import TypeDropdown from "../TypeDropdown.tsx";
import type { TypeEditorProps } from "../TypeEditor.tsx";
import TypeEditor from "../TypeEditor.tsx";
import styles from "./TypeEditors.module.css";

const ArrayEditor: React.FC<TypeEditorProps> = ({
  schema,
  readOnly = false,
  validationNode,
  onChange,
  depth = 0,
}) => {
  const t = useTranslation();
  const [minItems, setMinItems] = useState<number | undefined>(
    withObjectSchema(schema, (s) => s.minItems, undefined),
  );
  const [maxItems, setMaxItems] = useState<number | undefined>(
    withObjectSchema(schema, (s) => s.maxItems, undefined),
  );
  const [uniqueItems, setUniqueItems] = useState<boolean>(
    withObjectSchema(schema, (s) => s.uniqueItems || false, false),
  );

  const minItemsId = useId();
  const maxItemsId = useId();
  const uniqueItemsId = useId();

  // Get the array's item schema
  const itemsSchema = getArrayItemsSchema(schema) || { type: "string" };

  // Get the type of the array items
  const itemType = withObjectSchema(
    itemsSchema,
    (s) => (s.type || "string") as SchemaType,
    "string" as SchemaType,
  );

  // Handle validation settings change
  const handleValidationChange = () => {
    const propsToKeep = buildValidationProps();

    onChange(propsToKeep as ObjectJSONSchema);
  };

  /**
   * Builds and normalizes the JSON Schema validation properties for an array schema.
   *
   * This helper merges base schema constraints with optional overrides,
   * preserves the `items` schema when not explicitly provided,
   * and removes any undefined properties to produce a clean schema object.
   */
  const buildValidationProps = ({
    minItems: overrideMinItems,
    maxItems: overrideMaxItems,
    uniqueItems: overrideUniqueItems,
  }: {
    minItems?: number;
    maxItems?: number;
    uniqueItems?: boolean;
  } = {}) => {
    const validationProps: ObjectJSONSchema = {
      type: "array",
      ...(isBooleanSchema(schema) ? {} : schema),
      minItems: overrideMinItems || minItems,
      maxItems: overrideMaxItems || maxItems,
      uniqueItems: overrideUniqueItems || undefined,
    };

    // Keep the items schema
    if (validationProps.items === undefined && itemsSchema) {
      validationProps.items = itemsSchema;
    }

    // Clean up undefined values
    const propsToKeep: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(validationProps)) {
      if (value !== undefined) {
        propsToKeep[key] = value;
      }
    }

    return propsToKeep as ObjectJSONSchema;
  };

  // Handle item schema changes
  const handleItemSchemaChange = (updatedItemSchema: ObjectJSONSchema) => {
    const updatedSchema: ObjectJSONSchema = {
      type: "array",
      ...(isBooleanSchema(schema) ? {} : schema),
      items: updatedItemSchema,
    };

    onChange(updatedSchema);
  };

  const minMaxError = useMemo(
    () =>
      validationNode?.validation.errors?.find((err) => err.path[0] === "minmax")
        ?.message,
    [validationNode],
  );

  const minItemsError = useMemo(
    () =>
      validationNode?.validation.errors?.find(
        (err) => err.path[0] === "minItems",
      )?.message,
    [validationNode],
  );

  const maxItemsError = useMemo(
    () =>
      validationNode?.validation.errors?.find(
        (err) => err.path[0] === "maxItems",
      )?.message,
    [validationNode],
  );

  return (
    <div className={styles.stack}>
      {/* Array validation settings */}
      {(!readOnly || !!maxItems || !!minItems) && (
        <div className={styles.grid}>
          {(!readOnly || !!minItems) && (
            <TextInput
              id={minItemsId}
              type="number"
              min={0}
              value={minItems ?? ""}
              onChange={(e) => {
                const value = e.target.value
                  ? Number(e.target.value)
                  : undefined;
                setMinItems(value);
                // Don't update immediately to avoid too many rerenders
              }}
              onBlur={handleValidationChange}
              label={t.arrayMinimumLabel}
              placeholder={t.arrayMinimumPlaceholder}
              error={minMaxError || minItemsError || undefined}
              size="xs"
            />
          )}

          {(!readOnly || !!maxItems) && (
            <TextInput
              id={maxItemsId}
              type="number"
              min={0}
              value={maxItems ?? ""}
              onChange={(e) => {
                const value = e.target.value
                  ? Number(e.target.value)
                  : undefined;
                setMaxItems(value);
                // Don't update immediately to avoid too many rerenders
              }}
              onBlur={handleValidationChange}
              label={t.arrayMaximumLabel}
              placeholder={t.arrayMaximumPlaceholder}
              error={minMaxError || maxItemsError || undefined}
              size="xs"
            />
          )}
        </div>
      )}

      {(!readOnly || !!uniqueItems) && (
        <Switch
          id={uniqueItemsId}
          checked={uniqueItems}
          onChange={(event) => {
            setUniqueItems(event.currentTarget.checked);
            onChange(buildValidationProps({ uniqueItems: event.currentTarget.checked }));
          }}
          label={t.arrayForceUniqueItemsLabel}
        />
      )}

      {/* Array item type editor */}
      <div
        className={cn(
          styles.section,
          !readOnly || !!minItems || !!maxItems || !!uniqueItems
            ? styles.divider
            : null,
        )}
      >
        <div className={styles.enumActions}>
          <Text size="sm" fw={500}>
            {t.arrayItemTypeLabel}
          </Text>
          <TypeDropdown
            readOnly={readOnly}
            value={itemType}
            onChange={(newType) => {
              handleItemSchemaChange({
                ...withObjectSchema(itemsSchema, (s) => s, {}),
                type: newType,
              });
            }}
          />
        </div>

        {/* Item schema editor */}
        <TypeEditor
          readOnly={readOnly}
          schema={itemsSchema}
          validationNode={validationNode}
          onChange={handleItemSchemaChange}
          depth={depth + 1}
        />
      </div>
    </div>
  );
};

export default ArrayEditor;
