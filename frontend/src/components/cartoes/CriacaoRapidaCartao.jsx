import React, { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import Button from "../ui/Button";

export default function CriacaoRapidaCartao({
  listaId,
  disabled = false,
  onCriar,
  placeholder = "Título do cartão…",
  variant = "inline",
}) {
  const [titulo, setTitulo] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandido, setExpandido] = useState(variant !== "kanban");
  const inputRef = useRef(null);

  const kanban = variant === "kanban";

  useEffect(() => {
    if (kanban && expandido) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [kanban, expandido]);

  async function submit() {
    const t = titulo.trim();
    if (!t || !listaId || loading) return;

    setLoading(true);
    try {
      await onCriar({ titulo: t, listaId });
      setTitulo("");
      if (kanban) {
        setExpandido(false);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
    if (event.key === "Escape" && kanban && expandido) {
      event.preventDefault();
      setTitulo("");
      setExpandido(false);
    }
  }

  if (kanban && !expandido) {
    return (
      <div className="criacao-rapida-cartao-kanban">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="criacao-rapida-cartao-kanban__trigger"
          disabled={disabled || !listaId}
          leftIcon={<Plus size={16} aria-hidden="true" />}
          aria-expanded={expandido}
          onClick={() => setExpandido(true)}
        >
          Adicionar cartão
        </Button>
      </div>
    );
  }

  return (
    <div
      className={
        kanban
          ? "criacao-rapida-cartao-kanban criacao-rapida-cartao-kanban--expanded"
          : "flex gap-2"
      }
    >
      <input
        ref={inputRef}
        type="text"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || loading || !listaId}
        placeholder={placeholder}
        className={
          kanban
            ? "criacao-rapida-cartao-kanban__input"
            : "min-w-0 flex-1 rounded-lg border border-[var(--input-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--input-text)]"
        }
        aria-label="Criar cartão rapidamente"
      />
      <div className={kanban ? "criacao-rapida-cartao-kanban__actions" : "flex gap-2"}>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={loading}
          disabled={disabled || !listaId || !titulo.trim()}
          leftIcon={<Plus size={14} aria-hidden="true" />}
          onClick={submit}
        >
          Adicionar
        </Button>
        {kanban ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={loading}
            onClick={() => {
              setTitulo("");
              setExpandido(false);
            }}
          >
            Cancelar
          </Button>
        ) : null}
      </div>
    </div>
  );
}
