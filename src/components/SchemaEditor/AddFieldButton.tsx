import {
  Badge,
  Button,
  Checkbox,
  Modal,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { CirclePlus, HelpCircle, Info } from "lucide-react";
import { type FC, type FormEvent, useId, useState } from "react";
import { useTranslation } from "../../hooks/use-translation.ts";
import type { NewField, SchemaType } from "../../types/jsonSchema.ts";
import SchemaTypeSelector from "./SchemaTypeSelector.tsx";
import styles from "./AddFieldButton.module.css";

interface AddFieldButtonProps {
  onAddField: (field: NewField) => void;
  variant?: "primary" | "secondary";
}

const AddFieldButton: FC<AddFieldButtonProps> = ({
  onAddField,
  variant = "primary",
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState<SchemaType>("string");
  const [fieldDesc, setFieldDesc] = useState("");
  const [fieldRequired, setFieldRequired] = useState(false);
  const fieldNameId = useId();
  const fieldDescId = useId();
  const fieldRequiredId = useId();
  const fieldTypeId = useId();

  const t = useTranslation();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!fieldName.trim()) return;

    onAddField({
      name: fieldName,
      type: fieldType,
      description: fieldDesc,
      required: fieldRequired,
    });

    setFieldName("");
    setFieldType("string");
    setFieldDesc("");
    setFieldRequired(false);
    setDialogOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        onClick={() => setDialogOpen(true)}
        variant={variant === "primary" ? "filled" : "outline"}
        size="sm"
        className={styles.button}
      >
        <CirclePlus
          size={16}
          className={styles.icon}
        />
        <span>{t.fieldAddNewButton}</span>
      </Button>

      <Modal
        opened={dialogOpen}
        onClose={() => setDialogOpen(false)}
        size="xl"
        centered
        title={
          <div className={styles.modalHeader}>
            <Text fw={600} size="lg">
              {t.fieldAddNewLabel}
            </Text>
            <Badge variant="light" size="sm">
              {t.fieldAddNewBadge}
            </Badge>
          </div>
        }
        classNames={{ content: styles.modalContent }}
      >
        <Text className={styles.modalDescription}>
          {t.fieldAddNewDescription}
        </Text>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.grid}>
            <div className={styles.fieldGroup}>
              <div>
                <div className={styles.labelRow}>
                  <Text fw={500} size="sm">
                    {t.fieldNameLabel}
                  </Text>
                  <Tooltip label={t.fieldNameTooltip} withArrow>
                    <Info size={16} />
                  </Tooltip>
                </div>
                <TextInput
                  id={fieldNameId}
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  placeholder={t.fieldNamePlaceholder}
                  required
                  size="sm"
                />
              </div>

              <div>
                <div className={styles.labelRow}>
                  <Text fw={500} size="sm">
                    {t.fieldDescription}
                  </Text>
                  <Tooltip label={t.fieldDescriptionTooltip} withArrow>
                    <Info size={16} />
                  </Tooltip>
                </div>
                <TextInput
                  id={fieldDescId}
                  value={fieldDesc}
                  onChange={(e) => setFieldDesc(e.target.value)}
                  placeholder={t.fieldDescriptionPlaceholder}
                  size="sm"
                />
              </div>

              <div className={styles.checkboxCard}>
                <Checkbox
                  id={fieldRequiredId}
                  checked={fieldRequired}
                  onChange={(e) => setFieldRequired(e.currentTarget.checked)}
                  label={t.fieldRequiredLabel}
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <div>
                <div className={styles.labelRow}>
                  <Text fw={500} size="sm">
                    {t.fieldType}
                  </Text>
                  <Tooltip
                    label={
                      <div>
                        <div>• {t.fieldTypeTooltipString}</div>
                        <div>• {t.fieldTypeTooltipNumber}</div>
                        <div>• {t.fieldTypeTooltipBoolean}</div>
                        <div>• {t.fieldTypeTooltipObject}</div>
                        <div>• {t.fieldTypeTooltipArray}</div>
                      </div>
                    }
                    withArrow
                  >
                    <HelpCircle size={16} />
                  </Tooltip>
                </div>
                <SchemaTypeSelector
                  id={fieldTypeId}
                  value={fieldType}
                  onChange={setFieldType}
                />
              </div>

              <div className={styles.exampleCard}>
                <Text className={styles.exampleTitle}>
                  {t.fieldTypeExample}
                </Text>
                <code className={styles.exampleCode}>
                  {fieldType === "string" && '"example"'}
                  {fieldType === "number" && "42"}
                  {fieldType === "boolean" && "true"}
                  {fieldType === "object" && '{ "key": "value" }'}
                  {fieldType === "array" && '["item1", "item2"]'}
                </code>
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(false)}
            >
              {t.fieldAddNewCancel}
            </Button>
            <Button type="submit" size="sm">
              {t.fieldAddNewConfirm}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default AddFieldButton;
