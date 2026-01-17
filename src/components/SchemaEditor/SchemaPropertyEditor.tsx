import { ActionIcon, Badge, Button, Text, TextInput } from "@mantine/core";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "../../hooks/use-translation.ts";
import { cn } from "../../lib/utils.ts";
import type {
  JSONSchema,
  ObjectJSONSchema,
  SchemaType,
} from "../../types/jsonSchema.ts";
import {
  asObjectSchema,
  getSchemaDescription,
  withObjectSchema,
} from "../../types/jsonSchema.ts";
import type { ValidationTreeNode } from "../../types/validation.ts";
import TypeDropdown from "./TypeDropdown.tsx";
import TypeEditor from "./TypeEditor.tsx";
import styles from "./SchemaPropertyEditor.module.css";

export interface SchemaPropertyEditorProps {
  name: string;
  schema: JSONSchema;
  required: boolean;
  readOnly: boolean;
  validationNode?: ValidationTreeNode;
  onDelete: () => void;
  onNameChange: (newName: string) => void;
  onRequiredChange: (required: boolean) => void;
  onSchemaChange: (schema: ObjectJSONSchema) => void;
  depth?: number;
}

export const SchemaPropertyEditor: React.FC<SchemaPropertyEditorProps> = ({
  name,
  schema,
  required,
  readOnly = false,
  validationNode,
  onDelete,
  onNameChange,
  onRequiredChange,
  onSchemaChange,
  depth = 0,
}) => {
  const t = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [tempName, setTempName] = useState(name);
  const [tempDesc, setTempDesc] = useState(getSchemaDescription(schema));
  const type = withObjectSchema(
    schema,
    (s) => (s.type || "object") as SchemaType,
    "object" as SchemaType,
  );

  // Update temp values when props change
  useEffect(() => {
    setTempName(name);
    setTempDesc(getSchemaDescription(schema));
  }, [name, schema]);

  const handleNameSubmit = () => {
    const trimmedName = tempName.trim();
    if (trimmedName && trimmedName !== name) {
      onNameChange(trimmedName);
    } else {
      setTempName(name);
    }
    setIsEditingName(false);
  };

  const handleDescSubmit = () => {
    const trimmedDesc = tempDesc.trim();
    if (trimmedDesc !== getSchemaDescription(schema)) {
      onSchemaChange({
        ...asObjectSchema(schema),
        description: trimmedDesc || undefined,
      });
    } else {
      setTempDesc(getSchemaDescription(schema));
    }
    setIsEditingDesc(false);
  };

  // Handle schema changes, preserving description
  const handleSchemaUpdate = (updatedSchema: ObjectJSONSchema) => {
    const description = getSchemaDescription(schema);
    onSchemaChange({
      ...updatedSchema,
      description: description || undefined,
    });
  };

  return (
    <div
      className={cn(styles.card, depth > 0 && styles.nested)}
    >
      <div className={styles.row}>
        <ActionIcon
          type="button"
          variant="subtle"
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? t.collapse : t.expand}
          className={styles.expandButton}
        >
          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </ActionIcon>

        <div className={styles.inlineInput}>
          {!readOnly && isEditingName ? (
            <TextInput
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
              size="xs"
              autoFocus
              onFocus={(e) => e.target.select()}
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingName(true)}
              onKeyDown={(e) => e.key === "Enter" && setIsEditingName(true)}
              className={styles.nameButton}
            >
              {name}
            </button>
          )}
        </div>

        <div className={styles.inlineInput}>
          {!readOnly && isEditingDesc ? (
            <TextInput
              value={tempDesc}
              onChange={(e) => setTempDesc(e.target.value)}
              onBlur={handleDescSubmit}
              onKeyDown={(e) => e.key === "Enter" && handleDescSubmit()}
              placeholder={t.propertyDescriptionPlaceholder}
              size="xs"
              autoFocus
              onFocus={(e) => e.target.select()}
            />
          ) : tempDesc ? (
            <button
              type="button"
              onClick={() => setIsEditingDesc(true)}
              onKeyDown={(e) => e.key === "Enter" && setIsEditingDesc(true)}
              className={styles.descButton}
            >
              {tempDesc}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingDesc(true)}
              onKeyDown={(e) => e.key === "Enter" && setIsEditingDesc(true)}
              className={cn(styles.descButton, styles.descButtonMuted)}
            >
              {t.propertyDescriptionButton}
            </button>
          )}
        </div>

        <div className={styles.typeGroup}>
          <TypeDropdown
            value={type}
            readOnly={readOnly}
            onChange={(newType) => {
              onSchemaChange({
                ...asObjectSchema(schema),
                type: newType,
              });
            }}
          />

          <Button
            type="button"
            size="xs"
            variant="light"
            color={required ? "red" : "gray"}
            onClick={() => !readOnly && onRequiredChange(!required)}
            disabled={readOnly}
            className={styles.requiredButton}
          >
            {required ? t.propertyRequired : t.propertyOptional}
          </Button>
        </div>

        {validationNode?.cumulativeChildrenErrors > 0 && (
          <Badge
            color="red"
            size="sm"
            radius="xl"
            className={styles.errorBadge}
          >
            {validationNode.cumulativeChildrenErrors}
          </Badge>
        )}

        {!readOnly && (
          <div className={styles.hoverActions}>
            <ActionIcon
              type="button"
              variant="subtle"
              color="red"
              onClick={onDelete}
              aria-label={t.propertyDelete}
            >
              <X size={16} />
            </ActionIcon>
          </div>
        )}
      </div>

      {/* Type-specific editor */}
      {expanded && (
        <div className={styles.details}>
          {readOnly && tempDesc && (
            <Text size="sm" className={styles.detailsDesc}>
              {tempDesc}
            </Text>
          )}
          <TypeEditor
            schema={schema}
            readOnly={readOnly}
            validationNode={validationNode}
            onChange={handleSchemaUpdate}
            depth={depth + 1}
          />
        </div>
      )}
    </div>
  );
};

export default SchemaPropertyEditor;
