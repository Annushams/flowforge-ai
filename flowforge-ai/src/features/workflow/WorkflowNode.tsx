import {
  Handle,
  Position,
  type NodeProps,
} from "@xyflow/react";

import type { WorkflowNode } from "./types";

export function WorkflowNode({
  data,
  selected,
}: NodeProps<WorkflowNode>) {
  return (
    <div
      className={[
        "relative min-w-56 rounded-lg border",
        "bg-[var(--bg-subtle)]",
        "border-[var(--border)]",
        "shadow-[var(--shadow)]",
        "transition-all duration-150",
        selected
          ? "border-[var(--accent)] shadow-[var(--accent-shadow)]"
          : "hover:border-[var(--border-hover)]",
      ].join(" ")}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !border-2 !border-[var(--bg)] !bg-[var(--text-muted)]"
      />

      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-muted)]">
          <span className="text-xs font-semibold text-[var(--accent)]">
            {data.type.slice(0, 1).toUpperCase()}
          </span>
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[var(--text-h)]">
            {data.label}
          </p>

          <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
            {data.description}
          </p>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !border-2 !border-[var(--bg)] !bg-[var(--accent)]"
      />
    </div>
  );
}