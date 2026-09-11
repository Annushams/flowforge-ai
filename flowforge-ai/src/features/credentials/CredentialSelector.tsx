interface Credential {
  id: string;
  name: string;
  type: string;
}

interface CredentialSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const credentials: Credential[] = [
  {
    id: "smtp-development",
    name: "SMTP Development",
    type: "SMTP",
  },
  {
    id: "smtp-production",
    name: "SMTP Production",
    type: "SMTP",
  },
  {
    id: "imap-production",
    name: "IMAP Production",
    type: "IMAP",
  },
];

export function CredentialSelector({
  value,
  onChange,
}: CredentialSelectorProps) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
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
      <option value="">Select credential...</option>

      {credentials.map((credential) => (
        <option
          key={credential.id}
          value={credential.id}
        >
          {credential.name}
        </option>
      ))}
    </select>
  );
}