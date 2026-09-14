import {
  Handle,
  Position,
  type NodeProps,
} from "@xyflow/react";

import type { WorkflowNode } from "./types";
import { useWorkflowStore } from "./workflowStore";

export function WorkflowNode({
  id,
  data,
  selected,
}: NodeProps<WorkflowNode>) {

  const hasValidationError = useWorkflowStore(
    (state) =>
      state.validation.errors.some(
        (issue) => issue.nodeId === id,
      ),
  );
  return (
    <div
      className={[
        "relative w-64 max-w-64 overflow-hidden rounded-lg border",
        "bg-[var(--bg-subtle)]",
        "shadow-[var(--shadow)]",
        "transition-all duration-150",

        hasValidationError
          ? "border-[var(--error)] shadow-[0_0_0_2px_var(--error),var(--shadow)]"
          : selected
            ? "border-[var(--accent)] shadow-[var(--accent-shadow)]"
            : "border-[var(--border)] hover:border-[var(--border-hover)]",
      ].join(" ")}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="
          !h-2 !w-2
          !border-2
          !border-[var(--bg)]
          !bg-[var(--text-muted)]
        "
      />

      <div className="flex min-w-0 items-center gap-3 px-4 py-3">
        <div
          className="
            flex h-8 w-8 shrink-0 items-center justify-center
            rounded-md border
            border-[var(--border)]
            bg-[var(--bg-muted)]
          "
        >
          <span className="text-xs font-semibold text-[var(--accent)]">
            {data.type.slice(0, 2).toUpperCase()}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p
            title={data.label}
            className="
              truncate text-sm font-semibold
              text-[var(--text-h)]
            "
          >
            {data.label}
          </p>

          <p
            title={data.description}
            className="
              mt-0.5 overflow-hidden
              text-ellipsis whitespace-nowrap
              text-xs leading-4
              text-[var(--text-muted)]
            "
          >
            {data.description}
          </p>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="
          !h-2 !w-2
          !border-2
          !border-[var(--bg)]
          !bg-[var(--accent)]
        "
      />
    </div>
  );
}