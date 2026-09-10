import { create } from "zustand";

import type { Edge } from "@xyflow/react";

import { initialEdges, initialNodes } from "./initialWorkflow";
import type { WorkflowNode } from "./types";

interface WorkflowState {
  nodes: WorkflowNode[];
  edges: Edge[];

  selectedNodeId: string | null;

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

  addNode: (node: WorkflowNode) => void;

  updateNodeData: (
    nodeId: string,
    data: Partial<WorkflowNode["data"]>,
  ) => void;

  removeNode: (nodeId: string) => void;
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  nodes: initialNodes,
  edges: initialEdges,

  selectedNodeId: null,

  setNodes: (nodes) =>
    set((state) => ({
      nodes:
        typeof nodes === "function"
          ? nodes(state.nodes)
          : nodes,
    })),

  setEdges: (edges) =>
    set((state) => ({
      edges:
        typeof edges === "function"
          ? edges(state.edges)
          : edges,
    })),

  selectNode: (nodeId) =>
    set({
      selectedNodeId: nodeId,
    }),

  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
    })),

  updateNodeData: (nodeId, data) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                ...data,
              },
            }
          : node,
      ),
    })),

  removeNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter(
        (node) => node.id !== nodeId,
      ),

      edges: state.edges.filter(
        (edge) =>
          edge.source !== nodeId &&
          edge.target !== nodeId,
      ),

      selectedNodeId:
        state.selectedNodeId === nodeId
          ? null
          : state.selectedNodeId,
    })),
}));