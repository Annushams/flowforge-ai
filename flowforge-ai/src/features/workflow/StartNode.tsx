import {
  Handle,
  Position,
  type NodeProps,
} from "@xyflow/react";

import type { WorkflowNode } from "./types";

export function StartNode({
  selected,
}: NodeProps<WorkflowNode>) {
  return (
    <div
      className={[
        "flex h-16 w-16 items-center justify-center",
        "rounded-full border-2",
        "bg-[var(--bg-subtle)]",
        "border-[var(--success)]",
        "text-[var(--success)]",
        "shadow-[var(--shadow)]",
        "transition-all duration-150",
        selected
          ? "shadow-[var(--accent-shadow)]"
          : "hover:border-[var(--success)]",
      ].join(" ")}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider">
        Start
      </span>

      <Handle
        id="source"
        type="source"
        position={Position.Right}
        className="
          !h-2.5 !w-2.5
          !border-2 !border-[var(--bg)]
          !bg-[var(--success)]
        "
      />
    </div>
  );
}