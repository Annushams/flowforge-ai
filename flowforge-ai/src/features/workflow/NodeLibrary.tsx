import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { nodeDefinitions } from "./nodeDefinitions";
import type { NodeDefinition } from "./nodeDefinitions";

interface NodeLibraryProps {
  onDragStart: (
    event: React.DragEvent<HTMLDivElement>,
    node: NodeDefinition,
  ) => void;
}

export function NodeLibrary({ onDragStart }: NodeLibraryProps) {
  const [search, setSearch] = useState("");

  const filteredNodes = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return nodeDefinitions;
    }

    return nodeDefinitions.filter(
      (node) =>
        node.label.toLowerCase().includes(value) ||
        node.description.toLowerCase().includes(value) ||
        node.category.toLowerCase().includes(value),
    );
  }, [search]);

  const categories = [...new Set(filteredNodes.map((node) => node.category))];

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--bg-subtle)]">
      <div className="border-b border-[var(--border)] p-3">
        <div className="mb-3">
          <h2 className="text-sm font-medium text-[var(--text-h)]">
            Nodes
          </h2>

          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Drag a node onto the canvas
          </p>
        </div>

        <div className="flex h-8 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg)] px-2">
          <Search
            size={14}
            className="shrink-0 text-[var(--text-muted)]"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search nodes..."
            className="
              min-w-0 flex-1 bg-transparent text-xs
              text-[var(--text-h)]
              outline-none
              placeholder:text-[var(--text-muted)]
            "
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {categories.map((category) => (
          <div key={category} className="mb-4">
            <div className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
              {category}
            </div>

            <div className="space-y-1">
              {filteredNodes
                .filter((node) => node.category === category)
                .map((node) => (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={(event) => onDragStart(event, node)}
                    className="
                      flex cursor-grab items-center gap-3
                      rounded-md border border-transparent
                      px-2.5 py-2
                      transition
                      hover:border-[var(--border)]
                      hover:bg-[var(--bg-hover)]
                      active:cursor-grabbing
                    "
                  >
                    <div
                      className="
                        flex h-7 w-7 shrink-0 items-center justify-center
                        rounded-md border
                        border-[var(--border)]
                        bg-[var(--bg-muted)]
                        text-[10px] font-semibold
                        text-[var(--accent)]
                      "
                    >
                      {node.icon}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-[var(--text-h)]">
                        {node.label}
                      </p>

                      <p className="mt-0.5 truncate text-[11px] text-[var(--text-muted)]">
                        {node.description}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}

        {filteredNodes.length === 0 && (
          <div className="px-2 py-8 text-center text-xs text-[var(--text-muted)]">
            No nodes found
          </div>
        )}
      </div>
    </aside>
  );
}