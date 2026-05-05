import { useState } from "react";
import Button from "../ui/Button";

export default function CampoOpcaoForm({ loading = false, onAdd }) {
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");

  async function handleAdd() {
    setError("");
    const value = label.trim();
    if (!value) {
      setError("Informe o nome da opção.");
      return;
    }

    await onAdd?.(value);
    setLabel("");
  }

  return (
    <div className="flex flex-wrap items-start gap-2">
      <div className="min-w-[220px] flex-1">
        <input
          type="text"
          value={label}
          disabled={loading}
          onChange={(event) => setLabel(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleAdd();
            }
          }}
          placeholder="Nova opção"
          className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
          aria-invalid={Boolean(error)}
        />
        {error ? (
          <p className="mt-1 text-[var(--font-size-xs)] text-[var(--color-danger-text)]">
            {error}
          </p>
        ) : null}
      </div>
      <Button type="button" variant="secondary" loading={loading} onClick={handleAdd}>
        Adicionar opção
      </Button>
    </div>
  );
}
