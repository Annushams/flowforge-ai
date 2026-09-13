import { useEffect, useState } from "react";
import { WorkflowCanvas } from "./WorkflowCanvas";
import { ThemeToggle } from "../../components/ThemeToggle";
import { NodeLibrary } from "./NodeLibrary";
import {
  nodeDefinitions,
  type NodeDefinition,
} from "./nodeDefinitions";
import { NodeConfigEditor } from "./NodeConfigEditor";
import { useWorkflowStore } from "./workflowStore";
// import { validateWorkflow } from "./validation/workflowValidator";
import { ValidationStatus } from "./validation/ValidationStatus";
import { ValidationPanel } from "./validation/ValidationPanel";

export function WorkflowEditor() {

  const [showValidation, setShowValidation] = useState(false);
  const [validationFocusField, setValidationFocusField] =
    useState<string | null>(null);

  const nodes = useWorkflowStore(
    (state) => state.nodes,
  );

  const selectedNodeId = useWorkflowStore(
    (state) => state.selectedNodeId,
  );

  const edges = useWorkflowStore(
    (state) => state.edges,
  );

  const selectedEdgeId = useWorkflowStore(
    (state) => state.selectedEdgeId,
  );

  const selectedEdge =
    edges.find(
      (edge) => edge.id === selectedEdgeId,
    ) ?? null;

  const selectedNode =
    nodes.find((node) => node.id === selectedNodeId) ?? null;

  const removeNode = useWorkflowStore(
    (state) => state.removeNode,
  );

  const removeEdge = useWorkflowStore(
    (state) => state.removeEdge,
  );

  const validation = useWorkflowStore(
    (state) => state.validation,
  );

  const selectedNodeIssues = selectedNode
    ? validation.errors.filter(
      (issue) => issue.nodeId === selectedNode.id,
    )
    : [];

  // console.log("FlowForge validation:", validation);

  // const validateWorkflow = useWorkflowStore(
  //   (state) => state.validateWorkflow,
  // );

  // useEffect(() => {
  //   validateWorkflow();
  // }, [validateWorkflow]);

  const selectedNodeDefinition = selectedNode
    ? nodeDefinitions.find(
      (node) => node.type === selectedNode.data.type,
    )
    : null;

  const updateNodeData = useWorkflowStore(
    (state) => state.updateNodeData,
  );

  const updateEdge = useWorkflowStore(
    (state) => state.updateEdge,
  );

  const updateNodeConfig = (
    key: string,
    value: unknown,
  ) => {
    if (!selectedNode) {
      return;
    }

    updateNodeData(selectedNode.id, {
      config: {
        ...selectedNode.data.config,
        [key]: value,
      },
    });
  };

  const handleNodeDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    node: NodeDefinition,
  ) => {
    event.dataTransfer.setData(
      "application/flowforge-node",
      JSON.stringify(node),
    );

    event.dataTransfer.effectAllowed = "copy";
  };

  const selectNode = useWorkflowStore(
    (state) => state.selectNode,
  );

  const selectEdge = useWorkflowStore(
    (state) => state.selectEdge,
  );

  useEffect(() => {
    if (!validationFocusField) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      const element = document.getElementById(
        `config-${validationFocusField}`,
      );

      if (element instanceof HTMLElement) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        element.focus();
      }

      setValidationFocusField(null);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [
    selectedNodeId,
    validationFocusField,
  ]);

  return (
    <div className="flex h-full flex-col bg-[var(--bg)]">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-subtle)] px-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[var(--text-h)]">
            FlowForge
          </span>

          <span className="text-[var(--text-muted)]">
            /
          </span>

          <span className="text-sm text-[var(--text)]">
            Untitled Workflow
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="
  text-[12px]
  font-medium
  text-[var(--text-h)]
">
            Saved
          </span>

          <ThemeToggle />

          <ValidationStatus
            validation={validation}
            onClick={() => {
              setShowValidation(true);
            }}
          />

          <button className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-h)]">
            Test
          </button>

          <button className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-[var(--accent-text)] transition hover:opacity-90">
            Run
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex min-h-0 flex-1">

        <NodeLibrary onDragStart={handleNodeDragStart} />

        <main className="relative min-w-0 flex-1">
          <WorkflowCanvas />

          {showValidation && (
            <ValidationPanel
              validation={validation}
              onClose={() => {
                setShowValidation(false);
              }}
              onIssueClick={(issue) => {
                if (issue.nodeId) {
                  selectNode(issue.nodeId);
                  setValidationFocusField(
                    issue.field ?? null,
                  );
                }

                if (issue.edgeId) {
                  selectEdge(issue.edgeId);
                }

                setShowValidation(false);
              }}
            />
          )}
        </main>

        {/* Inspector */}
        <aside className="flex h-full w-80 min-h-0 shrink-0 flex-col border-l border-[var(--border)] bg-[var(--bg-subtle)]">
          <div className="border-b border-[var(--border)] px-4 py-3">
            <h3 className="text-sm font-medium text-[var(--text-h)]">
              Inspector
            </h3>
          </div>

          {selectedNode ? (
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="space-y-5 p-4">

                <div>
                  <label
                    htmlFor="node-label"
                    className="
  text-[12px]
  font-medium
  text-[var(--text-h)]
"
                  >
                    Label
                  </label>

                  <input
                    id="node-label"
                    value={selectedNode.data.label}
                    onChange={(event) => {
                      updateNodeData(selectedNode.id, {
                        label: event.target.value,
                      });
                    }}
                    className="
  mt-1.5 h-10 w-full rounded-md border
  border-[var(--border)]
  bg-[var(--input-bg)]
  px-3
  text-[13px]
  text-[var(--input-text)]
  outline-none
  transition
  placeholder:text-[var(--input-placeholder)]
  focus:border-[var(--accent)]
  focus:ring-1
  focus:ring-[var(--accent)]
"
                  />
                </div>

                <div>
                  <p className="
  text-[12px]
  font-medium
  text-[var(--text-h)]
">
                    Type
                  </p>

                  <p className="mt-1 text-[13px] text-[var(--text)]">
                    {selectedNode.data.type}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="node-description"
                    className="
  text-[12px]
  font-medium
  text-[var(--text-h)]
"
                  >
                    Description
                  </label>

                  <textarea
                    id="node-description"
                    value={selectedNode.data.description}
                    onChange={(event) => {
                      updateNodeData(selectedNode.id, {
                        description: event.target.value,
                      });
                    }}
                    rows={3}
                    className="
                  mt-1.5 w-full resize-none rounded-md border
                  border-[var(--border)]
                  bg-[var(--bg)]
                  px-3 py-2 text-xs
                  leading-5
                  text-[var(--text-h)]
                  outline-none
                  transition
                  focus:border-[var(--accent)]
                "
                  />
                </div>

                <div className="border-t border-[var(--border)] pt-4">
                  <p className="
  text-[11px]
  font-semibold
  uppercase
  tracking-wider
  text-[var(--text-muted)]
">
                    Configuration
                  </p>

                  {selectedNodeDefinition ? (
                    <NodeConfigEditor
                      fields={selectedNodeDefinition.configFields}
                      values={selectedNode.data.config}
                      onChange={updateNodeConfig}
                      // node={selectedNode}
                      validationIssues={selectedNodeIssues}
                    />
                  ) : (
                    <p className="
  text-[12px]
  font-medium
  text-[var(--text-h)]
">
                      Configuration is unavailable for this node.
                    </p>
                  )}
                </div>

                <div className="border-t border-[var(--border)] pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedNode) {
                        removeNode(selectedNode.id);
                      }
                    }}
                    disabled={
                      selectedNode.data.type === "start" ||
                      selectedNode.data.type === "end"
                    }
                    className="
            w-full
            rounded-md
            border
            border-[var(--border)]
            px-3
            py-2
            text-xs
            font-medium
            text-[var(--error)]
            transition
            hover:bg-[var(--bg-hover)]
            disabled:cursor-not-allowed
            disabled:opacity-40
        "
                  >
                    Delete Node
                  </button>

                  {(selectedNode.data.type === "start" ||
                    selectedNode.data.type === "end") && (
                      <p className="mt-2 text-[11px] leading-4 text-[var(--text-muted)]">
                        {selectedNode.data.type === "start"
                          ? "The Start node is required."
                          : "The End node is required."}
                      </p>
                    )}
                </div>

              </div>
            </div>
          ) :
            selectedEdge ? (
              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="space-y-5 p-4">

                  <div>
                    <p
                      className="
                        text-[11px]
                        font-semibold
                        uppercase
                        tracking-wider
                        text-[var(--text-muted)]
                    "
                    >
                      Edge
                    </p>

                    <p
                      className="
                        mt-1
                        text-sm
                        font-medium
                        text-[var(--text-h)]
                    "
                    >
                      Connection
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="edge-label"
                      className="
                        text-[12px]
                        font-medium
                        text-[var(--text-h)]
                    "
                    >
                      Label
                    </label>

                    <input
                      id="edge-label"
                      value={
                        typeof selectedEdge.label === "string"
                          ? selectedEdge.label
                          : ""
                      }
                      onChange={(event) => {
                        updateEdge(
                          selectedEdge.id,
                          {
                            label:
                              event.target.value ||
                              undefined,
                          },
                        );
                      }}
                      placeholder="e.g. User exists"
                      className="
                        mt-1.5
                        h-9
                        w-full
                        rounded-md
                        border
                        border-[var(--border)]
                        bg-[var(--bg)]
                        px-3
                        text-xs
                        text-[var(--text-h)]
                        outline-none
                        transition
                        placeholder:text-[var(--text-muted)]
                        focus:border-[var(--accent)]
                    "
                    />
                  </div>

                  <div className="border-t border-[var(--border)] pt-4">

                    <p
                      className="
                        text-[11px]
                        font-semibold
                        uppercase
                        tracking-wider
                        text-[var(--text-muted)]
                    "
                    >
                      Connection
                    </p>

                    <div className="mt-3 space-y-3">

                      <div>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          Source
                        </p>

                        <p className="mt-1 font-mono text-[11px] text-[var(--text)]">
                          {selectedEdge.source}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          Source Handle
                        </p>

                        <p className="mt-1 font-mono text-[11px] text-[var(--text)]">
                          {selectedEdge.sourceHandle ?? "default"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          Target
                        </p>

                        <p className="mt-1 font-mono text-[11px] text-[var(--text)]">
                          {selectedEdge.target}
                        </p>
                      </div>

                    </div>
                  </div>

                  <div className="border-t border-[var(--border)] pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedEdge) {
                          removeEdge(selectedEdge.id);
                        }
                      }}
                      className="
            w-full
            rounded-md
            border
            border-[var(--border)]
            px-3
            py-2
            text-xs
            font-medium
            text-[var(--error)]
            transition
            hover:bg-[var(--bg-hover)]
        "
                    >
                      Delete Connection
                    </button>
                  </div>

                </div>
              </div>
            ) :
              (
                <div className="flex h-full items-center justify-center px-6 text-center">
                  <p className="text-xs leading-5 text-[var(--text-muted)]">
                    Select a node on the canvas to view and edit
                    its configuration.
                  </p>
                </div>
              )}
        </aside>
      </main>

      {/* Bottom Panel */}
      <footer className="flex h-10 shrink-0 items-center justify-between border-t border-[var(--border)] bg-[var(--bg-subtle)] px-4">
        <span className="text-xs text-[var(--text)]">
          Execution
        </span>

        <button className="text-xs text-[var(--text)] transition hover:text-[var(--text-h)]">
          Ask AI
        </button>
      </footer>
    </div>
  );
}