import {
  CheckCircle,
  CirclePlus,
  Code,
  FileJson,
  GitBranch,
  Package,
  Pencil,
  PencilOff,
  RefreshCw,
  User,
} from "lucide-react";
import { useState } from "react";
import {
  Anchor,
  Badge,
  Button,
  Container,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { exampleSchema } from "../../demo/utils/schemaExample.ts";
import { JsonValidator } from "../../src/components/features/JsonValidator.tsx";
import { SchemaInferencer } from "../../src/components/features/SchemaInferencer.tsx";
import JsonSchemaEditor from "../../src/components/SchemaEditor/JsonSchemaEditor.tsx";
import type { JSONSchema } from "../../src/types/jsonSchema.ts";
import styles from "./Index.module.css";

const Index = () => {
  const [schema, setSchema] = useState<JSONSchema>(exampleSchema);
  const [readOnly, setReadOnly] = useState<boolean>(false);
  const [inferDialogOpen, setInferDialogOpen] = useState(false);
  const [validateDialogOpen, setValidateDialogOpen] = useState(false);

  const handleReset = () => setSchema(exampleSchema);

  const handleReadOnlyToggle = () => setReadOnly(!readOnly);

  const handleClear = () =>
    setSchema({
      type: "object",
      properties: {},
      required: [],
    });

  const handleInferSchema = () => {
    setInferDialogOpen(true);
  };

  const handleValidateJson = () => {
    setValidateDialogOpen(true);
  };

  return (
    <div className={`${styles.page} jsonjoy`}>
      <div className={styles.accentTop} aria-hidden="true" />
      <div className={styles.accentBottom} aria-hidden="true" />

      <Container size="xl" className={styles.container}>
        <Stack align="center" spacing="xl">
          <Badge size="lg" variant="light" className={styles.heroBadge}>
            <FileJson size={16} />
            Easy Schema Builder
          </Badge>

          <Title order={1} ta="center" className={styles.heroTitle}>
            Create JSON Schemas <span>Visually</span>
          </Title>

          <Text size="lg" c="dimmed" ta="center" maw={720}>
            Design your data structure effortlessly without writing a single
            line of code. Perfect for APIs, forms, and data validation.
          </Text>

          <Group justify="center" gap="md" wrap="wrap">
            <Button
              variant="outline"
              onClick={handleReset}
              leftSection={<RefreshCw size={16} />}
            >
              Reset to Example
            </Button>
            <Button
              variant="outline"
              onClick={handleClear}
              leftSection={<CirclePlus size={16} />}
            >
              Start from Scratch
            </Button>
            <Button
              variant="outline"
              onClick={handleInferSchema}
              leftSection={<Code size={16} />}
            >
              Infer from JSON
            </Button>
            <Button
              variant="outline"
              onClick={handleValidateJson}
              leftSection={<CheckCircle size={16} />}
            >
              Validate JSON
            </Button>
            <Button
              variant="outline"
              onClick={handleReadOnlyToggle}
              leftSection={
                readOnly ? <Pencil size={16} /> : <PencilOff size={16} />
              }
            >
              {readOnly ? "Writable" : "Read-Only"}
            </Button>
          </Group>
        </Stack>

          <Stack mt="xl" spacing="xl">
            <JsonSchemaEditor
              schema={schema}
              readOnly={readOnly}
              setSchema={setSchema}
              className={styles.editorCard}
            />

            <SchemaInferencer
              open={inferDialogOpen}
              onOpenChange={setInferDialogOpen}
              onSchemaInferred={setSchema}
            />

            <JsonValidator
              open={validateDialogOpen}
              onOpenChange={setValidateDialogOpen}
              schema={schema}
            />

            <Stack spacing="lg">
              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
                {[
                  {
                    title: "Define Schema Structure",
                    description:
                      "Create a user profile schema with name, email, and age fields. Specify string formats for emails, min/max for ages, and required fields.",
                    index: "1",
                  },
                  {
                    title: "Create Complex Types",
                    description:
                      "Build product catalogs with nested objects for variants, arrays for tags, and enums for predefined categories or status values.",
                    index: "2",
                  },
                  {
                    title: "Use Your Schema",
                    description:
                      "Export for form validation in React Hook Form, API documentation with OpenAPI, or backend validation with libraries like Ajv.",
                    index: "3",
                  },
                ].map((step) => (
                  <Paper key={step.title} withBorder p="lg" radius="md">
                    <Badge variant="light" size="lg">
                      {step.index}
                    </Badge>
                    <Title order={4} mt="sm">
                      {step.title}
                    </Title>
                    <Text size="sm" c="dimmed" mt="xs">
                      {step.description}
                    </Text>
                  </Paper>
                ))}
              </SimpleGrid>

              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                <Paper withBorder p="lg" radius="md">
                  <Title order={4}>API Development</Title>
                  <Text size="sm" c="dimmed" mt="xs">
                    Define request/response schemas for endpoints like{" "}
                    <code>/api/users</code> to ensure proper data validation and
                    consistent API documentation.
                  </Text>
                  <pre className={styles.codeBlock}>
                    {`{
  "type": "object",
  "properties": {
    "username": { "type": "string", "minLength": 3 },
    "email": { "type": "string", "format": "email" }
  },
  "required": ["username", "email"]
}`}
                  </pre>
                </Paper>

                <Paper withBorder p="lg" radius="md">
                  <Title order={4}>Form Validation</Title>
                  <Text size="sm" c="dimmed" mt="xs">
                    Create schemas for checkout forms with shipping details,
                    payment information, and order specifics - all with proper
                    validation rules.
                  </Text>
                  <pre className={styles.codeBlock}>
                    {JSON.stringify(
                      {
                        type: "object",
                        properties: {
                          zipCode: { type: "string", pattern: "^\\d{5}$" },
                        },
                        paymentMethod: {
                          type: "string",
                          enum: ["credit", "paypal"],
                        },
                      },
                      null,
                      2,
                    )}
                  </pre>
                </Paper>
              </SimpleGrid>
            </Stack>

            <Stack spacing="md">
              <Title order={2} className={styles.sectionTitle}>
                Ecosystem & Tools
              </Title>
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                {[
                  {
                    title: "Form Generation",
                    links: [
                      {
                        url: "https://github.com/rjsf-team/react-jsonschema-form?tab=readme-ov-file#react-jsonschema-form",
                        name: "React JSON Schema Form",
                        description: "Build forms from schemas",
                      },
                      {
                        url: "https://jsonforms.io/",
                        name: "JSON Forms",
                        description: "Framework-agnostic form generation",
                      },
                    ],
                  },
                  {
                    title: "Validation Libraries",
                    links: [
                      {
                        url: "https://ajv.js.org/",
                        name: "Ajv",
                        description: "The fastest JSON Schema validator",
                      },
                      {
                        url: "https://python-jsonschema.readthedocs.io/",
                        name: "jsonschema",
                        description: "Python validation library",
                      },
                    ],
                  },
                  {
                    title: "Documentation",
                    links: [
                      {
                        url: "https://www.openapis.org/",
                        name: "OpenAPI",
                        description: "API docs with JSON Schema",
                      },
                      {
                        url: "https://redocly.com/",
                        name: "Redoc",
                        description: "Interactive API documentation",
                      },
                    ],
                  },
                  {
                    title: "IDE Support",
                    links: [
                      {
                        url: "https://code.visualstudio.com/docs/languages/json#_json-schemas-and-settings",
                        name: "VS Code",
                        description: "Built-in schema validation",
                      },
                      {
                        url: "https://www.jetbrains.com/help/idea/json.html#ws_json_using_schemas",
                        name: "JetBrains Idea",
                        description: "Schema-aware completions",
                      },
                    ],
                  },
                  {
                    title: "API Integration",
                    links: [
                      {
                        url: "https://www.postman.com/",
                        name: "Postman",
                        description: "Test APIs with schema validation",
                      },
                      {
                        url: "https://swagger.io/",
                        name: "Swagger",
                        description: "Design and document APIs",
                      },
                    ],
                  },
                  {
                    title: "Data Processing",
                    links: [
                      {
                        url: "https://github.com/json-schema-faker/json-schema-faker",
                        name: "json-schema-faker",
                        description: "Generate mock data",
                      },
                      {
                        url: "https://quicktype.io/",
                        name: "QuickType",
                        description: "Generate code from schema",
                      },
                    ],
                  },
                ].map((section) => (
                  <Paper key={section.title} withBorder p="md" radius="md">
                    <Title order={4}>{section.title}</Title>
                    <div className={styles.linkList}>
                      {section.links.map((link) => (
                        <div key={link.url}>
                          <Anchor href={link.url} target="_blank">
                            {link.name}
                          </Anchor>{" "}
                          <Text size="xs" c="dimmed">
                            {link.description}
                          </Text>
                        </div>
                      ))}
                    </div>
                  </Paper>
                ))}
              </SimpleGrid>
              <Group justify="center">
                <Anchor
                  href="https://json-schema.org/tools"
                  target="_blank"
                  size="sm"
                >
                  Explore more JSON Schema tools →
                </Anchor>
              </Group>
            </Stack>

            <Group justify="center" gap="md" className={styles.footer}>
              <Text size="sm" c="dimmed">
                Built by
              </Text>
              {[
                {
                  href: "https://ophir.dev",
                  text: "@ophir.dev",
                  icon: User,
                },
                {
                  href: "https://github.com/lovasoa/jsonjoy-builder",
                  text: "GitHub",
                  icon: GitBranch,
                  target: "_blank",
                  rel: "nofollow noopener noreferrer",
                },
                {
                  href: "https://www.npmjs.com/package/jsonjoy-builder",
                  text: "NPM",
                  icon: Package,
                  target: "_blank",
                  rel: "nofollow noopener noreferrer",
                },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={styles.footerLink}
                  {...(link.target && { target: link.target })}
                  {...(link.rel && { rel: link.rel })}
                >
                  <link.icon size={14} />
                  <span>{link.text}</span>
                </a>
              ))}
            </Group>
          </Stack>
      </Container>
    </div>
  );
};

export default Index;
