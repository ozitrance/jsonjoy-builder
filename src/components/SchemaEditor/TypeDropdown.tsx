import { Menu, UnstyledButton } from "@mantine/core";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "../../hooks/use-translation.ts";
import { cn, getTypeColor, getTypeLabel } from "../../lib/utils.ts";
import type { SchemaType } from "../../types/jsonSchema.ts";
import styles from "./TypeDropdown.module.css";

export interface TypeDropdownProps {
  value: SchemaType;
  onChange: (value: SchemaType) => void;
  className?: string;
  readOnly: boolean;
}

const typeOptions: SchemaType[] = [
  "string",
  "number",
  "boolean",
  "object",
  "array",
  "null",
];

export const TypeDropdown: React.FC<TypeDropdownProps> = ({
  value,
  onChange,
  className,
  readOnly,
}) => {
  const t = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.root}>
      {readOnly ? (
        <span
          className={cn(styles.button, getTypeColor(value), className)}
          aria-label={getTypeLabel(t, value)}
        >
          {getTypeLabel(t, value)}
        </span>
      ) : (
        <Menu opened={isOpen} onChange={setIsOpen} withinPortal>
          <Menu.Target>
            <UnstyledButton
              type="button"
              className={cn(
                styles.button,
                styles.buttonInteractive,
                getTypeColor(value),
                className,
              )}
              onClick={() => setIsOpen((prev) => !prev)}
            >
              <span>{getTypeLabel(t, value)}</span>
              <ChevronDown size={14} />
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>
            {typeOptions.map((type) => (
              <Menu.Item
                key={type}
                className={styles.menuItem}
                onClick={() => {
                  onChange(type);
                  setIsOpen(false);
                }}
                rightSection={value === type ? <Check size={14} /> : null}
              >
                <span className={styles.menuLabel}>
                  <span className={getTypeColor(type)}>
                    {getTypeLabel(t, type)}
                  </span>
                </span>
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      )}
    </div>
  );
};

export default TypeDropdown;
