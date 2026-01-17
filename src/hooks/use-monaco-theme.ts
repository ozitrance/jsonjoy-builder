import type * as Monaco from "monaco-editor";
import type { json as MonacoJson } from "monaco-editor";
import * as MonacoModule from "monaco-editor";
import { useEffect, useState } from "react";
import type { JSONSchema } from "../types/jsonSchema.ts";

export interface MonacoEditorOptions {
  minimap?: { enabled: boolean };
  fontSize?: number;
  fontFamily?: string;
  lineNumbers?: "on" | "off";
  roundedSelection?: boolean;
  scrollBeyondLastLine?: boolean;
  readOnly?: boolean;
  automaticLayout?: boolean;
  formatOnPaste?: boolean;
  formatOnType?: boolean;
  tabSize?: number;
  insertSpaces?: boolean;
  detectIndentation?: boolean;
  folding?: boolean;
  foldingStrategy?: "auto" | "indentation";
  renderLineHighlight?: "all" | "line" | "none" | "gutter";
  matchBrackets?: "always" | "near" | "never";
  autoClosingBrackets?:
    | "always"
    | "languageDefined"
    | "beforeWhitespace"
    | "never";
  autoClosingQuotes?:
    | "always"
    | "languageDefined"
    | "beforeWhitespace"
    | "never";
  guides?: {
    bracketPairs?: boolean;
    indentation?: boolean;
  };
}

export const defaultEditorOptions: MonacoEditorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  fontFamily:
    "var(--mantine-font-family), 'SF Mono', Monaco, Menlo, Consolas, monospace",
  lineNumbers: "on",
  roundedSelection: false,
  scrollBeyondLastLine: false,
  readOnly: false,
  automaticLayout: true,
  formatOnPaste: true,
  formatOnType: true,
  tabSize: 2,
  insertSpaces: true,
  detectIndentation: true,
  folding: true,
  foldingStrategy: "indentation",
  renderLineHighlight: "all",
  matchBrackets: "always",
  autoClosingBrackets: "always",
  autoClosingQuotes: "always",
  guides: {
    bracketPairs: true,
    indentation: true,
  },
};

export function useMonacoTheme() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for dark mode by examining CSS variables
  useEffect(() => {
    const checkDarkMode = () => {
      const scheme =
        document.documentElement.getAttribute("data-mantine-color-scheme");
      if (scheme) {
        setIsDarkMode(scheme === "dark");
        return;
      }

      if (typeof window !== "undefined") {
        setIsDarkMode(
          window.matchMedia("(prefers-color-scheme: dark)").matches,
        );
      }
    };

    // Check initially
    checkDarkMode();

    // Set up a mutation observer to detect theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-mantine-color-scheme"],
    });

    return () => observer.disconnect();
  }, []);

  const defineMonacoThemes = (monaco: typeof Monaco) => {
    const getCssColor = (name: string, fallback: string) => {
      if (typeof window === "undefined") return fallback;
      const value = getComputedStyle(
        document.documentElement,
      ).getPropertyValue(name);
      return value?.trim() || fallback;
    };

    const palette = {
      stringLight: getCssColor("--mantine-color-blue-7", "#ae3ec9"),
      stringDark: getCssColor("--mantine-color-blue-7", "#ae3ec9"),
      numberLight: getCssColor("--mantine-color-grape-7", "#ae3ec9"),
      numberDark: getCssColor("--mantine-color-grape-7", "#ae3ec9"),
      booleanLight: getCssColor("--mantine-color-green-7", "#37b24d"),
      booleanDark: getCssColor("--mantine-color-green-7", "#37b24d"),
      objectLight: getCssColor("--mantine-color-orange-7", "#f76707"),
      objectDark: getCssColor("--mantine-color-orange-7", "#f76707"),
      arrayLight: getCssColor("--mantine-color-pink-7", "#d6336c"),
      arrayDark: getCssColor("--mantine-color-pink-7", "#d6336c"),
      nullLight: getCssColor("--mantine-color-gray-7", "#495057"),
      nullDark: getCssColor("--mantine-color-gray-7", "#495057"),
      punctuationLight: getCssColor("--mantine-color-gray-6", "#868e96"),
      punctuationDark: getCssColor("--mantine-color-gray-6", "#868e96"),
      requiredLight: getCssColor("--mantine-color-red-7", "#f03e3e"),
      requiredDark: getCssColor("--mantine-color-red-7", "#f03e3e"),
    };

    // Define custom light theme that matches app colors
    monaco.editor.defineTheme("appLightTheme", {
      base: "vs",
      inherit: true,
      rules: [
        // JSON syntax highlighting
        { token: "string.key.json", foreground: palette.stringLight },
        { token: "string.value.json", foreground: palette.stringLight },
        { token: "string", foreground: palette.stringLight },
        { token: "number", foreground: palette.numberLight },
        { token: "boolean", foreground: palette.booleanLight },
        { token: "keyword.json", foreground: palette.booleanLight },
        { token: "keyword", foreground: palette.booleanLight },
        { token: "null", foreground: palette.nullLight },
        { token: "delimiter.bracket.json", foreground: palette.objectLight },
        { token: "delimiter.array.json", foreground: palette.arrayLight },
        { token: "delimiter.colon.json", foreground: palette.punctuationLight },
        { token: "delimiter.comma.json", foreground: palette.punctuationLight },
        {
          token: "invalid",
          foreground: palette.requiredLight,
          fontStyle: "underline",
        },
      ],
      colors: {
        // Light theme colors (using hex values instead of CSS variables)
        "editor.background": "#f8fafc", // --background
        "editor.foreground": "#495057", // mantine gray-7
        "editorCursor.foreground": "#0f172a", // --foreground
        "editor.lineHighlightBackground": "#f1f5f9", // --muted
        "editorLineNumber.foreground": "#64748b", // --muted-foreground
        "editor.selectionBackground": "#e2e8f0", // --accent
        "editor.inactiveSelectionBackground": "#e2e8f0", // --accent
        "editorIndentGuide.background": "#e2e8f0", // --border
        "editor.findMatchBackground": "#cbd5e1", // --accent
        "editor.findMatchHighlightBackground": "#cbd5e133", // --accent with opacity
      },
    });

    // Define custom dark theme that matches app colors
    monaco.editor.defineTheme("appDarkTheme", {
      base: "vs-dark",
      inherit: true,
      rules: [
        // JSON syntax highlighting
        { token: "string.key.json", foreground: palette.stringDark },
        { token: "string.value.json", foreground: palette.stringDark },
        { token: "string", foreground: palette.stringDark },
        { token: "number", foreground: palette.numberDark },
        { token: "boolean", foreground: palette.booleanDark },
        { token: "keyword.json", foreground: palette.booleanDark },
        { token: "keyword", foreground: palette.booleanDark },
        { token: "null", foreground: palette.nullDark },
        { token: "delimiter.bracket.json", foreground: palette.objectDark },
        { token: "delimiter.array.json", foreground: palette.arrayDark },
        { token: "delimiter.colon.json", foreground: palette.punctuationDark },
        { token: "delimiter.comma.json", foreground: palette.punctuationDark },
        {
          token: "invalid",
          foreground: palette.requiredDark,
          fontStyle: "underline",
        },
      ],
      colors: {
        // Dark theme colors (using hex values instead of CSS variables)
        "editor.background": "#0f172a", // --background
        "editor.foreground": "#c9c9c9", // mantine dark-0
        "editorCursor.foreground": "#f8fafc", // --foreground
        "editor.lineHighlightBackground": "#1e293b", // --muted
        "editorLineNumber.foreground": "#64748b", // --muted-foreground
        "editor.selectionBackground": "#334155", // --accent
        "editor.inactiveSelectionBackground": "#334155", // --accent
        "editorIndentGuide.background": "#1e293b", // --border
        "editor.findMatchBackground": "#475569", // --accent
        "editor.findMatchHighlightBackground": "#47556933", // --accent with opacity
      },
    });
  };

  const setupRequiredFieldHighlighting = (
    monaco: typeof Monaco,
    editor: Monaco.editor.IStandaloneCodeEditor,
  ) => {
    let decorations: string[] = [];
    let disposed = false;
    let requestId = 0;

    const typeClassByValue: Record<string, string> = {
      string: "jsonjoy-token-type-string",
      number: "jsonjoy-token-type-number",
      integer: "jsonjoy-token-type-number",
      boolean: "jsonjoy-token-type-boolean",
      object: "jsonjoy-token-type-object",
      array: "jsonjoy-token-type-array",
      null: "jsonjoy-token-type-null",
    };

    const collectRequiredStrings = (
      node: MonacoJson.ASTNode,
      results: MonacoJson.StringASTNode[],
    ) => {
      if (node.type === "object") {
        for (const property of node.properties) {
          if (
            property.keyNode.value === "required" &&
            property.valueNode?.type === "array"
          ) {
            for (const item of property.valueNode.items) {
              if (item.type === "string") {
                results.push(item);
              }
            }
          }
        }

        for (const property of node.properties) {
          if (property.valueNode) {
            collectRequiredStrings(property.valueNode, results);
          }
        }
        return;
      }

      if (node.type === "array") {
        for (const item of node.items) {
          collectRequiredStrings(item, results);
        }
      }
    };

    const collectSchemaTypeStrings = (
      node: MonacoJson.ASTNode,
      results: Array<{ node: MonacoJson.StringASTNode; className: string }>,
    ) => {
      if (node.type === "object") {
        for (const property of node.properties) {
          if (property.keyNode.value === "type") {
            if (property.valueNode?.type === "string") {
              const className = typeClassByValue[property.valueNode.value];
              if (className) {
                results.push({ node: property.valueNode, className });
              }
            }

            if (property.valueNode?.type === "array") {
              for (const item of property.valueNode.items) {
                if (item.type === "string") {
                  const className = typeClassByValue[item.value];
                  if (className) {
                    results.push({ node: item, className });
                  }
                }
              }
            }
          }

          if (property.valueNode) {
            collectSchemaTypeStrings(property.valueNode, results);
          }
        }
        return;
      }

      if (node.type === "array") {
        for (const item of node.items) {
          collectSchemaTypeStrings(item, results);
        }
      }
    };

    const getSchemaTypeFromNode = (node?: MonacoJson.ASTNode) => {
      if (!node || node.type !== "object") return undefined;

      let hasProperties = false;
      let hasItems = false;

      for (const property of node.properties) {
        if (property.keyNode.value === "type") {
          if (property.valueNode?.type === "string") {
            return property.valueNode.value;
          }
          if (property.valueNode?.type === "array") {
            for (const item of property.valueNode.items) {
              if (item.type === "string") {
                return item.value;
              }
            }
          }
        }

        if (property.keyNode.value === "properties") {
          hasProperties = true;
        }

        if (property.keyNode.value === "items") {
          hasItems = true;
        }
      }

      if (hasProperties) return "object";
      if (hasItems) return "array";
      return undefined;
    };

    const collectPropertyNameTypes = (
      node: MonacoJson.ASTNode,
      results: Array<{ node: MonacoJson.StringASTNode; className: string }>,
    ) => {
      if (node.type === "object") {
        for (const property of node.properties) {
          if (
            property.keyNode.value === "properties" &&
            property.valueNode?.type === "object"
          ) {
            for (const prop of property.valueNode.properties) {
              const schemaType = getSchemaTypeFromNode(prop.valueNode);
              const className =
                schemaType && typeClassByValue[schemaType];
              if (className) {
                results.push({ node: prop.keyNode, className });
              }
              if (prop.valueNode) {
                collectPropertyNameTypes(prop.valueNode, results);
              }
            }
          } else if (property.valueNode) {
            collectPropertyNameTypes(property.valueNode, results);
          }
        }
        return;
      }

      if (node.type === "array") {
        for (const item of node.items) {
          collectPropertyNameTypes(item, results);
        }
      }
    };

    const collectDescriptionValueTypes = (
      node: MonacoJson.ASTNode,
      results: Array<{ node: MonacoJson.StringASTNode; className: string }>,
    ) => {
      if (node.type === "object") {
        const schemaType = getSchemaTypeFromNode(node);
        const className = schemaType && typeClassByValue[schemaType];

        if (className) {
          for (const property of node.properties) {
            if (
              property.keyNode.value === "description" &&
              property.valueNode?.type === "string"
            ) {
              results.push({ node: property.valueNode, className });
            }
          }
        }

        for (const property of node.properties) {
          if (property.valueNode) {
            collectDescriptionValueTypes(property.valueNode, results);
          }
        }
        return;
      }

      if (node.type === "array") {
        for (const item of node.items) {
          collectDescriptionValueTypes(item, results);
        }
      }
    };

    const schemaKeywordKeys = new Set([
      "$id",
      "$schema",
      "$defs",
      "definitions",
      "title",
      "description",
      "default",
      "examples",
      "type",
      "properties",
      "patternProperties",
      "additionalProperties",
      "propertyNames",
      "required",
      "items",
      "contains",
      "minContains",
      "maxContains",
      "minItems",
      "maxItems",
      "uniqueItems",
      "minProperties",
      "maxProperties",
      "enum",
      "const",
      "oneOf",
      "anyOf",
      "allOf",
      "not",
      "if",
      "then",
      "else",
      "format",
      "minimum",
      "maximum",
      "exclusiveMinimum",
      "exclusiveMaximum",
      "multipleOf",
      "minLength",
      "maxLength",
      "pattern",
      "contentEncoding",
      "contentMediaType",
      "dependentRequired",
      "dependentSchemas",
    ]);

    const collectSchemaKeywordKeys = (
      node: MonacoJson.ASTNode,
      results: MonacoJson.StringASTNode[],
      inPropertiesMap: boolean,
    ) => {
      if (node.type === "object") {
        for (const property of node.properties) {
          const key = property.keyNode.value;
          if (!inPropertiesMap && schemaKeywordKeys.has(key)) {
            results.push(property.keyNode);
          }

          const isPropertiesMap =
            key === "properties" ||
            key === "patternProperties" ||
            key === "$defs" ||
            key === "definitions";

          if (property.valueNode) {
            collectSchemaKeywordKeys(
              property.valueNode,
              results,
              isPropertiesMap,
            );
          }
        }
        return;
      }

      if (node.type === "array") {
        for (const item of node.items) {
          collectSchemaKeywordKeys(item, results, false);
        }
      }
    };

    const updateDecorations = async () => {
      const model = editor.getModel();
      if (!model) return;

      const content = model.getValue();
      if (!content.includes("\"required\"")) {
        if (decorations.length > 0) {
          decorations = editor.deltaDecorations(decorations, []);
        }
        return;
      }

      const currentRequest = ++requestId;
      const version = model.getVersionId();

      try {
        const worker = await monaco.json.getWorker();
        const client = await worker(model.uri);
        const document = await client.parseJSONDocument(model.uri.toString());

        if (disposed || currentRequest !== requestId) return;
        const latestModel = editor.getModel();
        if (!latestModel || latestModel.getVersionId() !== version) return;

        const requiredNodes: MonacoJson.StringASTNode[] = [];
        const typeNodes: Array<{
          node: MonacoJson.StringASTNode;
          className: string;
        }> = [];
        const keywordNodes: MonacoJson.StringASTNode[] = [];
        const descriptionNodes: Array<{
          node: MonacoJson.StringASTNode;
          className: string;
        }> = [];
        const propertyNameNodes: Array<{
          node: MonacoJson.StringASTNode;
          className: string;
        }> = [];
        if (document?.root) {
          collectRequiredStrings(document.root, requiredNodes);
          collectSchemaTypeStrings(document.root, typeNodes);
          collectPropertyNameTypes(document.root, propertyNameNodes);
          collectSchemaKeywordKeys(document.root, keywordNodes, false);
          collectDescriptionValueTypes(document.root, descriptionNodes);
        }

        const buildDecoration = (
          node: MonacoJson.StringASTNode,
          className: string,
        ) => {
          const start = model.getPositionAt(node.offset);
          const end = model.getPositionAt(node.offset + node.length);
          return {
            range: new monaco.Range(
              start.lineNumber,
              start.column,
              end.lineNumber,
              end.column,
            ),
            options: {
              inlineClassName: className,
            },
          };
        };

        const newDecorations = [
          ...requiredNodes.map((node) =>
            buildDecoration(node, "jsonjoy-required"),
          ),
          ...keywordNodes.map((node) =>
            buildDecoration(node, "jsonjoy-schema-keyword"),
          ),
          ...typeNodes.map(({ node, className }) =>
            buildDecoration(node, className),
          ),
          ...descriptionNodes.map(({ node, className }) =>
            buildDecoration(node, className),
          ),
          ...propertyNameNodes.map(({ node, className }) =>
            buildDecoration(node, className),
          ),
        ];

        decorations = editor.deltaDecorations(decorations, newDecorations);
      } catch (_error) {
        if (!disposed && decorations.length > 0) {
          decorations = editor.deltaDecorations(decorations, []);
        }
      }
    };

    const scheduleUpdate = () => {
      void updateDecorations();
    };

    const contentListener = editor.onDidChangeModelContent(scheduleUpdate);
    const modelListener = editor.onDidChangeModel(scheduleUpdate);

    scheduleUpdate();

    return () => {
      disposed = true;
      contentListener.dispose();
      modelListener.dispose();
      if (decorations.length > 0) {
        editor.deltaDecorations(decorations, []);
        decorations = [];
      }
    };
  };

  // Helper to configure JSON language validation
  const configureJsonDefaults = (
    _monaco?: typeof Monaco,
    schema?: JSONSchema,
  ) => {
    const jsonDefaults =
      _monaco?.json?.jsonDefaults ?? MonacoModule.json?.jsonDefaults;
    if (!jsonDefaults) {
      return;
    }

    // Create a new diagnostics options object
    const diagnosticsOptions: MonacoJson.DiagnosticsOptions = {
      validate: true,
      allowComments: false,
      schemaValidation: "error",
      enableSchemaRequest: true,
      schemas: schema
        ? [
            {
              uri:
                typeof schema === "object" && schema.$id
                  ? schema.$id
                  : "https://jsonjoy-builder/schema",
              fileMatch: ["*"],
              schema,
            },
          ]
        : [
            {
              uri: "http://json-schema.org/draft-07/schema",
              fileMatch: ["*"],
              schema: {
                $schema: "http://json-schema.org/draft-07/schema",
                type: "object",
                additionalProperties: true,
              },
        },
          ],
    };

    jsonDefaults.setDiagnosticsOptions(diagnosticsOptions);
  };

  return {
    isDarkMode,
    currentTheme: isDarkMode ? "appDarkTheme" : "appLightTheme",
    defineMonacoThemes,
    configureJsonDefaults,
    setupRequiredFieldHighlighting,
    defaultEditorOptions,
  };
}
