import {
    Background,
    Controls,
    MiniMap,
    ReactFlow,
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    type Connection,
    type Edge,
    type OnEdgesChange,
    type OnNodesChange,
    type ReactFlowInstance,
} from "@xyflow/react";

import { useCallback, useRef } from "react";
import { useWorkflowStore } from "./workflowStore";

import { WorkflowNode as WorkflowNodeComponent } from "./WorkflowNode";
import type { NodeDefinition } from "./nodeDefinitions";
import type { WorkflowNode } from "./types";

import "@xyflow/react/dist/style.css";

const nodeTypes = {
    workflow: WorkflowNodeComponent,
};

export function WorkflowCanvas() {
    const nodes = useWorkflowStore((state) => state.nodes);
    const edges = useWorkflowStore((state) => state.edges);
    const setNodes = useWorkflowStore((state) => state.setNodes);
    const setEdges = useWorkflowStore((state) => state.setEdges);
    const addNode = useWorkflowStore((state) => state.addNode);
    const selectNode = useWorkflowStore(
        (state) => state.selectNode,
    );
    const reactFlowInstance = useRef<ReactFlowInstance<WorkflowNode, Edge> | null>(null);

    const onNodesChange: OnNodesChange<WorkflowNode> = useCallback(
        (changes) => {
            setNodes((currentNodes) =>
                applyNodeChanges(changes, currentNodes),
            );
        },
        [setNodes],
    );

    // const onEdgesChange: OnEdgesChange = useCallback((changes) => {
    //     setEdges((currentEdges) =>
    //         applyEdgeChanges(changes, currentEdges),
    //     );
    // }, []);

    const onEdgesChange: OnEdgesChange<Edge> = useCallback((changes) => {
        setEdges((currentEdges) =>
            applyEdgeChanges(changes, currentEdges),
        );
    }, [setEdges]);

    const onConnect = useCallback(
        (connection: Connection) => {
            setEdges((currentEdges) =>
                addEdge(connection, currentEdges),
            );
        },
        [setEdges],
    );

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const nodeData = event.dataTransfer.getData(
                "application/flowforge-node",
            );

            if (!nodeData || !reactFlowInstance.current) {
                return;
            }

            const nodeDefinition = JSON.parse(nodeData) as NodeDefinition;

            const position =
                reactFlowInstance.current.screenToFlowPosition({
                    x: event.clientX,
                    y: event.clientY,
                });

            const newNode: WorkflowNode = {
                id: `${nodeDefinition.type}_${Date.now()}`,
                type: "workflow",
                position,
                data: {
                    label: nodeDefinition.label,
                    description: nodeDefinition.description,
                    type: nodeDefinition.type,
                },
            };

            addNode(newNode);
        },
        [addNode],
    );

    const onDragOver = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
        },
        [],
    );

    const onInit = useCallback(
        (instance: ReactFlowInstance<WorkflowNode, Edge>) => {
            reactFlowInstance.current = instance;
        },
        [],
    );

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onInit={onInit}
            fitView
            onNodeClick={(_, node) => {
                selectNode(node.id);
            }}
            onPaneClick={() => {
                selectNode(null);
            }}
        >
            <Background />
            <Controls />
            <MiniMap />
        </ReactFlow>
    );
}