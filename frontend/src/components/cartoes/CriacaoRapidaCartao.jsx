import React, { useState } from "react";
import { Plus } from "lucide-react";
import Button from "../ui/Button";

export default function CriacaoRapidaCartao({
  listaId,
  disabled = false,
  onCriar,
  placeholder = "Título rápido e Enter…",
}) {
  const [titulo, setTitulo] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    const t = titulo.trim();
    if (!t || !listaId || loading) return;

    setLoading(true);
    try {
      await onCriar({ titulo: t, listaId });
      setTitulo("");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || loading || !listaId}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-lg border border-[var(--input-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--input-text)]"
        aria-label="Criar cartão rapidamente"
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        loading={loading}
        disabled={disabled || !listaId || !titulo.trim()}
        leftIcon={<Plus size={14} />}
        onClick={submit}
      >
        Adicionar
      </Button>
    </div>
  );
}
