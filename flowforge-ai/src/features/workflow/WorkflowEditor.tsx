import { WorkflowCanvas } from "./WorkflowCanvas";
import { ThemeToggle } from "../../components/ThemeToggle";
import { NodeLibrary } from "./NodeLibrary";
import type { NodeDefinition } from "./nodeDefinitions";
import { useWorkflowStore } from "./workflowStore";

export function WorkflowEditor() {
  const nodes = useWorkflowStore(
    (state) => state.nodes,
  );

  const selectedNodeId = useWorkflowStore(
    (state) => state.selectedNodeId,
  );

  const selectedNode =
    nodes.find((node) => node.id === selectedNodeId) ?? null;

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
          <span className="text-xs text-[var(--text-muted)]">
            Saved
          </span>

          <ThemeToggle />

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

        <main className="min-w-0 flex-1">
          <WorkflowCanvas />
        </main>

        {/* Inspector */}
        <aside className="w-80 shrink-0 border-l border-[var(--border)] bg-[var(--bg-subtle)]">
          <div className="border-b border-[var(--border)] px-4 py-3">
            <h3 className="text-sm font-medium text-[var(--text-h)]">
              Inspector
            </h3>
          </div>

          {selectedNode ? (
            <div className="space-y-5 p-4">

              <div>
                <p className="text-xs text-[var(--text-muted)]">
                  Node
                </p>

                <p className="mt-1 text-sm font-medium text-[var(--text-h)]">
                  {selectedNode.data.label}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--text-muted)]">
                  Type
                </p>

                <p className="mt-1 text-xs text-[var(--text)]">
                  {selectedNode.data.type}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--text-muted)]">
                  Description
                </p>

                <p className="mt-1 text-xs leading-5 text-[var(--text)]">
                  {selectedNode.data.description}
                </p>
              </div>

              <div className="border-t border-[var(--border)] pt-4">
                <p className="text-xs font-medium text-[var(--text-h)]">
                  Configuration
                </p>

                <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
                  Node configuration will appear here.
                </p>
              </div>

            </div>
          ) : (
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