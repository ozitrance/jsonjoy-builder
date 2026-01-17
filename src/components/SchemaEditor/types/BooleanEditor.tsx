import { Switch, Text } from "@mantine/core";
import { useId } from "react";
import { useTranslation } from "../../../hooks/use-translation.ts";
import type { ObjectJSONSchema } from "../../../types/jsonSchema.ts";
import { withObjectSchema } from "../../../types/jsonSchema.ts";
import type { TypeEditorProps } from "../TypeEditor.tsx";
import styles from "./TypeEditors.module.css";

const BooleanEditor: React.FC<TypeEditorProps> = ({
  schema,
  onChange,
  readOnly = false,
}) => {
  const t = useTranslation();
  const allowTrueId = useId();
  const allowFalseId = useId();

  // Extract boolean-specific validation
  const enumValues = withObjectSchema(
    schema,
    (s) => s.enum as boolean[] | undefined,
    null,
  );

  // Determine if we have enum restrictions
  const hasRestrictions = Array.isArray(enumValues);
  const allowsTrue = !hasRestrictions || enumValues?.includes(true) || false;
  const allowsFalse = !hasRestrictions || enumValues?.includes(false) || false;

  // Handle changing the allowed values
  const handleAllowedChange = (value: boolean, allowed: boolean) => {
    let newEnum: boolean[] | undefined;

    if (allowed) {
      // If allowing this value
      if (!hasRestrictions) {
        // No current restrictions, nothing to do
        return;
      }

      if (enumValues?.includes(value)) {
        // Already allowed, nothing to do
        return;
      }

      // Add this value to enum
      newEnum = enumValues ? [...enumValues, value] : [value];

      // If both are now allowed, we can remove the enum constraint
      if (newEnum.includes(true) && newEnum.includes(false)) {
        newEnum = undefined;
      }
    } else {
      // If disallowing this value
      if (hasRestrictions && !enumValues?.includes(value)) {
        // Already disallowed, nothing to do
        return;
      }

      // Create a new enum with just the opposite value
      newEnum = [!value];
    }

    // Create a new validation object with just the type and enum
    const updatedValidation: ObjectJSONSchema = {
      type: "boolean",
    };

    if (newEnum) {
      updatedValidation.enum = newEnum;
    } else {
      // Remove enum property if no restrictions
      onChange({ type: "boolean" });
      return;
    }

    onChange(updatedValidation);
  };

  const hasEnum = enumValues && enumValues.length > 0;

  return (
    <div className={styles.stack}>
      {readOnly && !hasEnum && (
        <Text className={styles.helperText}>{t.booleanNoConstraint}</Text>
      )}
      {(!readOnly || !allowsTrue || !allowsFalse) && (
        <div className={styles.section}>
          {(!readOnly || hasEnum) && (
            <>
              <Text size="sm" fw={500}>
                {t.booleanAllowedValuesLabel}
              </Text>

              <div className={styles.stack}>
                <Switch
                  id={allowTrueId}
                  checked={allowsTrue}
                  disabled={readOnly}
                  onChange={(event) =>
                    handleAllowedChange(true, event.currentTarget.checked)
                  }
                  label={t.booleanAllowTrueLabel}
                />

                <Switch
                  id={allowFalseId}
                  checked={allowsFalse}
                  disabled={readOnly}
                  onChange={(event) =>
                    handleAllowedChange(false, event.currentTarget.checked)
                  }
                  label={t.booleanAllowFalseLabel}
                />
              </div>
            </>
          )}

          {!allowsTrue && !allowsFalse && (
            <Text className={styles.warningText}>
              {t.booleanNeitherWarning}
            </Text>
          )}
        </div>
      )}
    </div>
  );
};

export default BooleanEditor;
