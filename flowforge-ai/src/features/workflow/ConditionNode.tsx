import {
    Handle,
    Position,
    type NodeProps,
} from "@xyflow/react";

import type { WorkflowNode } from "./types";

export function ConditionNode({
    data,
    selected,
}: NodeProps<WorkflowNode>) {
    return (
        <div className="relative h-36 w-36">

            {/* Diamond */}
            <div
                className={[
                    "absolute inset-4",
                    "rotate-45",
                    "rounded-xl border",
                    "bg-[var(--bg-subtle)]",
                    "border-[var(--border)]",
                    "shadow-[var(--shadow)]",
                    "transition-all duration-150",

                    selected
                        ? "border-[var(--accent)] shadow-[var(--accent-shadow)]"
                        : "hover:border-[var(--border-hover)]",
                ].join(" ")}
            />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div
                    className="
                        flex h-8 w-8
                        items-center justify-center
                        rounded-md border
                        border-[var(--border)]
                        bg-[var(--bg-muted)]
                    "
                >
                    <span className="text-[10px] font-semibold text-[var(--accent)]">
                        IF
                    </span>
                </div>

                <p
                    className="
                        mt-1
                        max-w-20
                        truncate
                        text-center
                        text-[11px]
                        font-medium
                        text-[var(--text-h)]
                    "
                >
                    {data.label}
                </p>
            </div>

            {/* Incoming connection */}
            <Handle
                id="target"
                type="target"
                position={Position.Left}
                className="
                    !h-2.5 !w-2.5
                    !border-2 !border-[var(--bg)]
                    !bg-[var(--text-muted)]
                "
            />

            {/* TRUE branch */}
            <Handle
                id="true"
                type="source"
                position={Position.Top}
                className="
                    !h-2.5 !w-2.5
                    !border-2 !border-[var(--bg)]
                    !bg-[var(--success)]
                "
            />

            {/* FALSE branch */}
            <Handle
                id="false"
                type="source"
                position={Position.Bottom}
                className="
                    !h-2.5 !w-2.5
                    !border-2 !border-[var(--bg)]
                    !bg-[var(--error)]
                "
            />

            {/* TRUE label */}
            <span
                className="
                    absolute
                    -top-1
                    left-1/2
                    -translate-x-1/2
                    -translate-y-full
                    text-[9px]
                    font-semibold
                    text-[var(--success)]
                "
            >
                True
            </span>

            {/* FALSE label */}
            <span
                className="
                    absolute
                    -bottom-1
                    left-1/2
                    -translate-x-1/2
                    translate-y-full
                    text-[9px]
                    font-semibold
                    text-[var(--error)]
                "
            >
                False
            </span>
        </div>
    );
}