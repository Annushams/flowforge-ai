import type { Node } from "@xyflow/react";

export type WorkflowNodeKind =
  | "webhook"
  | "http"
  | "condition"
  | "database"
  | "ai";

export interface WorkflowNodeData extends Record<string, unknown> {
  label: string;
  description: string;
  type: WorkflowNodeKind;
}

export type WorkflowNode = Node<WorkflowNodeData, "workflow">;