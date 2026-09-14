import { create } from "zustand";

import type { Edge } from "@xyflow/react";

import { initialEdges, initialNodes } from "./initialWorkflow";
import type { WorkflowNode } from "./types";

import type {
  WorkflowValidationResult,
} from "./validation/types";

import { validateWorkflow } from "./validation/workflowValidator";

import {
  getNodeDefinition,
  getDefaultConfig,
} from "./nodeDefinitions";

interface WorkflowState {
  nodes: WorkflowNode[];
  edges: Edge[];

  selectedNodeId: string | null;
  selectedEdgeId: string | null;

  validation: WorkflowValidationResult;

  validateWorkflow: () => WorkflowValidationResult;

  setNodes: (
    nodes:
      | WorkflowNode[]
      | ((nodes: WorkflowNode[]) => WorkflowNode[]),
  ) => void;

  setEdges: (
    edges:
      | Edge[]
      | ((edges: Edge[]) => Edge[]),
  ) => void;

  selectNode: (nodeId: string | null) => void;
  selectEdge: (edgeId: string | null) => void;

  addNode: (node: WorkflowNode) => void;

  updateNodeData: (
    nodeId: string,
    data: Partial<WorkflowNode["data"]>,
  ) => void;

  updateEdge: (
    edgeId: string,
    data: Partial<Edge>,
  ) => void;

  removeNode: (nodeId: string) => void;

  removeEdge: (edgeId: string) => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,

  selectedNodeId: null,
  selectedEdgeId: null,

  // validation: {
  //   valid: true,
  //   errors: [],
  //   warnings: [],
  // },

  validation: validateWorkflow(
    initialNodes,
    initialEdges,
  ),

  setNodes: (nodes) =>
    set((state) => {
      const nextNodes =
        typeof nodes === "function"
          ? nodes(state.nodes)
          : nodes;

      return {
        nodes: nextNodes,
        validation: validateWorkflow(
          nextNodes,
          state.edges,
        ),
      };
    }),

  setEdges: (edges) =>
    set((state) => {
      const nextEdges =
        typeof edges === "function"
          ? edges(state.edges)
          : edges;

      return {
        edges: nextEdges,
        validation: validateWorkflow(
          state.nodes,
          nextEdges,
        ),
      };
    }),

  selectNode: (nodeId) =>
    set({
      selectedNodeId: nodeId,
      selectedEdgeId: null,
    }),

  selectEdge: (edgeId) =>
    set({
      selectedEdgeId: edgeId,
      selectedNodeId: null,
    }),

  // addNode: (node) =>
  //   set((state) => {
  //     const nextNodes = [
  //       ...state.nodes,
  //       node,
  //     ];

  //     return {
  //       nodes: nextNodes,
  //       validation: validateWorkflow(
  //         nextNodes,
  //         state.edges,
  //       ),
  //     };
  //   }),

  addNode: (node) =>
    set((state) => {
      if (
        node.data.type === "start" ||
        node.data.type === "end"
      ) {
        const nextNodes = [
          ...state.nodes,
          node,
        ];

        return {
          nodes: nextNodes,
          validation: validateWorkflow(
            nextNodes,
            state.edges,
          ),
        };
      }

      const definition = getNodeDefinition(
        node.data.type,
      );

      const nextNode = definition
        ? {
          ...node,
          data: {
            ...node.data,
            config: {
              ...getDefaultConfig(definition),
              ...node.data.config,
            },
          },
        }
        : node;

      const nextNodes = [
        ...state.nodes,
        nextNode,
      ];

      return {
        nodes: nextNodes,
        validation: validateWorkflow(
          nextNodes,
          state.edges,
        ),
      };
    }),

  updateNodeData: (nodeId, data) =>
    set((state) => {
      const nextNodes = state.nodes.map(
        (node) =>
          node.id === nodeId
            ? {
              ...node,
              data: {
                ...node.data,
                ...data,
              },
            }
            : node,
      );

      return {
        nodes: nextNodes,
        validation: validateWorkflow(
          nextNodes,
          state.edges,
        ),
      };
    }),

  updateEdge: (edgeId, data) =>
    set((state) => {
      const nextEdges = state.edges.map(
        (edge) =>
          edge.id === edgeId
            ? {
              ...edge,
              ...data,
            }
            : edge,
      );

      return {
        edges: nextEdges,
        validation: validateWorkflow(
          state.nodes,
          nextEdges,
        ),
      };
    }),

  removeEdge: (edgeId) =>
    set((state) => {
      const nextEdges = state.edges.filter(
        (edge) => edge.id !== edgeId,
      );

      return {
        edges: nextEdges,

        selectedEdgeId:
          state.selectedEdgeId === edgeId
            ? null
            : state.selectedEdgeId,

        validation: validateWorkflow(
          state.nodes,
          nextEdges,
        ),
      };
    }),

  removeNode: (nodeId) =>
    set((state) => {
      const node = state.nodes.find(
        (item) => item.id === nodeId,
      );

      if (
        !node ||
        node.data.type === "start" ||
        node.data.type === "end"
      ) {
        return state;
      }

      const nextNodes = state.nodes.filter(
        (item) => item.id !== nodeId,
      );

      const nextEdges = state.edges.filter(
        (edge) =>
          edge.source !== nodeId &&
          edge.target !== nodeId,
      );

      return {
        nodes: nextNodes,
        edges: nextEdges,

        selectedNodeId:
          state.selectedNodeId === nodeId
            ? null
            : state.selectedNodeId,

        validation: validateWorkflow(
          nextNodes,
          nextEdges,
        ),
      };
    }),

  validateWorkflow: () => {
    const { nodes, edges } = get();

    const result = validateWorkflow(
      nodes,
      edges,
    );

    set({
      validation: result,
    });

    return result;
  },

}));