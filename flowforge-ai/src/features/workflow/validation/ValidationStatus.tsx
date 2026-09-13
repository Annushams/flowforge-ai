import { AlertCircle, CheckCircle2 } from "lucide-react";

import type { WorkflowValidationResult } from "./types";

interface ValidationStatusProps {
  validation: WorkflowValidationResult;
  onClick: () => void;
}

export function ValidationStatus({
  validation,
  onClick,
}: ValidationStatusProps) {
  const errorCount = validation.errors.length;
  const warningCount = validation.warnings.length;

  if (errorCount === 0 && warningCount === 0) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="
          flex items-center gap-1.5
          rounded-md
          px-2
          py-1
          text-xs
          font-medium
          text-[var(--success)]
          transition
          hover:bg-[var(--bg-hover)]
        "
      >
        <CheckCircle2 size={14} />
        Valid
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex items-center gap-1.5
        rounded-md
        px-2
        py-1
        text-xs
        font-medium
        text-[var(--error)]
        transition
        hover:bg-[var(--bg-hover)]
      "
    >
      <AlertCircle size={14} />

      {errorCount > 0
        ? `${errorCount} ${
            errorCount === 1
              ? "Error"
              : "Errors"
          }`
        : `${warningCount} ${
            warningCount === 1
              ? "Warning"
              : "Warnings"
          }`}
    </button>
  );
}