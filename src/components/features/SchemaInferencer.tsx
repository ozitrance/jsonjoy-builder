import { Button, Modal, Text } from "@mantine/core";
import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useMonacoTheme } from "../../hooks/use-monaco-theme.ts";
import { useTranslation } from "../../hooks/use-translation.ts";
import { createSchemaFromJson } from "../../lib/schema-inference.ts";
import type { JSONSchema } from "../../types/jsonSchema.ts";
import styles from "./SchemaInferencer.module.css";

/** @public */
export interface SchemaInferencerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSchemaInferred: (schema: JSONSchema) => void;
}

/** @public */
export function SchemaInferencer({
  open,
  onOpenChange,
  onSchemaInferred,
}: SchemaInferencerProps) {
  const t = useTranslation();
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const {
    currentTheme,
    defineMonacoThemes,
    configureJsonDefaults,
    defaultEditorOptions,
  } = useMonacoTheme();

  const handleBeforeMount: BeforeMount = (monaco) => {
    defineMonacoThemes(monaco);
    configureJsonDefaults(monaco);
  };

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleEditorChange = (value: string | undefined) => {
    setJsonInput(value || "");
  };

  const inferSchemaFromJson = () => {
    try {
      const jsonObject = JSON.parse(jsonInput);
      setError(null);

      // Use the schema inference service to create a schema
      const inferredSchema = createSchemaFromJson(jsonObject);

      onSchemaInferred(inferredSchema);
      onOpenChange(false);
    } catch (error) {
      console.error("Invalid JSON input:", error);
      setError(t.inferrerErrorInvalidJson);
    }
  };

  const handleClose = () => {
    setJsonInput("");
    setError(null);
    onOpenChange(false);
  };

  return (
    <Modal
      opened={open}
      onClose={handleClose}
      size="lg"
      title={t.inferrerTitle}
      classNames={{ content: styles.modalContent }}
      centered
    >
      <Text size="sm" c="dimmed">
        {t.inferrerDescription}
      </Text>
      <div className={styles.body}>
        <div className={styles.editorContainer}>
          <Editor
            height="450px"
            defaultLanguage="json"
            value={jsonInput}
            onChange={handleEditorChange}
            beforeMount={handleBeforeMount}
            onMount={handleEditorDidMount}
            options={defaultEditorOptions}
            theme={currentTheme}
            loading={
              <div className={styles.loader}>
                <Loader2 size={24} className="jsonjoy-spin" />
              </div>
            }
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </div>
      <div className={styles.footer}>
        <Button type="button" variant="outline" onClick={handleClose}>
          {t.inferrerCancel}
        </Button>
        <Button type="button" onClick={inferSchemaFromJson}>
          {t.inferrerGenerate}
        </Button>
      </div>
    </Modal>
  );
}
