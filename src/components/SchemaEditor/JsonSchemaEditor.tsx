import { ActionIcon, Tabs } from "@mantine/core";
import { Maximize2 } from "lucide-react";
import {
  type FC,
  type MouseEvent as ReactMouseEvent,
  useRef,
  useState,
} from "react";
import { useTranslation } from "../../hooks/use-translation.ts";
import { cn } from "../../lib/utils.ts";
import type { JSONSchema } from "../../types/jsonSchema.ts";
import JsonSchemaVisualizer from "./JsonSchemaVisualizer.tsx";
import SchemaVisualEditor from "./SchemaVisualEditor.tsx";
import styles from "./JsonSchemaEditor.module.css";

/** @public */
export interface JsonSchemaEditorProps {
  schema?: JSONSchema;
  readOnly: boolean;
  setSchema?: (schema: JSONSchema) => void;
  className?: string;
}

/** @public */
const JsonSchemaEditor: FC<JsonSchemaEditorProps> = ({
  schema = { type: "object" },
  readOnly = false,
  setSchema,
  className,
}) => {
  // Handle schema changes and propagate to parent if needed
  const handleSchemaChange = (newSchema: JSONSchema) => {
    setSchema(newSchema);
  };

  const t = useTranslation();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percentage
  const resizeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const fullscreenClass = isFullscreen ? styles.fullscreen : "";

  const handleMouseDown = (e: ReactMouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth =
      ((e.clientX - containerRect.left) / containerRect.width) * 100;

    // Limit the minimum and maximum width
    if (newWidth >= 20 && newWidth <= 80) {
      setLeftPanelWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className={cn(
        styles.container,
        fullscreenClass,
        className,
        "jsonjoy",
      )}
    >
      {/* For mobile screens - show as tabs */}
      <div className={styles.mobileTabs}>
        <Tabs defaultValue="visual" keepMounted={false}>
          <div className={styles.header}>
            <h3 className={styles.headerTitle}>{t.schemaEditorTitle}</h3>
            <div className={styles.headerActions}>
              <ActionIcon
                type="button"
                variant="subtle"
                onClick={toggleFullscreen}
                aria-label={t.schemaEditorToggleFullscreen}
              >
                <Maximize2 size={16} />
              </ActionIcon>
              <Tabs.List className={styles.tabsList}>
                <Tabs.Tab value="visual">
                  {t.schemaEditorEditModeVisual}
                </Tabs.Tab>
                <Tabs.Tab value="json">
                  {t.schemaEditorEditModeJson}
                </Tabs.Tab>
              </Tabs.List>
            </div>
          </div>

          <Tabs.Panel
            value="visual"
            className={styles.panel}
            style={{ height: isFullscreen ? "100vh" : 500 }}
          >
            <SchemaVisualEditor
              readOnly={readOnly}
              schema={schema}
              onChange={handleSchemaChange}
            />
          </Tabs.Panel>

          <Tabs.Panel
            value="json"
            className={styles.panel}
            style={{ height: isFullscreen ? "100vh" : 500 }}
          >
            <JsonSchemaVisualizer
              schema={schema}
              onChange={handleSchemaChange}
            />
          </Tabs.Panel>
        </Tabs>
      </div>

      {/* For large screens - show side by side */}
      <div
        ref={containerRef}
        className={styles.desktopPanels}
        style={{ height: isFullscreen ? "100vh" : 600 }}
      >
        <div className={styles.header}>
          <h3 className={styles.headerTitle}>{t.schemaEditorTitle}</h3>
          <ActionIcon
            type="button"
            variant="subtle"
            onClick={toggleFullscreen}
            aria-label={t.schemaEditorToggleFullscreen}
          >
            <Maximize2 size={16} />
          </ActionIcon>
        </div>
        <div className={styles.splitContainer}>
          <div
            className={styles.panel}
            style={{ width: `${leftPanelWidth}%` }}
          >
            <SchemaVisualEditor
              readOnly={readOnly}
              schema={schema}
              onChange={handleSchemaChange}
            />
          </div>
          {/** biome-ignore lint/a11y/noStaticElementInteractions: What exactly does this div do? */}
          <div
            ref={resizeRef}
            className={styles.resizeHandle}
            onMouseDown={handleMouseDown}
          />
          <div
            className={styles.panel}
            style={{ width: `${100 - leftPanelWidth}%` }}
          >
            <JsonSchemaVisualizer
              schema={schema}
              onChange={handleSchemaChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonSchemaEditor;
