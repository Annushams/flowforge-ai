import type { ConfigField } from "./nodeDefinitions";
import { CredentialSelector } from "../credentials/CredentialSelector";

interface NodeConfigEditorProps {
    fields: ConfigField[];
    values: Record<string, unknown>;
    onChange: (key: string, value: unknown) => void;
}

function isFieldVisible(
    field: ConfigField,
    values: Record<string, unknown>,
): boolean {
    if (!field.visibleWhen) {
        return true;
    }

    const actualValue =
        values[field.visibleWhen.field];

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
                .filter((field) => isFieldVisible(field, values))
                .map((field) => {
                    const value = values[field.key] ?? "";

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
                                        className="
                    h-9 w-full rounded-md border
                    border-[var(--border)]
                    bg-[var(--bg)]
                    px-3 text-xs
                    text-[var(--text-h)]
                    outline-none
                    transition
                    placeholder:text-[var(--text-muted)]
                    focus:border-[var(--accent)]
                  "
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
                                        className="
                    h-9 w-full rounded-md border
                    border-[var(--border)]
                    bg-[var(--bg)]
                    px-3 text-xs
                    text-[var(--text-h)]
                    outline-none
                    transition
                    placeholder:text-[var(--text-muted)]
                    focus:border-[var(--accent)]
                  "
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
                                        className="
                    h-9 w-full rounded-md border
                    border-[var(--border)]
                    bg-[var(--bg)]
                    px-3 text-xs
                    text-[var(--text-h)]
                    outline-none
                    transition
                    placeholder:text-[var(--text-muted)]
                    focus:border-[var(--accent)]
                  "
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
                                        className="
                    w-full resize-none rounded-md border
                    border-[var(--border)]
                    bg-[var(--bg)]
                    px-3 py-2 text-xs
                    leading-5
                    text-[var(--text-h)]
                    outline-none
                    transition
                    placeholder:text-[var(--text-muted)]
                    focus:border-[var(--accent)]
                  "
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
                                        className="
                    w-full resize-none rounded-md border
                    border-[var(--border)]
                    bg-[var(--code-bg)]
                    px-3 py-2
                    font-mono text-[11px]
                    leading-5
                    text-[var(--text-h)]
                    outline-none
                    transition
                    placeholder:text-[var(--text-muted)]
                    focus:border-[var(--accent)]
                  "
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
                                        className="
                    h-9 w-full rounded-md border
                    border-[var(--border)]
                    bg-[var(--bg)]
                    px-3 text-xs
                    text-[var(--text-h)]
                    outline-none
                    transition
                    focus:border-[var(--accent)]
                  "
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

                                        <span className="text-xs text-[var(--text)]">
                                            Enabled
                                        </span>
                                    </label>
                                )}

                                {field.type === "credential" && (
                                    <CredentialSelector
                                        value={String(value)}
                                        onChange={(nextValue) =>
                                            onChange(field.key, nextValue)
                                        }
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}
        </div>
    );
}