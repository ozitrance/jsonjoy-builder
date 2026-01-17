import { UnstyledButton } from "@mantine/core";
import type { FC } from "react";
import { useTranslation } from "../../hooks/use-translation.ts";
import type { Translation } from "../../i18n/translation-keys.ts";
import { cn } from "../../lib/utils.ts";
import type { SchemaType } from "../../types/jsonSchema.ts";
import styles from "./SchemaTypeSelector.module.css";

interface SchemaTypeSelectorProps {
  id?: string;
  value: SchemaType;
  onChange: (value: SchemaType) => void;
}

interface TypeOption {
  id: SchemaType;
  label: keyof Translation;
  description: keyof Translation;
}

const typeOptions: TypeOption[] = [
  {
    id: "string",
    label: "fieldTypeTextLabel",
    description: "fieldTypeTextDescription",
  },
  {
    id: "number",
    label: "fieldTypeNumberLabel",
    description: "fieldTypeNumberDescription",
  },
  {
    id: "boolean",
    label: "fieldTypeBooleanLabel",
    description: "fieldTypeBooleanDescription",
  },
  {
    id: "object",
    label: "fieldTypeObjectLabel",
    description: "fieldTypeObjectDescription",
  },
  {
    id: "array",
    label: "fieldTypeArrayLabel",
    description: "fieldTypeArrayDescription",
  },
];

const SchemaTypeSelector: FC<SchemaTypeSelectorProps> = ({
  id,
  value,
  onChange,
}) => {
  const t = useTranslation();
  return (
    <div id={id} className={styles.grid}>
      {typeOptions.map((type) => (
        <UnstyledButton
          type="button"
          key={type.id}
          title={t[type.description]}
          className={cn(
            styles.option,
            value === type.id && styles.optionSelected,
          )}
          onClick={() => onChange(type.id)}
        >
          <div className={styles.label}>{t[type.label]}</div>
          <div className={styles.description}>
            {t[type.description]}
          </div>
        </UnstyledButton>
      ))}
    </div>
  );
};

export default SchemaTypeSelector;
