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

import {
    useCallback,
    useRef,
    useState,
    useEffect,
} from "react";
import { useWorkflowStore } from "./workflowStore";

import { WorkflowNode as WorkflowNodeComponent } from "./WorkflowNode";
import {
    getDefaultConfig,
    type NodeDefinition,
} from "./nodeDefinitions";
import type { WorkflowNode } from "./types";

import "@xyflow/react/dist/style.css";
import { Map } from "lucide-react";

import { StartNode } from "./StartNode";
import { EndNode } from "./EndNode";
import { ConditionNode } from "./ConditionNode";

const nodeTypes = {
    workflow: WorkflowNodeComponent,
    start: StartNode,
    end: EndNode,
    condition: ConditionNode,
};

export function WorkflowCanvas() {
    const [showMiniMap, setShowMiniMap] = useState(true);
    const nodes = useWorkflowStore((state) => state.nodes);
    const edges = useWorkflowStore((state) => state.edges);
    const setNodes = useWorkflowStore((state) => state.setNodes);
    const setEdges = useWorkflowStore((state) => state.setEdges);
    const addNode = useWorkflowStore((state) => state.addNode);
    const selectNode = useWorkflowStore(
        (state) => state.selectNode,
    );

    const selectEdge = useWorkflowStore(
        (state) => state.selectEdge,
    );

    const selectedNodeId =
        useWorkflowStore(
            (state) => state.selectedNodeId,
        );

    const selectedEdgeId =
        useWorkflowStore(
            (state) => state.selectedEdgeId,
        );

    const removeNode =
        useWorkflowStore(
            (state) => state.removeNode,
        );

    const removeEdge =
        useWorkflowStore(
            (state) => state.removeEdge,
        );
        
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;

            const isEditing =
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.tagName === "SELECT" ||
                target.isContentEditable;

            if (isEditing) {
                return;
            }

            if (
                event.key !== "Delete" &&
                event.key !== "Backspace"
            ) {
                return;
            }

            if (selectedNodeId) {
                removeNode(selectedNodeId);
                return;
            }

            if (selectedEdgeId) {
                removeEdge(selectedEdgeId);
            }
        };

        window.addEventListener(
            "keydown",
            handleKeyDown,
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown,
            );
        };
    }, [
        selectedNodeId,
        selectedEdgeId,
        removeNode,
        removeEdge,
    ]);

    const reactFlowInstance = useRef<ReactFlowInstance<WorkflowNode, Edge> | null>(null);

    // const onNodesChange: OnNodesChange<WorkflowNode> = useCallback(
    //     (changes) => {
    //         setNodes((currentNodes) =>
    //             applyNodeChanges(changes, currentNodes),
    //         );
    //     },
    //     [setNodes],
    // );

    const onNodesChange: OnNodesChange<WorkflowNode> =
        useCallback(
            (changes) => {
                setNodes((currentNodes) => {
                    const protectedNodeIds = new Set(
                        currentNodes
                            .filter(
                                (node) =>
                                    node.data.type === "start" ||
                                    node.data.type === "end",
                            )
                            .map((node) => node.id),
                    );

                    const safeChanges = changes.filter(
                        (change) =>
                            !(
                                change.type === "remove" &&
                                protectedNodeIds.has(change.id)
                            ),
                    );

                    return applyNodeChanges(
                        safeChanges,
                        currentNodes,
                    );
                });
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

    // const onConnect = useCallback(
    //     (connection: Connection) => {
    //         setEdges((currentEdges) =>
    //             addEdge(connection, currentEdges),
    //         );
    //     },
    //     [setEdges],
    // );

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

            const flowNodeType =
                nodeDefinition.type === "condition"
                    ? "condition"
                    : "workflow";

            const newNode: WorkflowNode = {
                id: `${nodeDefinition.type}_${Date.now()}`,
                type: flowNodeType,
                position,
                data: {
                    label: nodeDefinition.label,
                    description: nodeDefinition.description,
                    type: nodeDefinition.type,
                    config: getDefaultConfig(nodeDefinition),
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

            onEdgeClick={(_, edge) => {
                selectEdge(edge.id);
            }}

            onPaneClick={() => {
                selectNode(null);
            }}
        >
            <Background />
            <Controls />
            {/* <MiniMap /> */}
            {showMiniMap && (
                <MiniMap
                    pannable
                    zoomable
                    className="
      !overflow-hidden
      !rounded-lg
      !border
      !border-[var(--border)]
      !bg-[var(--bg-subtle)]
    "
                />
            )}

            <button
                type="button"
                onClick={() =>
                    setShowMiniMap((visible) => !visible)
                }
                aria-label={
                    showMiniMap
                        ? "Hide workflow minimap"
                        : "Show workflow minimap"
                }
                className="
    absolute bottom-3 right-3 z-10
    flex h-8 w-8
    items-center justify-center
    rounded-md border
    border-[var(--border)]
    bg-[var(--bg-subtle)]
    text-[var(--text-muted)]
    shadow-[var(--shadow)]
    transition
    hover:bg-[var(--bg-hover)]
    hover:text-[var(--text-h)]
  "
            >
                <Map size={14} />
            </button>
        </ReactFlow>
    );
}