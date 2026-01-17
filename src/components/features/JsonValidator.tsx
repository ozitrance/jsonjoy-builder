import { Modal, Text } from "@mantine/core";
import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import type * as Monaco from "monaco-editor";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMonacoTheme } from "../../hooks/use-monaco-theme.ts";
import {
  formatTranslation,
  useTranslation,
} from "../../hooks/use-translation.ts";
import type { JSONSchema } from "../../types/jsonSchema.ts";
import {
  type ValidationResult,
  validateJson,
} from "../../utils/jsonValidator.ts";
import styles from "./JsonValidator.module.css";

/** @public */
export interface JsonValidatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schema: JSONSchema;
}

/** @public */
export function JsonValidator({
  open,
  onOpenChange,
  schema,
}: JsonValidatorProps) {
  const t = useTranslation();
  const [jsonInput, setJsonInput] = useState("");
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const schemaMonacoRef = useRef<typeof Monaco | null>(null);
  const {
    currentTheme,
    defineMonacoThemes,
    configureJsonDefaults,
    defaultEditorOptions,
  } = useMonacoTheme();

  const validateJsonAgainstSchema = useCallback(() => {
    if (!jsonInput.trim()) {
      setValidationResult(null);
      return;
    }

    const result = validateJson(jsonInput, schema);
    setValidationResult(result);
  }, [jsonInput, schema]);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      validateJsonAgainstSchema();
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [validateJsonAgainstSchema]);

  const handleJsonEditorBeforeMount: BeforeMount = (monaco) => {
    monacoRef.current = monaco;
    defineMonacoThemes(monaco);
    configureJsonDefaults(monaco, schema);
  };

  const handleSchemaEditorBeforeMount: BeforeMount = (monaco) => {
    schemaMonacoRef.current = monaco;
    defineMonacoThemes(monaco);
  };

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleEditorChange = (value: string | undefined) => {
    setJsonInput(value || "");
  };

  const goToError = (line: number, column: number) => {
    if (editorRef.current) {
      editorRef.current.revealLineInCenter(line);
      editorRef.current.setPosition({ lineNumber: line, column: column });
      editorRef.current.focus();
    }
  };

  // Create a modified version of defaultEditorOptions for the editor
  const editorOptions = {
    ...defaultEditorOptions,
    readOnly: false,
  };

  // Create read-only options for the schema viewer
  const schemaViewerOptions = {
    ...defaultEditorOptions,
    readOnly: true,
  };

  return (
    <Modal
      opened={open}
      onClose={() => onOpenChange(false)}
      size="xl"
      title={t.validatorTitle}
      classNames={{ content: styles.modalContent }}
      centered
    >
      <Text size="sm" c="dimmed">
        {t.validatorDescription}
      </Text>
      <div className={styles.body}>
        <div className={styles.panels}>
          <div className={styles.panel}>
            <Text className={styles.panelTitle}>{t.validatorContent}</Text>
            <div className={styles.editorContainer}>
              <Editor
                height="600px"
                defaultLanguage="json"
                value={jsonInput}
                onChange={handleEditorChange}
                beforeMount={handleJsonEditorBeforeMount}
                onMount={handleEditorDidMount}
                loading={
                  <div className={styles.loader}>
                    <Loader2 size={24} className="jsonjoy-spin" />
                  </div>
                }
                options={editorOptions}
                theme={currentTheme}
              />
            </div>
          </div>

          <div className={styles.panel}>
            <Text className={styles.panelTitle}>
              {t.validatorCurrentSchema}
            </Text>
            <div className={styles.editorContainer}>
              <Editor
                height="600px"
                defaultLanguage="json"
                value={JSON.stringify(schema, null, 2)}
                beforeMount={handleSchemaEditorBeforeMount}
                loading={
                  <div className={styles.loader}>
                    <Loader2 size={24} className="jsonjoy-spin" />
                  </div>
                }
                options={schemaViewerOptions}
                theme={currentTheme}
              />
            </div>
          </div>
        </div>

        {validationResult && (
          <div
            className={`${styles.result} ${
              validationResult.valid
                ? styles.resultSuccess
                : styles.resultError
            }`}
          >
            <div className={styles.resultHeader}>
              {validationResult.valid ? (
                <>
                  <Check size={20} className={styles.iconSuccess} />
                  <Text className={styles.resultTitle} c="green">
                    {t.validatorValid}
                  </Text>
                </>
              ) : (
                <>
                  <AlertCircle size={20} className={styles.iconError} />
                  <Text className={styles.resultTitle} c="red">
                    {validationResult.errors.length === 1
                      ? validationResult.errors[0].path === "/"
                        ? t.validatorErrorInvalidSyntax
                        : t.validatorErrorSchemaValidation
                      : formatTranslation(t.validatorErrorCount, {
                          count: validationResult.errors.length,
                        })}
                  </Text>
                </>
              )}
            </div>

            {!validationResult.valid &&
              validationResult.errors &&
              validationResult.errors.length > 0 && (
                <div className={styles.errorDetails}>
                  {validationResult.errors[0] && (
                    <div className={styles.errorPathRow}>
                      <span className={styles.errorPath}>
                        {validationResult.errors[0].path === "/"
                          ? t.validatorErrorPathRoot
                          : validationResult.errors[0].path}
                      </span>
                      {validationResult.errors[0].line && (
                        <span className={styles.errorLocation}>
                          {validationResult.errors[0].column
                            ? formatTranslation(
                                t.validatorErrorLocationLineAndColumn,
                                {
                                  line: validationResult.errors[0].line,
                                  column: validationResult.errors[0].column,
                                },
                              )
                            : formatTranslation(
                                t.validatorErrorLocationLineOnly,
                                { line: validationResult.errors[0].line },
                              )}
                        </span>
                      )}
                    </div>
                  )}
                  <div className={styles.errorList}>
                    {validationResult.errors.map((error, index) => (
                      <button
                        key={`error-${error.path}-${index}`}
                        type="button"
                        className={styles.errorItem}
                        onClick={() =>
                          error.line &&
                          error.column &&
                          goToError(error.line, error.column)
                        }
                      >
                        <div className={styles.errorItemHeader}>
                          <div>
                            <p className={styles.errorItemTitle}>
                              {error.path === "/"
                                ? t.validatorErrorPathRoot
                                : error.path}
                            </p>
                            <p className={styles.errorItemMessage}>
                              {error.message}
                            </p>
                          </div>
                          {error.line && (
                            <div className={styles.errorLocation}>
                              {error.column
                                ? formatTranslation(
                                    t.validatorErrorLocationLineAndColumn,
                                    { line: error.line, column: error.column },
                                  )
                                : formatTranslation(
                                    t.validatorErrorLocationLineOnly,
                                    { line: error.line },
                                  )}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </Modal>
  );
}
