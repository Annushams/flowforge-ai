import type { ConfigField } from "./nodeDefinitions";
import { CredentialSelector } from "../credentials/CredentialSelector";
import type { WorkflowValidationIssue } from "./validation/types";
// import type { WorkflowNode } from "./types";

interface NodeConfigEditorProps {
    fields: ConfigField[];
    values: Record<string, unknown>;
    onChange: (key: string, value: unknown) => void;
    //   node: WorkflowNode;
    validationIssues?: WorkflowValidationIssue[];
}

// function isFieldVisible(
//     field: ConfigField,
//     values: Record<string, unknown>,
// ): boolean {
//     if (!field.visibleWhen) {
//         return true;
//     }

//     const actualValue =
//         values[field.visibleWhen.field];

//     if (
//         field.visibleWhen.equals !== undefined &&
//         actualValue !== field.visibleWhen.equals
//     ) {
//         return false;
//     }

//     if (
//         field.visibleWhen.notEquals !== undefined &&
//         actualValue === field.visibleWhen.notEquals
//     ) {
//         return false;
//     }

//     return true;
// }

function isFieldVisible(
    field: ConfigField,
    fields: ConfigField[],
    values: Record<string, unknown>,
): boolean {
    if (!field.visibleWhen) {
        return true;
    }

    const dependencyField = fields.find(
        (candidate) =>
            candidate.key ===
            field.visibleWhen?.field,
    );

    const actualValue =
        values[field.visibleWhen.field] ??
        dependencyField?.defaultValue;

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

export function NodeConfigEditor({
    fields,
    values,
    onChange,
    validationIssues = [],
    //   node,
}: NodeConfigEditorProps) {
    if (fields.length === 0) {
        return (
            <p className="text-xs leading-5 text-[var(--text-muted)]">
                This node has no configurable properties.
            </p>
        );
    }

    return (
        <div className="space-y-5">
            {fields
                .filter((field) => isFieldVisible(field, fields, values))
                .map((field) => {
                    //   const value = values[field.key] ?? "";
                    const value =
                        values[field.key] ??
                        field.defaultValue ??
                        "";

                    const fieldIssue = validationIssues.find(
                        (issue) => issue.field === field.key,
                    );

                    const inputClassName = `
            w-full rounded-md border
            bg-[var(--input-bg)]
            px-3 text-[13px]
            text-[var(--input-text)]
            outline-none
            transition
            ${fieldIssue
                            ? "border-[var(--error)] focus:border-[var(--error)] focus:ring-1 focus:ring-[var(--error)]"
                            : "border-[var(--border)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
                        }
          `;

                    return (
                        <div key={field.key}>
                            <label
                                htmlFor={`config-${field.key}`}
                                className="text-[12px] font-medium text-[var(--text-h)]"
                            >
                                {field.label}

                                {field.required && (
                                    <span className="ml-1 text-[var(--error)]">
                                        *
                                    </span>
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
                                        value={String(value)}
                                        onChange={(event) =>
                                            onChange(
                                                field.key,
                                                event.target.value,
                                            )
                                        }
                                        placeholder={field.placeholder}
                                        className={`
                      ${inputClassName}
                      h-10
                      placeholder:text-[var(--input-placeholder)]
                    `}
                                    />
                                )}

                                {field.type === "password" && (
                                    <input
                                        id={`config-${field.key}`}
                                        type="password"
                                        value={String(value)}
                                        onChange={(event) =>
                                            onChange(
                                                field.key,
                                                event.target.value,
                                            )
                                        }
                                        placeholder={field.placeholder}
                                        autoComplete="new-password"
                                        className={`
                      ${inputClassName}
                      h-10
                      placeholder:text-[var(--input-placeholder)]
                    `}
                                    />
                                )}

                                {field.type === "number" && (
                                    <input
                                        id={`config-${field.key}`}
                                        type="number"
                                        value={String(value)}
                                        min={field.min}
                                        max={field.max}
                                        onChange={(event) =>
                                            onChange(
                                                field.key,
                                                event.target.value === ""
                                                    ? ""
                                                    : Number(event.target.value),
                                            )
                                        }
                                        placeholder={field.placeholder}
                                        className={`
                      ${inputClassName}
                      h-10
                      placeholder:text-[var(--input-placeholder)]
                    `}
                                    />
                                )}

                                {field.type === "textarea" && (
                                    <textarea
                                        id={`config-${field.key}`}
                                        value={String(value)}
                                        onChange={(event) =>
                                            onChange(
                                                field.key,
                                                event.target.value,
                                            )
                                        }
                                        placeholder={field.placeholder}
                                        rows={field.rows ?? 4}
                                        className={`
                      ${inputClassName}
                      resize-none
                      py-2
                      leading-5
                      placeholder:text-[var(--input-placeholder)]
                    `}
                                    />
                                )}

                                {field.type === "json" && (
                                    <textarea
                                        id={`config-${field.key}`}
                                        value={String(value)}
                                        onChange={(event) =>
                                            onChange(
                                                field.key,
                                                event.target.value,
                                            )
                                        }
                                        placeholder={field.placeholder}
                                        rows={field.rows ?? 5}
                                        spellCheck={false}
                                        className={`
                      ${inputClassName}
                      resize-none
                      py-2
                      leading-5
                      placeholder:text-[var(--input-placeholder)]
                      font-[var(--mono)]
                    `}
                                    />
                                )}

                                {field.type === "select" && (
                                    <select
                                        id={`config-${field.key}`}
                                        value={String(value)}
                                        onChange={(event) =>
                                            onChange(
                                                field.key,
                                                event.target.value,
                                            )
                                        }
                                        className={`
                      ${inputClassName}
                      h-10
                    `}
                                    >
                                        {field.options?.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                {field.type === "boolean" && (
                                    <div
                                        className={`
                      rounded-md border px-3 py-2.5
                      ${fieldIssue
                                                ? "border-[var(--error)]"
                                                : "border-[var(--border)]"
                                            }
                    `}
                                    >
                                        <label className="flex items-center gap-2">
                                            <input
                                                id={`config-${field.key}`}
                                                type="checkbox"
                                                checked={Boolean(value)}
                                                onChange={(event) =>
                                                    onChange(
                                                        field.key,
                                                        event.target.checked,
                                                    )
                                                }
                                                className="
                          h-4 w-4 rounded
                          border-[var(--border)]
                          accent-[var(--accent)]
                        "
                                            />

                                            <span className="text-[13px] text-[var(--text)]">
                                                Enabled
                                            </span>
                                        </label>
                                    </div>
                                )}

                                {field.type === "credential" && (
                                    <div
                                        className={`
                      rounded-md border
                      ${fieldIssue
                                                ? "border-[var(--error)]"
                                                : "border-[var(--border)]"
                                            }
                    `}
                                    >
                                        <CredentialSelector
                                            value={String(value)}
                                            onChange={(nextValue) =>
                                                onChange(
                                                    field.key,
                                                    nextValue,
                                                )
                                            }
                                        />
                                    </div>
                                )}

                                {fieldIssue && (
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