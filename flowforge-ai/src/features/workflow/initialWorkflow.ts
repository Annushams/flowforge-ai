import type { Edge } from "@xyflow/react";

import type { WorkflowNode } from "./types";

export const initialNodes: WorkflowNode[] = [
  {
    id: "webhook_1",
    type: "workflow",
    position: { x: 120, y: 180 },
    data: {
      label: "Webhook",
      description: "Incoming HTTP request",
      type: "webhook",
    },
  },
  {
    id: "http_1",
    type: "workflow",
    position: { x: 420, y: 180 },
    data: {
      label: "HTTP Request",
      description: "Call external API",
      type: "http",
    },
  },
  {
    id: "condition_1",
    type: "workflow",
    position: { x: 720, y: 180 },
    data: {
      label: "Condition",
      description: "Check response",
      type: "condition",
    },
  },
];

export const initialEdges: Edge[] = [
  {
    id: "webhook-http",
    source: "webhook_1",
    target: "http_1",
  },
  {
    id: "http-condition",
    source: "http_1",
    target: "condition_1",
  },
];