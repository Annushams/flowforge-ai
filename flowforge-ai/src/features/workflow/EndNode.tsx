import {
  Handle,
  Position,
  type NodeProps,
} from "@xyflow/react";

import type { WorkflowNode } from "./types";

export function EndNode({
  selected,
}: NodeProps<WorkflowNode>) {
  return (
    <div
      className={[
        "flex h-16 w-16 items-center justify-center",
        "rounded-full border-2",
        "bg-[var(--bg-subtle)]",
        "border-[var(--error)]",
        "text-[var(--error)]",
        "shadow-[var(--shadow)]",
        "transition-all duration-150",
        selected
          ? "shadow-[var(--accent-shadow)]"
          : "hover:border-[var(--error)]",
      ].join(" ")}
    >
      <Handle
        id="target"
        type="target"
        position={Position.Left}
        className="
          !h-2.5 !w-2.5
          !border-2 !border-[var(--bg)]
          !bg-[var(--error)]
        "
      />

      <span className="text-[10px] font-semibold uppercase tracking-wider">
        End
      </span>
    </div>
  );
}