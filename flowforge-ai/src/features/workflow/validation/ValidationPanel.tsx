import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";

import type {
  WorkflowValidationIssue,
  WorkflowValidationResult,
} from "./types";

interface ValidationPanelProps {
  validation: WorkflowValidationResult;
  onClose: () => void;
  onIssueClick: (
    issue: WorkflowValidationIssue,
  ) => void;
}

export function ValidationPanel({
  validation,
  onClose,
  onIssueClick,
}: ValidationPanelProps) {
  const totalIssues =
    validation.errors.length +
    validation.warnings.length;

  return (
    <div
      className="
        absolute
        bottom-3
        right-3
        z-30
        w-[380px]
        max-w-[calc(100%-24px)]
        overflow-hidden
        rounded-lg
        border
        border-[var(--border)]
        bg-[var(--bg-subtle)]
        shadow-[var(--shadow)]
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-[var(--border)]
          px-4
          py-3
        "
      >
        <div className="flex items-center gap-2">
          {validation.valid ? (
            <CheckCircle2
              size={15}
              className="text-[var(--success)]"
            />
          ) : (
            <AlertCircle
              size={15}
              className="text-[var(--error)]"
            />
          )}

          <h3 className="text-sm font-medium text-[var(--text-h)]">
            Validation
          </h3>

          <span className="text-xs text-[var(--text-muted)]">
            {totalIssues}{" "}
            {totalIssues === 1
              ? "issue"
              : "issues"}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close validation panel"
          className="
            flex
            h-7
            w-7
            items-center
            justify-center
            rounded-md
            text-[var(--text-muted)]
            transition
            hover:bg-[var(--bg-hover)]
            hover:text-[var(--text-h)]
          "
        >
          <X size={15} />
        </button>
      </div>

      <div className="max-h-[420px] overflow-y-auto p-3">
        {validation.errors.length > 0 && (
          <ValidationSection
            title="Errors"
            issues={validation.errors}
            icon={
              <AlertCircle
                size={14}
                className="text-[var(--error)]"
              />
            }
            onIssueClick={onIssueClick}
          />
        )}

        {validation.warnings.length > 0 && (
          <ValidationSection
            title="Warnings"
            issues={validation.warnings}
            icon={
              <AlertTriangle
                size={14}
                className="text-[var(--warning)]"
              />
            }
            onIssueClick={onIssueClick}
          />
        )}

        {validation.valid &&
          validation.warnings.length === 0 && (
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <CheckCircle2
                size={24}
                className="text-[var(--success)]"
              />

              <p className="mt-3 text-sm font-medium text-[var(--text-h)]">
                Workflow is valid
              </p>

              <p className="mt-1 text-xs text-[var(--text-muted)]">
                No validation issues were found.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}

interface ValidationSectionProps {
  title: string;
  issues: WorkflowValidationIssue[];
  icon: React.ReactNode;
  onIssueClick: (
    issue: WorkflowValidationIssue,
  ) => void;
}

function ValidationSection({
  title,
  issues,
  icon,
  onIssueClick,
}: ValidationSectionProps) {
  return (
    <section className="mb-4 last:mb-0">
      <div className="mb-2 flex items-center gap-2 px-1">
        {icon}

        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          {title}
        </span>
      </div>

      <div className="space-y-1">
        {issues.map((issue) => (
          <button
            key={issue.id}
            type="button"
            onClick={() => onIssueClick(issue)}
            className="
              w-full
              rounded-md
              border
              border-transparent
              px-3
              py-2.5
              text-left
              transition
              hover:border-[var(--border)]
              hover:bg-[var(--bg-hover)]
            "
          >
            <p className="text-xs font-medium text-[var(--text-h)]">
              {issue.nodeId ?? issue.edgeId ?? "Workflow"}
            </p>

            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
              {issue.message}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}