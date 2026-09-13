import type { Edge } from "@xyflow/react";

import type { WorkflowNode } from "./types";

export const initialNodes: WorkflowNode[] = [
  {
    id: "start_1",
    type: "start",
    position: { x: 80, y: 180 },
    data: {
      label: "Start",
      description: "Workflow entry point",
      type: "start",
      config: {},
    },
  },

  {
    id: "webhook_1",
    type: "workflow",
    position: { x: 220, y: 180 },
    data: {
      label: "Webhook",
      description: "Incoming HTTP request",
      type: "webhook",
      config: {
        method: "POST",
        path: "/webhook",
      },
    },
  },

  {
    id: "http_1",
    type: "workflow",
    position: { x: 520, y: 180 },
    data: {
      label: "HTTP Request",
      description: "Call external API",
      type: "http",
      config: {
        method: "GET",
        url: "",
        authentication: "none",
        bodyType: "none",
        responseType: "json",
        expectedStatus: "200-299",
        timeout: 30000,
        retries: 3,
        retryDelay: 1000,
        followRedirects: true,
      },
    },
  },

  {
    id: "condition_1",
    type: "condition",
    position: { x: 850, y: 144 },
    data: {
      label: "Condition",
      description: "Check response",
      type: "condition",
      config: {
        mode: "simple",
        value: "{{http_1.status}}",
        operator: "equals",
        compareValue: "200",
        // trueLabel: "Success",
        // falseLabel: "Failure",
      },
    },
  },

  {
    id: "end_1",
    type: "end",
    position: { x: 1160, y: 180 },
    data: {
      label: "End",
      description: "Workflow completed",
      type: "end",
      config: {},
    },
  },
];

export const initialEdges: Edge[] = [
  {
    id: "start-webhook",
    source: "start_1",
    sourceHandle: "source",
    target: "webhook_1",
  },

  {
    id: "webhook-http",
    source: "webhook_1",
    target: "http_1",
  },

  {
    id: "http-condition",
    source: "http_1",
    target: "condition_1",
    targetHandle: "target",
  },

  {
    id: "condition-success-end",
    source: "condition_1",
    sourceHandle: "true",
    target: "end_1",
    targetHandle: "target",
    label: "Request successful",
  },

  {
    id: "condition-failure-end",
    source: "condition_1",
    sourceHandle: "false",
    target: "end_1",
    targetHandle: "target",
    label: "Request failed",
  },
];