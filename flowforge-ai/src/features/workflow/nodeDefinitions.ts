import type { WorkflowNodeKind } from "./types";

export type ConfigFieldType =
  | "text"
  | "credential"
  | "password"
  | "number"
  | "textarea"
  | "select"
  | "boolean"
  | "json";

export type ConfigFieldFormat =
  | "plainText"
  | "url"
  | "email"
  | "path"
  | "json"
  | "xml"
  | "sql"
  | "expression"
  | "emailList";

export interface ConfigValidation {
  minLength?: number;
  maxLength?: number;

  pattern?: string;

  format?: ConfigFieldFormat;

  min?: number;
  max?: number;

  allowEmpty?: boolean;

  when?: {
    field: string;
    equals?: unknown;
    notEquals?: unknown;
  };
}

export interface ConfigField {
  key: string;
  label: string;
  type: ConfigFieldType;

  required?: boolean;

  description?: string;
  placeholder?: string;
  defaultValue?: unknown;

  options?: ConfigOption[];

  secret?: boolean;

  min?: number;
  max?: number;

  rows?: number;

  visibleWhen?: {
    field: string;
    equals?: unknown;
    notEquals?: unknown;
  };

  validation?: ConfigValidation;
}

export interface ConfigOption {
  label: string;
  value: string;
}

export interface NodeDefinition {
  type: WorkflowNodeKind;

  label: string;
  description: string;

  category: string;
  icon: string;

  configFields: ConfigField[];
}

export const nodeDefinitions: NodeDefinition[] = [
  /*
   * -------------------------------------------------------
   * WEBHOOK
   * -------------------------------------------------------
   */

  {
    type: "webhook",
    label: "Webhook",
    description: "Start the workflow when an HTTP request arrives",
    category: "Triggers",
    icon: "W",

    configFields: [
      {
        key: "method",
        label: "HTTP Method",
        type: "select",
        required: true,
        defaultValue: "POST",
        options: [
          { label: "GET", value: "GET" },
          { label: "POST", value: "POST" },
          { label: "PUT", value: "PUT" },
          { label: "PATCH", value: "PATCH" },
          { label: "DELETE", value: "DELETE" },
        ],
      },

      {
        key: "path",
        label: "Webhook Path",
        type: "text",
        required: true,
        defaultValue: "/webhook",
        placeholder: "/webhook",
        description: "The endpoint that triggers this workflow.",
        validation: {
          format: "path",
          maxLength: 200,
        },
      },

      {
        key: "authentication",
        label: "Authentication",
        type: "select",
        required: true,
        defaultValue: "none",
        options: [
          { label: "None", value: "none" },
          { label: "API Key", value: "apiKey" },
          { label: "Bearer Token", value: "bearer" },
        ],
      },

      {
        key: "credentialId",
        label: "Credential",
        type: "credential",
        required: true,
        placeholder: "webhook-auth",
        description:
          "Credential used to authenticate incoming requests.",
        visibleWhen: {
          field: "authentication",
          notEquals: "none",
        },
      },

      {
        key: "responseStatus",
        label: "Response Status",
        type: "number",
        required: true,
        defaultValue: 200,
        min: 100,
        max: 599,
      },
    ],
  },

  /*
   * -------------------------------------------------------
   * HTTP REQUEST
   * -------------------------------------------------------
   */

  {
    type: "http",
    label: "HTTP Request",
    description: "Call an external HTTP API",
    category: "Actions",
    icon: "H",

    configFields: [
      {
        key: "method",
        label: "HTTP Method",
        type: "select",
        required: true,
        defaultValue: "GET",
        options: [
          { label: "GET", value: "GET" },
          { label: "POST", value: "POST" },
          { label: "PUT", value: "PUT" },
          { label: "PATCH", value: "PATCH" },
          { label: "DELETE", value: "DELETE" },
          { label: "HEAD", value: "HEAD" },
          { label: "OPTIONS", value: "OPTIONS" },
        ],
      },

      {
        key: "url",
        label: "URL",
        type: "text",
        required: true,
        placeholder: "https://api.example.com/users",
        validation: {
          format: "url",
          maxLength: 2048,
        },
      },

      {
        key: "authentication",
        label: "Authentication",
        type: "select",
        required: true,
        defaultValue: "none",
        options: [
          { label: "None", value: "none" },
          { label: "API Key", value: "apiKey" },
          { label: "Bearer Token", value: "bearer" },
          { label: "Basic Auth", value: "basic" },
        ],
      },

      {
        key: "credentialId",
        label: "Credential",
        type: "credential",
        required: true,
        placeholder: "Select credential...",
        description:
          "Credential used to authenticate the request.",
        visibleWhen: {
          field: "authentication",
          notEquals: "none",
        },
      },
      {
        key: "queryParams",
        label: "Query Parameters",
        type: "json",
        placeholder: `{
  "page": "1",
  "limit": "20"
}`,
        rows: 6,
        validation: {
          format: "json",
          maxLength: 50000,
        },
      },

      {
        key: "headers",
        label: "Headers",
        type: "json",
        placeholder: `{
  "Content-Type": "application/json",
  "Accept": "application/json"
}`,
        rows: 7,
        validation: {
          format: "json",
          maxLength: 50000,
        },
      },

      {
        key: "bodyType",
        label: "Body Type",
        type: "select",
        required: true,
        defaultValue: "none",
        options: [
          { label: "None", value: "none" },
          { label: "JSON", value: "json" },
          { label: "Form Data", value: "formData" },
          { label: "Raw Text", value: "raw" },
        ],
      },

      {
        key: "body",
        label: "Request Body",
        type: "json",
        placeholder: `{
  "name": "{{trigger.body.name}}",
  "email": "{{trigger.body.email}}"
}`,
        rows: 10,
        validation: {
          format: "json",
          maxLength: 100000,
          when: {
            field: "bodyType",
            equals: "json",
          },
        },
        visibleWhen: {
          field: "bodyType",
          notEquals: "none",
        },
      },

      {
        key: "responseType",
        label: "Response Type",
        type: "select",
        required: true,
        defaultValue: "json",
        options: [
          { label: "JSON", value: "json" },
          { label: "Text", value: "text" },
          { label: "Binary", value: "binary" },
        ],
      },

      {
        key: "expectedStatus",
        label: "Expected Status",
        type: "text",
        defaultValue: "200-299",
        placeholder: "200-299",
        description:
          "Status code or range considered successful.",
        validation: {
          pattern: "^(?:[1-5]\\d{2})(?:-[1-5]\\d{2})?$",
          maxLength: 7,
        },
      },

      {
        key: "timeout",
        label: "Timeout (ms)",
        type: "number",
        required: true,
        defaultValue: 30000,
        min: 1000,
        max: 120000,
      },

      {
        key: "retries",
        label: "Retries",
        type: "number",
        required: true,
        defaultValue: 3,
        min: 0,
        max: 10,
      },

      {
        key: "retryDelay",
        label: "Retry Delay (ms)",
        type: "number",
        required: true,
        defaultValue: 1000,
        min: 100,
        max: 60000,
      },

      {
        key: "followRedirects",
        label: "Follow Redirects",
        type: "boolean",
        required: true,
        defaultValue: true,
      },
    ],
  },

  /*
   * -------------------------------------------------------
   * CONDITION
   * -------------------------------------------------------
   */

  {
    type: "condition",
    label: "Condition",
    description: "Branch the workflow based on an expression",
    category: "Logic",
    icon: "C",

    configFields: [
      {
        key: "mode",
        label: "Condition Mode",
        type: "select",
        required: true,
        defaultValue: "simple",
        options: [
          {
            label: "Simple",
            value: "simple",
          },
          {
            label: "Advanced Expression",
            value: "advanced",
          },
        ],
        description:
          "Choose a guided condition or write an expression directly.",
      },

      {
        key: "value",
        label: "Value",
        type: "text",
        required: true,
        placeholder: "{{http_1.status}}",
        description:
          "Value from the previous node or workflow context.",
        validation: {
          maxLength: 5000,
        },
        visibleWhen: {
          field: "mode",
          equals: "simple",
        },
      },

      {
        key: "operator",
        label: "Operator",
        type: "select",
        required: true,
        defaultValue: "equals",
        options: [
          {
            label: "Equals",
            value: "equals",
          },
          {
            label: "Not Equals",
            value: "notEquals",
          },
          {
            label: "Contains",
            value: "contains",
          },
          {
            label: "Starts With",
            value: "startsWith",
          },
          {
            label: "Ends With",
            value: "endsWith",
          },
          {
            label: "Greater Than",
            value: "greaterThan",
          },
          {
            label: "Less Than",
            value: "lessThan",
          },
          {
            label: "Greater Than or Equal",
            value: "greaterThanOrEqual",
          },
          {
            label: "Less Than or Equal",
            value: "lessThanOrEqual",
          },
        ],
        visibleWhen: {
          field: "mode",
          equals: "simple",
        },
      },

      {
        key: "compareValue",
        label: "Compare With",
        type: "text",
        required: true,
        placeholder: "200",
        validation: {
          maxLength: 1000,
        },
        visibleWhen: {
          field: "mode",
          equals: "simple",
        },
      },

      {
        key: "expression",
        label: "Expression",
        type: "textarea",
        required: true,
        placeholder: "response.status === 200",
        rows: 6,
        description:
          "Advanced expression evaluated against the workflow context.",
        validation: {
          format: "expression",
          maxLength: 10000,
        },
        visibleWhen: {
          field: "mode",
          equals: "advanced",
        },
      },

      // {
      //   key: "trueLabel",
      //   label: "True Branch",
      //   type: "text",
      //   required: true,
      //   defaultValue: "Yes",
      // },

      // {
      //   key: "falseLabel",
      //   label: "False Branch",
      //   type: "text",
      //   required: true,
      //   defaultValue: "No",
      // },
    ],
  },

  /*
   * -------------------------------------------------------
   * DATABASE
   * -------------------------------------------------------
   */

  {
    type: "database",
    label: "Database",
    description: "Query or update a database",
    category: "Data",
    icon: "D",

    configFields: [
      {
        key: "databaseType",
        label: "Database",
        type: "select",
        required: true,
        defaultValue: "postgresql",
        options: [
          {
            label: "PostgreSQL",
            value: "postgresql",
          },
          {
            label: "MySQL",
            value: "mysql",
          },
        ],
      },

      {
        key: "credentialId",
        label: "Credential",
        type: "credential",
        required: true,
        placeholder: "database-production",
        description:
          "Reference to an encrypted database credential.",
      },

      {
        key: "operation",
        label: "Operation",
        type: "select",
        required: true,
        defaultValue: "query",
        options: [
          {
            label: "Query",
            value: "query",
          },
          {
            label: "Insert",
            value: "insert",
          },
          {
            label: "Update",
            value: "update",
          },
          {
            label: "Delete",
            value: "delete",
          },
        ],
      },

      {
        key: "query",
        label: "SQL Query",
        type: "textarea",
        required: true,
        placeholder:
          "SELECT * FROM users WHERE id = {{trigger.body.userId}}",
        rows: 8,
        validation: {
          format: "sql",
          maxLength: 100000,
        },
      },

      {
        key: "parameters",
        label: "Query Parameters",
        type: "json",
        placeholder: `{
  "userId": "{{trigger.body.userId}}"
}`,
        rows: 5,
        validation: {
          format: "json",
          maxLength: 50000,
        },
      },

      {
        key: "timeout",
        label: "Timeout (ms)",
        type: "number",
        required: true,
        defaultValue: 30000,
        min: 1000,
        max: 120000,
      },
    ],
  },

  /*
   * -------------------------------------------------------
   * AI
   * -------------------------------------------------------
   */

  {
    type: "ai",
    label: "AI",
    description: "Generate, extract, classify or transform data",
    category: "AI",
    icon: "AI",

    configFields: [
      {
        key: "provider",
        label: "Provider",
        type: "select",
        required: true,
        defaultValue: "groq",
        options: [
          { label: "Groq", value: "groq" },
          { label: "Ollama", value: "ollama" },
        ],
      },

      {
        key: "model",
        label: "Model",
        type: "text",
        required: true,
        placeholder: "llama-3.3-70b-versatile",
        validation: {
          format: "plainText",
          maxLength: 200,
        },
      },

      {
        key: "operation",
        label: "Operation",
        type: "select",
        required: true,
        defaultValue: "generate",
        options: [
          {
            label: "Generate",
            value: "generate",
          },
          {
            label: "Extract",
            value: "extract",
          },
          {
            label: "Classify",
            value: "classify",
          },
          {
            label: "Summarize",
            value: "summarize",
          },
        ],
      },

      {
        key: "prompt",
        label: "Prompt",
        type: "textarea",
        required: true,
        placeholder:
          "Analyze the incoming customer request and classify its priority.",
        rows: 8,
        validation: {
          maxLength: 20000,
        },
      },

      {
        key: "temperature",
        label: "Temperature",
        type: "number",
        required: true,
        defaultValue: 0.2,
        min: 0,
        max: 2,
      },

      {
        key: "maxTokens",
        label: "Maximum Tokens",
        type: "number",
        required: true,
        defaultValue: 1000,
        min: 1,
        max: 32000,
      },

      {
        key: "outputFormat",
        label: "Output Format",
        type: "select",
        required: true,
        defaultValue: "text",
        options: [
          {
            label: "Text",
            value: "text",
          },
          {
            label: "JSON",
            value: "json",
          },
        ],
      },
      {
        key: "systemPrompt",
        label: "System Prompt",
        type: "textarea",
        placeholder:
          "You are an enterprise workflow automation assistant.",
        rows: 5,
        validation: {
          maxLength: 10000,
        },
      },
      {
        key: "input",
        label: "Input",
        type: "textarea",
        required: true,
        placeholder:
          "{{http_1.body}}",
        rows: 6,
        validation: {
          maxLength: 50000,
        },
      },
    ],
  },

  /*
   * -------------------------------------------------------
   * EMAIL NOTIFICATION
   * -------------------------------------------------------
   */

  {
    type: "email",
    label: "Email Notification",
    description: "Send an email notification",
    category: "Communication",
    icon: "E",

    configFields: [
      {
        key: "credentialId",
        label: "Email Credential",
        type: "credential",
        required: true,
        placeholder: "smtp-production",
        description:
          "Reference to the encrypted SMTP credential.",
      },

      {
        key: "from",
        label: "From",
        type: "text",
        required: true,
        placeholder: "alerts@example.com",
        validation: {
          format: "email",
          maxLength: 254,
        },
      },

      {
        key: "to",
        label: "To",
        type: "text",
        required: true,
        placeholder: "team@example.com",
        description:
          "Multiple recipients can be separated by commas.",
        validation: {
          format: "emailList",
          maxLength: 4000,
        },
      },

      {
        key: "cc",
        label: "CC",
        type: "text",
        placeholder: "manager@example.com",
        validation: {
          format: "emailList",
          maxLength: 4000,
        },
      },

      {
        key: "bcc",
        label: "BCC",
        type: "text",
        placeholder: "audit@example.com",
        validation: {
          format: "emailList",
          maxLength: 4000,
        },
      },

      {
        key: "subject",
        label: "Subject",
        type: "text",
        required: true,
        placeholder: "Workflow notification",
        validation: {
          maxLength: 998,
        },
      },

      {
        key: "body",
        label: "Email Body",
        type: "textarea",
        required: true,
        placeholder:
          "The workflow completed successfully.\n\nStatus: {{http_1.status}}",
        rows: 10,
        validation: {
          maxLength: 100000,
        },
      },

      {
        key: "contentType",
        label: "Content Type",
        type: "select",
        required: true,
        defaultValue: "text",
        options: [
          {
            label: "Plain Text",
            value: "text",
          },
          {
            label: "HTML",
            value: "html",
          },
        ],
      },

      {
        key: "replyTo",
        label: "Reply-To",
        type: "text",
        placeholder: "support@example.com",
        validation: {
          format: "emailList",
          maxLength: 4000,
        },
      },
      {
        key: "priority",
        label: "Priority",
        type: "select",
        required: true,
        defaultValue: "normal",
        options: [
          {
            label: "Normal",
            value: "normal",
          },
          {
            label: "High",
            value: "high",
          },
          {
            label: "Urgent",
            value: "urgent",
          },
        ],
      },
      {
        key: "attachments",
        label: "Attachments",
        type: "json",
        placeholder: `[
  {
    "name": "report.pdf",
    "source": "{{database_1.report}}"
  }
]`,
        rows: 5,
        validation: {
          format: "json",
          maxLength: 50000,
        },
      },
    ],
  },

  /*
   * -------------------------------------------------------
   * EMAIL READER
   * -------------------------------------------------------
   */

  {
    type: "emailReader",
    label: "Email Reader",
    description: "Read emails from an IMAP mailbox",
    category: "Communication",
    icon: "ER",

    configFields: [
      {
        key: "credentialId",
        label: "Email Credential",
        type: "credential",
        required: true,
        placeholder: "imap-production",
        description:
          "Reference to the encrypted IMAP credential.",
      },

      {
        key: "mailbox",
        label: "Mailbox",
        type: "text",
        required: true,
        defaultValue: "INBOX",
        placeholder: "INBOX",
        validation: {
          maxLength: 255,
        },
      },

      {
        key: "searchFrom",
        label: "From",
        type: "text",
        placeholder: "alerts@example.com",
        validation: {
          format: "emailList",
          maxLength: 4000,
        },
      },

      {
        key: "subjectContains",
        label: "Subject Contains",
        type: "text",
        placeholder: "Incident",
        validation: {
          maxLength: 1000,
        },
      },

      {
        key: "unreadOnly",
        label: "Unread Only",
        type: "boolean",
        required: true,
        defaultValue: true,
      },

      {
        key: "markAsRead",
        label: "Mark As Read",
        type: "boolean",
        required: true,
        defaultValue: false,
      },

      {
        key: "maxMessages",
        label: "Maximum Messages",
        type: "number",
        required: true,
        defaultValue: 10,
        min: 1,
        max: 100,
      },

      {
        key: "includeAttachments",
        label: "Include Attachments",
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      {
        key: "searchTo",
        label: "To",
        type: "text",
        placeholder: "support@example.com",
        validation: {
          format: "emailList",
          maxLength: 4000,
        },
      },

      {
        key: "bodyContains",
        label: "Body Contains",
        type: "text",
        placeholder: "production",
        validation: {
          maxLength: 10000,
        },
      },

      {
        key: "fetchBody",
        label: "Fetch Body",
        type: "select",
        required: true,
        defaultValue: "full",
        options: [
          {
            label: "Full",
            value: "full",
          },
          {
            label: "Preview",
            value: "preview",
          },
        ],
      },
    ],
  },
];

export function getDefaultConfig(
  definition: NodeDefinition,
): Record<string, unknown> {
  return Object.fromEntries(
    definition.configFields
      .filter(
        (field) => field.defaultValue !== undefined,
      )
      .map((field) => [
        field.key,
        field.defaultValue,
      ]),
  );
}

export function getNodeDefinition(
  type: WorkflowNodeKind,
): NodeDefinition | undefined {
  return nodeDefinitions.find(
    (definition) =>
      definition.type === type,
  );
}