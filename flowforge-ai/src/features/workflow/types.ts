import type { Node } from "@xyflow/react";

export type WorkflowNodeKind =
  | "webhook"
  | "http"
  | "condition"
  | "database"
  | "ai"
  | "email"
  | "emailReader";

export type WorkflowNodeDataKind =
  | WorkflowNodeKind
  | "start"
  | "end";

export type WorkflowNodeType =
  | "workflow"
  | "start"
  | "end"
  | "condition";

export interface WorkflowNodeData
  extends Record<string, unknown> {
  label: string;
  description: string;
  type: WorkflowNodeDataKind;
  config: Record<string, unknown>;
}

export type WorkflowNode = Node<
  WorkflowNodeData,
  WorkflowNodeType
>;