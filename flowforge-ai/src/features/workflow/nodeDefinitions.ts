import type { WorkflowNodeKind } from "./types";

export interface NodeDefinition {
  type: WorkflowNodeKind;
  label: string;
  description: string;
  category: string;
  icon: string;
}

export const nodeDefinitions: NodeDefinition[] = [
  {
    type: "webhook",
    label: "Webhook",
    description: "Start when an HTTP request arrives",
    category: "Triggers",
    icon: "W",
  },
  {
    type: "http",
    label: "HTTP Request",
    description: "Call an external API",
    category: "Actions",
    icon: "H",
  },
  {
    type: "condition",
    label: "Condition",
    description: "Branch based on a condition",
    category: "Logic",
    icon: "C",
  },
  {
    type: "database",
    label: "Database",
    description: "Query or update a database",
    category: "Data",
    icon: "D",
  },
  {
    type: "ai",
    label: "AI",
    description: "Generate, extract, or classify data",
    category: "AI",
    icon: "AI",
  },
];