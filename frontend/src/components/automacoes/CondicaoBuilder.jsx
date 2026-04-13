import { useEffect, useState } from "react";

export default function CondicaoBuilder({
  initialValue = null,
  disabled = false,
  onChange,
}) {
  const [text, setText] = useState(
    initialValue ? JSON.stringify(initialValue, null, 2) : ""
  );
  const [error, setError] = useState("");

  useEffect(() => {
    setText(initialValue ? JSON.stringify(initialValue, null, 2) : "");
    setError("");
  }, [initialValue]);

  function handleChange(nextText) {
    setText(nextText);
    if (!nextText.trim()) {
      setError("");
      onChange?.(null, true);
      return;
    }
    try {
      const parsed = JSON.parse(nextText);
      setError("");
      onChange?.(parsed, true);
    } catch {
      setError("JSON inválido.");
      onChange?.(null, false);
    }
  }

  return (
    <div>
      <label
        htmlFor="automacao-condicoes-json"
        className="mb-1 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
      >
        Condições JSON (opcional)
      </label>
      <textarea
        id="automacao-condicoes-json"
        rows={6}
        value={text}
        disabled={disabled}
        onChange={(event) => handleChange(event.target.value)}
        placeholder='Ex.: { "prioridade": "alta" }'
        className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 font-mono text-[var(--font-size-sm)]"
      />
      {error ? (
        <p className="mt-1 text-[var(--font-size-xs)] text-[var(--color-danger-text)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
