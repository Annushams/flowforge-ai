import type { Edge } from "@xyflow/react";

import {
  getDefaultConfig,
  getNodeDefinition,
  type ConfigField,
  type ConfigFieldFormat,
  type ConfigValidation,
} from "../nodeDefinitions";

import type { WorkflowNode } from "../types";

import type {
  WorkflowValidationIssue,
  WorkflowValidationResult,
} from "./types";

export function validateWorkflow(
  nodes: WorkflowNode[],
  edges: Edge[],
): WorkflowValidationResult {
  const errors: WorkflowValidationIssue[] = [];
  const warnings: WorkflowValidationIssue[] = [];

  validateStartNode(nodes, errors);
  validateEndNode(nodes, errors);
  validateConnections(nodes, edges, errors);
  validateStartAndEndConnections(nodes, edges, errors);
  validateConditionConnections(nodes, edges, errors);
  validateEdgeHandles(nodes, edges, errors);
  validateNodeConfigurations(nodes, errors);
  validateOrphanNodes(nodes, edges, warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/* -------------------------------------------------------
 * Configuration validation
 * ----------------------------------------------------- */

function validateNodeConfigurations(
  nodes: WorkflowNode[],
  errors: WorkflowValidationIssue[],
) {
  for (const node of nodes) {
    if (node.data.type === "start" || node.data.type === "end") {
      continue;
    }

    const definition = getNodeDefinition(node.data.type);

    if (!definition) {
      errors.push({
        id: `${node.id}-unknown-definition`,
        code: "UNKNOWN_NODE_TYPE",
        severity: "error",
        message: `No configuration definition exists for node type "${node.data.type}".`,
        nodeId: node.id,
      });
      continue;
    }

    const config = {
      ...getDefaultConfig(definition),
      ...node.data.config,
    };

    for (const field of definition.configFields) {
      if (!isFieldVisible(field, config)) {
        continue;
      }

      const value = config[field.key];

      validateField(
        node,
        field,
        value,
        config,
        errors,
      );
    }
  }
}

function validateField(
  node: WorkflowNode,
  field: ConfigField,
  value: unknown,
  values: Record<string, unknown>,
  errors: WorkflowValidationIssue[],
) {
  if (field.required && isEmptyValue(value)) {
    addFieldError(
      errors,
      node,
      field,
      "FIELD_REQUIRED",
      `${field.label} is required.`,
    );
    return;
  }

  if (isEmptyValue(value)) {
    return;
  }

  if (field.type === "boolean" && typeof value !== "boolean") {
    addFieldError(
      errors,
      node,
      field,
      "INVALID_BOOLEAN",
      `${field.label} must be a boolean value.`,
    );
    return;
  }

  if (field.type === "number") {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      addFieldError(
        errors,
        node,
        field,
        "INVALID_NUMBER",
        `${field.label} must be a valid number.`,
      );
      return;
    }

    if (field.min !== undefined && value < field.min) {
      addFieldError(
        errors,
        node,
        field,
        "MIN_VALUE",
        `${field.label} must be at least ${field.min}.`,
      );
    }

    if (field.max !== undefined && value > field.max) {
      addFieldError(
        errors,
        node,
        field,
        "MAX_VALUE",
        `${field.label} must not exceed ${field.max}.`,
      );
    }
  }

  if (field.type === "select") {
    const allowedValues =
      field.options?.map((option) => option.value) ?? [];

    if (!allowedValues.includes(String(value))) {
      addFieldError(
        errors,
        node,
        field,
        "INVALID_OPTION",
        `${field.label} contains an invalid option.`,
      );
    }
  }

  if (typeof value !== "string") {
    return;
  }

  if (containsUnsafeControlCharacters(value)) {
    addFieldError(
      errors,
      node,
      field,
      "UNSAFE_CONTROL_CHARACTER",
      `${field.label} contains an unsupported control character.`,
    );
  }

  const validation = field.validation;

  if (
    !validation ||
    !isValidationRuleActive(
      validation,
      values,
    )
  ) {
    return;
  }

  if (
    validation.minLength !== undefined &&
    value.length < validation.minLength
  ) {
    addFieldError(
      errors,
      node,
      field,
      "MIN_LENGTH",
      `${field.label} must contain at least ${validation.minLength} characters.`,
    );
  }

  if (
    validation.maxLength !== undefined &&
    value.length > validation.maxLength
  ) {
    addFieldError(
      errors,
      node,
      field,
      "MAX_LENGTH",
      `${field.label} must not exceed ${validation.maxLength} characters.`,
    );
  }

  if (validation.pattern) {
    try {
      const pattern = new RegExp(validation.pattern);

      if (!pattern.test(value)) {
        addFieldError(
          errors,
          node,
          field,
          "INVALID_FORMAT",
          `${field.label} has an invalid format.`,
        );
      }
    } catch {
      // Schema errors must never crash workflow validation.
    }
  }

  if (validation.format) {
    const formatError = validateFormat(
      value,
      validation.format,
    );

    if (formatError) {
      addFieldError(
        errors,
        node,
        field,
        `INVALID_${validation.format.toUpperCase()}`,
        formatError,
      );
    }
  }
}

function isValidationRuleActive(
  validation: ConfigValidation,
  values: Record<string, unknown>,
): boolean {
  const condition = validation.when;

  if (!condition) {
    return true;
  }

  const actualValue = values[condition.field];

  if (
    condition.equals !== undefined &&
    actualValue !== condition.equals
  ) {
    return false;
  }

  if (
    condition.notEquals !== undefined &&
    actualValue === condition.notEquals
  ) {
    return false;
  }

  return true;
}

function validateFormat(
  value: string,
  format: ConfigFieldFormat,
): string | null {
  switch (format) {
    case "json":
      return validateJson(value);
    case "xml":
      return validateXml(value);
    case "url":
      return validateUrl(value);
    case "email":
      return validateEmail(value);
    case "emailList":
      return validateEmailList(value);
    case "path":
      return validatePath(value);
    case "plainText":
      return null;
    case "sql":
      return validateSql(value);
    case "expression":
      return validateExpression(value);
    default:
      return null;
  }
}

function validateJson(value: string): string | null {
  try {
    JSON.parse(value);
    return null;
  } catch {
    return "Enter valid JSON.";
  }
}

function validateXml(value: string): string | null {
  if (typeof DOMParser === "undefined") {
    return null;
  }

  const document = new DOMParser().parseFromString(
    value,
    "application/xml",
  );

  return document.querySelector("parsererror")
    ? "Enter valid XML."
    : null;
}

function validateUrl(value: string): string | null {
  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "URL must use HTTP or HTTPS.";
    }

    return null;
  } catch {
    return "Enter a valid URL.";
  }
}

function validateEmail(value: string): string | null {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(value.trim())
    ? null
    : "Enter a valid email address.";
}

function validateEmailList(value: string): string | null {
  const addresses = value
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);

  if (addresses.length === 0) {
    return "Enter at least one email address.";
  }

  const invalidAddress = addresses.find(
    (address) => validateEmail(address) !== null,
  );

  return invalidAddress
    ? `Invalid email address: ${invalidAddress}`
    : null;
}

function validatePath(value: string): string | null {
  if (!value.startsWith("/")) {
    return "Path must start with /.";
  }

  if (value.includes("\0") || value.includes("\\")) {
    return "Path contains invalid characters.";
  }

  return null;
}

function validateSql(value: string): string | null {
  if (value.includes("\0")) {
    return "SQL contains an unsupported control character.";
  }

  return null;
}

function validateExpression(value: string): string | null {
  if (value.includes("\0")) {
    return "Expression contains an unsupported control character.";
  }

  return null;
}

function containsUnsafeControlCharacters(value: string): boolean {
  for (const character of value) {
    const codePoint = character.charCodeAt(0);

    if (
      codePoint === 0 ||
      (codePoint >= 1 && codePoint <= 8) ||
      (codePoint >= 11 && codePoint <= 12) ||
      (codePoint >= 14 && codePoint <= 31) ||
      codePoint === 127
    ) {
      return true;
    }
  }

  return false;
}

function addFieldError(
  errors: WorkflowValidationIssue[],
  node: WorkflowNode,
  field: ConfigField,
  code: string,
  message: string,
) {
  errors.push({
    id: `${node.id}-${field.key}-${code}`,
    code,
    severity: "error",
    message,
    nodeId: node.id,
    field: field.key,
  });
}

function isFieldVisible(
  field: ConfigField,
  values: Record<string, unknown>,
): boolean {
  if (!field.visibleWhen) {
    return true;
  }

  const actualValue = values[field.visibleWhen.field];

  if (
    field.visibleWhen.equals !== undefined &&
    actualValue !== field.visibleWhen.equals
  ) {
    return false;
  }

  if (
    field.visibleWhen.notEquals !== undefined &&
    actualValue === field.visibleWhen.notEquals
  ) {
    return false;
  }

  return true;
}

function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim() === "";
  }

  return false;
}

/* -------------------------------------------------------
 * Graph validation
 * ----------------------------------------------------- */

function validateStartNode(
  nodes: WorkflowNode[],
  errors: WorkflowValidationIssue[],
) {
  const startNodes = nodes.filter(
    (node) => node.data.type === "start",
  );

  if (startNodes.length === 0) {
    errors.push({
      id: "start-missing",
      code: "START_MISSING",
      severity: "error",
      message: "Workflow must have a Start node.",
    });
    return;
  }

  if (startNodes.length > 1) {
    errors.push({
      id: "multiple-start-nodes",
      code: "MULTIPLE_START_NODES",
      severity: "error",
      message: "Workflow can only have one Start node.",
    });
  }
}

function validateEndNode(
  nodes: WorkflowNode[],
  errors: WorkflowValidationIssue[],
) {
  const endNodes = nodes.filter(
    (node) => node.data.type === "end",
  );

  if (endNodes.length === 0) {
    errors.push({
      id: "end-missing",
      code: "END_MISSING",
      severity: "error",
      message: "Workflow must have an End node.",
    });
    return;
  }

  if (endNodes.length > 1) {
    errors.push({
      id: "multiple-end-nodes",
      code: "MULTIPLE_END_NODES",
      severity: "error",
      message: "Workflow can only have one End node.",
    });
  }
}

function validateConnections(
  nodes: WorkflowNode[],
  edges: Edge[],
  errors: WorkflowValidationIssue[],
) {
  const nodeIds = new Set(nodes.map((node) => node.id));

  for (const edge of edges) {
    if (!nodeIds.has(edge.source)) {
      errors.push({
        id: `invalid-source-${edge.id}`,
        code: "INVALID_EDGE_SOURCE",
        severity: "error",
        message: "Edge references a missing source node.",
        edgeId: edge.id,
      });
    }

    if (!nodeIds.has(edge.target)) {
      errors.push({
        id: `invalid-target-${edge.id}`,
        code: "INVALID_EDGE_TARGET",
        severity: "error",
        message: "Edge references a missing target node.",
        edgeId: edge.id,
      });
    }
  }
}

function validateStartAndEndConnections(
  nodes: WorkflowNode[],
  edges: Edge[],
  errors: WorkflowValidationIssue[],
) {
  const startNode = nodes.find(
    (node) => node.data.type === "start",
  );
  const endNode = nodes.find(
    (node) => node.data.type === "end",
  );

  if (startNode) {
    const outgoing = edges.filter(
      (edge) => edge.source === startNode.id,
    );
    const incoming = edges.filter(
      (edge) => edge.target === startNode.id,
    );

    if (outgoing.length === 0) {
      errors.push({
        id: "start-not-connected",
        code: "START_NOT_CONNECTED",
        severity: "error",
        message: "Start node must connect to the workflow.",
        nodeId: startNode.id,
      });
    }

    if (incoming.length > 0) {
      errors.push({
        id: "start-has-incoming",
        code: "START_HAS_INCOMING",
        severity: "error",
        message: "Start node cannot have incoming connections.",
        nodeId: startNode.id,
      });
    }
  }

  if (endNode) {
    const incoming = edges.filter(
      (edge) => edge.target === endNode.id,
    );
    const outgoing = edges.filter(
      (edge) => edge.source === endNode.id,
    );

    if (incoming.length === 0) {
      errors.push({
        id: "end-not-connected",
        code: "END_NOT_CONNECTED",
        severity: "error",
        message: "End node must have an incoming connection.",
        nodeId: endNode.id,
      });
    }

    if (outgoing.length > 0) {
      errors.push({
        id: "end-has-outgoing",
        code: "END_HAS_OUTGOING",
        severity: "error",
        message: "End node cannot have outgoing connections.",
        nodeId: endNode.id,
      });
    }
  }
}

function validateConditionConnections(
  nodes: WorkflowNode[],
  edges: Edge[],
  errors: WorkflowValidationIssue[],
) {
  const conditions = nodes.filter(
    (node) => node.data.type === "condition",
  );

  for (const condition of conditions) {
    const outgoing = edges.filter(
      (edge) => edge.source === condition.id,
    );

    const hasTrueBranch = outgoing.some(
      (edge) => edge.sourceHandle === "true",
    );
    const hasFalseBranch = outgoing.some(
      (edge) => edge.sourceHandle === "false",
    );

    if (!hasTrueBranch) {
      errors.push({
        id: `${condition.id}-true-missing`,
        code: "CONDITION_TRUE_BRANCH_MISSING",
        severity: "error",
        message: "Condition must have a True branch.",
        nodeId: condition.id,
      });
    }

    if (!hasFalseBranch) {
      errors.push({
        id: `${condition.id}-false-missing`,
        code: "CONDITION_FALSE_BRANCH_MISSING",
        severity: "error",
        message: "Condition must have a False branch.",
        nodeId: condition.id,
      });
    }
  }
}

function validateEdgeHandles(
  nodes: WorkflowNode[],
  edges: Edge[],
  errors: WorkflowValidationIssue[],
) {
  const nodeMap = new Map(
    nodes.map((node) => [node.id, node]),
  );

  for (const edge of edges) {
    const sourceNode = nodeMap.get(edge.source);

    if (
      sourceNode?.data.type === "condition" &&
      edge.sourceHandle !== "true" &&
      edge.sourceHandle !== "false"
    ) {
      errors.push({
        id: `${edge.id}-invalid-condition-handle`,
        code: "INVALID_CONDITION_HANDLE",
        severity: "error",
        message:
          "Condition connections must use a True or False branch.",
        edgeId: edge.id,
        nodeId: sourceNode.id,
      });
    }
  }
}

function validateOrphanNodes(
  nodes: WorkflowNode[],
  edges: Edge[],
  warnings: WorkflowValidationIssue[],
) {
  for (const node of nodes) {
    if (node.data.type === "start" || node.data.type === "end") {
      continue;
    }

    const connected = edges.some(
      (edge) =>
        edge.source === node.id || edge.target === node.id,
    );

    if (!connected) {
      warnings.push({
        id: `${node.id}-orphan`,
        code: "ORPHAN_NODE",
        severity: "warning",
        message: "Node is not connected to the workflow.",
        nodeId: node.id,
      });
    }
  }
}
