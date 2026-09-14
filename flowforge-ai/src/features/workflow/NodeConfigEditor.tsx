import { useState } from "react";

import type { ConfigField } from "./nodeDefinitions";
import { CredentialSelector } from "../credentials/CredentialSelector";
import type { WorkflowValidationIssue } from "./validation/types";

interface NodeConfigEditorProps {
  fields: ConfigField[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  validationIssues?: WorkflowValidationIssue[];
  validationFocusField?: string | null;
}

function isFieldVisible(
  field: ConfigField,
  values: Record<string, unknown>,
): boolean {
  if (!field.visibleWhen) {
    return true;
  }

  const actualValue = values[field.visibleWhen.field];

  if (
    field.visibleWhen.equals !== undefined &&
    actualValue !== field.visibleWhen.equals
  ) {
    return false;
  }

  if (
    field.visibleWhen.notEquals !== undefined &&
    actualValue === field.visibleWhen.notEquals
  ) {
    return false;
  }

  return true;
}

function sanitizeTextInput(value: string): string {
  // Remove NUL and other non-display control characters while preserving
  // normal whitespace/newlines used by SQL, JSON, prompts and email bodies.
  return Array.from(value)
    .filter((character) => {
      const codePoint = character.charCodeAt(0);

      return !(
        codePoint === 0 ||
        (codePoint >= 1 && codePoint <= 8) ||
        (codePoint >= 11 && codePoint <= 12) ||
        (codePoint >= 14 && codePoint <= 31) ||
        codePoint === 127
      );
    })
    .join("");
}

export function NodeConfigEditor({
  fields,
  values,
  onChange,
  validationIssues = [],
  validationFocusField = null,
}: NodeConfigEditorProps) {
  const [touchedFields, setTouchedFields] = useState<Set<string>>(
    new Set(),
  );

  if (fields.length === 0) {
    return (
      <p className="text-xs leading-5 text-[var(--text-muted)]">
        This node has no configurable properties.
      </p>
    );
  }

  const markTouched = (key: string) => {
    setTouchedFields((current) => {
      const next = new Set(current);
      next.add(key);
      return next;
    });
  };

  const handleTextChange = (
    field: ConfigField,
    value: string,
  ) => {
    const sanitized = sanitizeTextInput(value);
    const maxLength = field.validation?.maxLength;
    const bounded =
      maxLength !== undefined
        ? sanitized.slice(0, maxLength)
        : sanitized;

    onChange(field.key, bounded);
  };

  const handleNumberChange = (
    field: ConfigField,
    value: string,
  ) => {
    if (value === "") {
      onChange(field.key, "");
      return;
    }

    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      onChange(field.key, parsed);
    }
  };

  const defaultValues = Object.fromEntries(
    fields
      .filter(
        (field) => field.defaultValue !== undefined,
      )
      .map((field) => [
        field.key,
        field.defaultValue,
      ]),
  );

  const effectiveValues = {
    ...defaultValues,
    ...values,
  };

  const visibleFields = fields.filter((field) =>
    isFieldVisible(field, effectiveValues),
  );

  return (
    <div className="space-y-5">
      {visibleFields.map((field) => {
        const value =
          effectiveValues[field.key] ?? "";
        const fieldIssue = validationIssues.find(
          (issue) => issue.field === field.key,
        );
        const showIssue =
          Boolean(fieldIssue) &&
          (
            touchedFields.has(field.key) ||
            validationFocusField === field.key
          );
        const maxLength = field.validation?.maxLength;
        const stringValue =
          typeof value === "string" ? value : String(value);

        const inputBorder = showIssue
          ? "border-[var(--error)] focus:border-[var(--error)] focus:ring-1 focus:ring-[var(--error)]"
          : "border-[var(--border)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]";

        return (
          <div key={field.key}>
            <label
              htmlFor={`config-${field.key}`}
              className="text-[12px] font-medium text-[var(--text-h)]"
            >
              {field.label}
              {field.required && (
                <span className="ml-1 text-[var(--error)]">*</span>
              )}
            </label>

            {field.description && (
              <p className="mt-1 text-[11px] leading-4 text-[var(--text-muted)]">
                {field.description}
              </p>
            )}

            <div className="mt-1.5">
              {field.type === "text" && (
                <input
                  id={`config-${field.key}`}
                  type="text"
                  value={stringValue}
                  maxLength={maxLength}
                  onChange={(event) =>
                    handleTextChange(field, event.target.value)
                  }
                  onBlur={() => markTouched(field.key)}
                  placeholder={field.placeholder}
                  aria-invalid={showIssue}
                  className={`h-10 w-full rounded-md border bg-[var(--input-bg)] px-3 text-[13px] text-[var(--input-text)] placeholder:text-[var(--input-placeholder)] outline-none transition ${inputBorder}`}
                />
              )}

              {field.type === "password" && (
                <input
                  id={`config-${field.key}`}
                  type="password"
                  value={stringValue}
                  maxLength={maxLength}
                  onChange={(event) =>
                    handleTextChange(field, event.target.value)
                  }
                  onBlur={() => markTouched(field.key)}
                  placeholder={field.placeholder}
                  autoComplete="new-password"
                  aria-invalid={showIssue}
                  className={`h-10 w-full rounded-md border bg-[var(--input-bg)] px-3 text-[13px] text-[var(--input-text)] placeholder:text-[var(--input-placeholder)] outline-none transition ${inputBorder}`}
                />
              )}

              {field.type === "number" && (
                <input
                  id={`config-${field.key}`}
                  type="number"
                  value={stringValue}
                  min={field.min}
                  max={field.max}
                  onChange={(event) =>
                    handleNumberChange(field, event.target.value)
                  }
                  onBlur={() => markTouched(field.key)}
                  placeholder={field.placeholder}
                  aria-invalid={showIssue}
                  className={`h-10 w-full rounded-md border bg-[var(--input-bg)] px-3 text-[13px] text-[var(--input-text)] placeholder:text-[var(--input-placeholder)] outline-none transition ${inputBorder}`}
                />
              )}

              {field.type === "textarea" && (
                <textarea
                  id={`config-${field.key}`}
                  value={stringValue}
                  maxLength={maxLength}
                  onChange={(event) =>
                    handleTextChange(field, event.target.value)
                  }
                  onBlur={() => markTouched(field.key)}
                  placeholder={field.placeholder}
                  rows={field.rows ?? 4}
                  aria-invalid={showIssue}
                  className={`w-full resize-none rounded-md border bg-[var(--input-bg)] px-3 py-2 text-[13px] leading-5 text-[var(--input-text)] placeholder:text-[var(--input-placeholder)] outline-none transition ${inputBorder}`}
                />
              )}

              {field.type === "json" && (
                <textarea
                  id={`config-${field.key}`}
                  value={stringValue}
                  maxLength={maxLength}
                  onChange={(event) =>
                    handleTextChange(field, event.target.value)
                  }
                  onBlur={() => markTouched(field.key)}
                  placeholder={field.placeholder}
                  rows={field.rows ?? 5}
                  spellCheck={false}
                  aria-invalid={showIssue}
                  className={`w-full resize-none rounded-md border bg-[var(--code-bg)] px-3 py-2 font-[var(--mono)] text-[11px] leading-5 text-[var(--text-h)] placeholder:text-[var(--text-muted)] outline-none transition ${inputBorder}`}
                />
              )}

              {field.type === "select" && (
                <select
                  id={`config-${field.key}`}
                  value={stringValue}
                  onChange={(event) => {
                    onChange(field.key, event.target.value);
                    markTouched(field.key);
                  }}
                  aria-invalid={showIssue}
                  className={`h-10 w-full rounded-md border bg-[var(--input-bg)] px-3 text-[13px] text-[var(--input-text)] outline-none transition ${inputBorder}`}
                >
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              {field.type === "boolean" && (
                <label
                  className={`flex items-center gap-2 rounded-md border px-3 py-2 ${showIssue ? "border-[var(--error)]" : "border-[var(--border)]"}`}
                >
                  <input
                    id={`config-${field.key}`}
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(event) => {
                      onChange(field.key, event.target.checked);
                      markTouched(field.key);
                    }}
                    className="h-4 w-4 rounded border-[var(--border)] accent-[var(--accent)]"
                  />
                  <span className="text-xs text-[var(--text)]">
                    Enabled
                  </span>
                </label>
              )}

              {field.type === "credential" && (
                <div
                  className={`rounded-md border p-1 ${showIssue ? "border-[var(--error)]" : "border-[var(--border)]"}`}
                  onBlur={() => markTouched(field.key)}
                >
                  <CredentialSelector
                    value={stringValue}
                    onChange={(nextValue) => {
                      onChange(field.key, nextValue);
                      markTouched(field.key);
                    }}
                  />
                </div>
              )}

              {maxLength !== undefined &&
                (field.type === "text" ||
                  field.type === "password" ||
                  field.type === "textarea" ||
                  field.type === "json") && (
                  <div className="mt-1 flex justify-end text-[10px] text-[var(--text-subtle)]">
                    {stringValue.length}/{maxLength}
                  </div>
                )}

              {showIssue && fieldIssue && (
                <p className="mt-1 text-[11px] leading-4 text-[var(--error)]">
                  {fieldIssue.message}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
