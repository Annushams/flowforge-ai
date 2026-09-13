import type { Edge } from "@xyflow/react";

import {
    getNodeDefinition,
    type ConfigField,
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
    validateStartAndEndConnections(
        nodes,
        edges,
        errors,
    );
    validateConditionConnections(
        nodes,
        edges,
        errors,
    );
    validateEdgeHandles(
        nodes,
        edges,
        errors,
    );
    validateNodeConfigurations(
        nodes,
        errors,
    );
    validateOrphanNodes(
        nodes,
        edges,
        warnings,
    );

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
        // Start and End are special nodes.
        if (
            node.data.type === "start" ||
            node.data.type === "end"
        ) {
            continue;
        }

        const definition = getNodeDefinition(
            node.data.type,
        );

        if (!definition) {
            continue;
        }

        for (const field of definition.configFields) {
            if (!field.required) {
                continue;
            }

            if (
                !isFieldVisible(
                    field,
                    definition.configFields,
                    node.data.config,
                )
            ) {
                continue;
            }

            const value =
                node.data.config[field.key] ??
                field.defaultValue;

            if (isEmptyValue(value)) {
                errors.push({
                    id: `${node.id}-${field.key}-required`,
                    severity: "error",
                    message: `${field.label} is required.`,
                    nodeId: node.id,
                    field: field.key,
                });
            }
        }
    }
}

function isFieldVisible(
    field: ConfigField,
    fields: ConfigField[],
    values: Record<string, unknown>,
): boolean {
    if (!field.visibleWhen) {
        return true;
    }

    const dependencyField = fields.find(
        (candidate) =>
            candidate.key ===
            field.visibleWhen?.field,
    );

    const actualValue =
        values[field.visibleWhen.field] ??
        dependencyField?.defaultValue;

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

function isEmptyValue(
    value: unknown,
): boolean {
    if (value === undefined || value === null) {
        return true;
    }

    if (typeof value === "string") {
        return value.trim() === "";
    }

    return false;
}

/* -------------------------------------------------------
 * Start node
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
            severity: "error",
            message:
                "Workflow must have a Start node.",
        });

        return;
    }

    if (startNodes.length > 1) {
        errors.push({
            id: "multiple-start-nodes",
            severity: "error",
            message:
                "Workflow can only have one Start node.",
        });
    }
}

/* -------------------------------------------------------
 * End node
 * ----------------------------------------------------- */

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
            severity: "error",
            message:
                "Workflow must have an End node.",
        });

        return;
    }

    if (endNodes.length > 1) {
        errors.push({
            id: "multiple-end-nodes",
            severity: "error",
            message:
                "Workflow can only have one End node.",
        });
    }
}

/* -------------------------------------------------------
 * Edge references
 * ----------------------------------------------------- */

function validateConnections(
    nodes: WorkflowNode[],
    edges: Edge[],
    errors: WorkflowValidationIssue[],
) {
    const nodeIds = new Set(
        nodes.map((node) => node.id),
    );

    for (const edge of edges) {
        if (!nodeIds.has(edge.source)) {
            errors.push({
                id: `invalid-source-${edge.id}`,
                severity: "error",
                message:
                    "Edge references a missing source node.",
                edgeId: edge.id,
            });
        }

        if (!nodeIds.has(edge.target)) {
            errors.push({
                id: `invalid-target-${edge.id}`,
                severity: "error",
                message:
                    "Edge references a missing target node.",
                edgeId: edge.id,
            });
        }
    }
}

/* -------------------------------------------------------
 * Start / End connections
 * ----------------------------------------------------- */

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
            (edge) =>
                edge.source === startNode.id,
        );

        if (outgoing.length === 0) {
            errors.push({
                id: "start-not-connected",
                severity: "error",
                message:
                    "Start node must connect to the workflow.",
                nodeId: startNode.id,
            });
        }

        const incoming = edges.filter(
            (edge) =>
                edge.target === startNode.id,
        );

        if (incoming.length > 0) {
            errors.push({
                id: "start-has-incoming",
                severity: "error",
                message:
                    "Start node cannot have incoming connections.",
                nodeId: startNode.id,
            });
        }
    }

    if (endNode) {
        const incoming = edges.filter(
            (edge) =>
                edge.target === endNode.id,
        );

        if (incoming.length === 0) {
            errors.push({
                id: "end-not-connected",
                severity: "error",
                message:
                    "End node must have an incoming connection.",
                nodeId: endNode.id,
            });
        }

        const outgoing = edges.filter(
            (edge) =>
                edge.source === endNode.id,
        );

        if (outgoing.length > 0) {
            errors.push({
                id: "end-has-outgoing",
                severity: "error",
                message:
                    "End node cannot have outgoing connections.",
                nodeId: endNode.id,
            });
        }
    }
}

/* -------------------------------------------------------
 * Condition branches
 * ----------------------------------------------------- */

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
            (edge) =>
                edge.source === condition.id,
        );

        const hasTrueBranch = outgoing.some(
            (edge) =>
                edge.sourceHandle === "true",
        );

        const hasFalseBranch = outgoing.some(
            (edge) =>
                edge.sourceHandle === "false",
        );

        if (!hasTrueBranch) {
            errors.push({
                id: `${condition.id}-true-missing`,
                severity: "error",
                message:
                    "Condition must have a True branch.",
                nodeId: condition.id,
            });
        }

        if (!hasFalseBranch) {
            errors.push({
                id: `${condition.id}-false-missing`,
                severity: "error",
                message:
                    "Condition must have a False branch.",
                nodeId: condition.id,
            });
        }
    }
}

/* -------------------------------------------------------
 * Condition handles
 * ----------------------------------------------------- */

function validateEdgeHandles(
    nodes: WorkflowNode[],
    edges: Edge[],
    errors: WorkflowValidationIssue[],
) {
    const nodeMap = new Map(
        nodes.map((node) => [
            node.id,
            node,
        ]),
    );

    for (const edge of edges) {
        const sourceNode = nodeMap.get(
            edge.source,
        );

        if (
            sourceNode?.data.type ===
                "condition" &&
            edge.sourceHandle !== "true" &&
            edge.sourceHandle !== "false"
        ) {
            errors.push({
                id: `${edge.id}-invalid-condition-handle`,
                severity: "error",
                message:
                    "Condition connections must use a True or False branch.",
                edgeId: edge.id,
                nodeId: sourceNode.id,
            });
        }
    }
}

/* -------------------------------------------------------
 * Orphan nodes
 * ----------------------------------------------------- */

function validateOrphanNodes(
    nodes: WorkflowNode[],
    edges: Edge[],
    warnings: WorkflowValidationIssue[],
) {
    for (const node of nodes) {
        if (
            node.data.type === "start" ||
            node.data.type === "end"
        ) {
            continue;
        }

        const connected = edges.some(
            (edge) =>
                edge.source === node.id ||
                edge.target === node.id,
        );

        if (!connected) {
            warnings.push({
                id: `${node.id}-orphan`,
                severity: "warning",
                message:
                    "Node is not connected to the workflow.",
                nodeId: node.id,
            });
        }
    }
}