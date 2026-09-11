import type { Node } from "@xyflow/react";

export type WorkflowNodeKind =
  | "webhook"
  | "http"
  | "condition"
  | "database"
  | "ai"
  | "email"
  | "emailReader";

export interface WorkflowNodeData
  extends Record<string, unknown> {
  label: string;
  description: string;
  type: WorkflowNodeKind;
  config: Record<string, unknown>;
}

export type WorkflowNode = Node<
  WorkflowNodeData,
  "workflow"
>;