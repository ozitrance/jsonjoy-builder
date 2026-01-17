import { ActionIcon, Text } from "@mantine/core";
import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { Download, FileJson, Loader2 } from "lucide-react";
import { type FC, useEffect, useRef } from "react";
import { useMonacoTheme } from "../../hooks/use-monaco-theme.ts";
import { useTranslation } from "../../hooks/use-translation.ts";
import { cn } from "../../lib/utils.ts";
import type { JSONSchema } from "../../types/jsonSchema.ts";
import styles from "./JsonSchemaVisualizer.module.css";

/** @public */
export interface JsonSchemaVisualizerProps {
  schema: JSONSchema;
  className?: string;
  onChange?: (schema: JSONSchema) => void;
}

/** @public */
const JsonSchemaVisualizer: FC<JsonSchemaVisualizerProps> = ({
  schema,
  className,
  onChange,
}) => {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const {
    currentTheme,
    defineMonacoThemes,
    configureJsonDefaults,
    setupRequiredFieldHighlighting,
    defaultEditorOptions,
  } = useMonacoTheme();
  const requiredHighlightDisposeRef = useRef<null | (() => void)>(null);

  const t = useTranslation();

  useEffect(() => {
    return () => {
      requiredHighlightDisposeRef.current?.();
      requiredHighlightDisposeRef.current = null;
    };
  }, []);

  const handleBeforeMount: BeforeMount = (monaco) => {
    defineMonacoThemes(monaco);
    configureJsonDefaults(monaco);
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.focus();
    requiredHighlightDisposeRef.current?.();
    requiredHighlightDisposeRef.current = setupRequiredFieldHighlighting(
      monaco,
      editor,
    );
  };

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;

    try {
      const parsedJson = JSON.parse(value);
      if (onChange) {
        onChange(parsedJson);
      }
    } catch (_error) {
      // Monaco will show the error inline, no need for additional error handling
    }
  };

  const handleDownload = () => {
    const content = JSON.stringify(schema, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = t.visualizerDownloadFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn(styles.container, className, "jsonjoy")}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <FileJson size={18} />
          <Text className={styles.title}>{t.visualizerSource}</Text>
        </div>
        <ActionIcon
          type="button"
          variant="subtle"
          onClick={handleDownload}
          aria-label={t.visualizerDownloadTitle}
        >
          <Download size={16} />
        </ActionIcon>
      </div>
      <div className={styles.editorArea}>
        <Editor
          height="100%"
          language="json"
          value={JSON.stringify(schema, null, 2)}
          onChange={handleEditorChange}
          beforeMount={handleBeforeMount}
          onMount={handleEditorDidMount}
          className={styles.editorContainer}
          loading={
            <div className={styles.loader}>
              <Loader2 size={24} className="jsonjoy-spin" />
            </div>
          }
          options={defaultEditorOptions}
          theme={currentTheme}
        />
      </div>
    </div>
  );
};

export default JsonSchemaVisualizer;
