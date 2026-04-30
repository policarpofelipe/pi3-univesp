import React, { useState } from "react";
import { Check, Tags } from "lucide-react";

import Button from "../ui/Button";
import TagBadge from "./TagBadge";
import TagForm from "../quadros/TagForm";
import tagService from "../../services/tagService";
import { extractObject } from "../../utils/apiData";

export default function TagSelector({
  quadroId,
  tagIds = [],
  tags = [],
  disabled = false,
  onChange,
  onTagsRefresh,
}) {
  const [criando, setCriando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const selecionados = new Set((tagIds || []).map(String));

  async function toggle(tagId) {
    if (disabled || salvando) return;
    const id = String(tagId);
    const next = new Set(selecionados);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSalvando(true);
    try {
      await onChange?.([...next]);
    } finally {
      setSalvando(false);
    }
  }

  async function handleCriarTag(payload) {
    setCriando(true);
    try {
      const res = await tagService.criar(quadroId, payload);
      const nova = extractObject(res) || res;
      await onTagsRefresh?.();
      if (nova?.id) {
        const next = [...selecionados, String(nova.id)];
        setSalvando(true);
        try {
          await onChange?.(next);
        } finally {
          setSalvando(false);
        }
      }
      setMostrarForm(false);
    } finally {
      setCriando(false);
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-[var(--font-size-sm)] font-medium text-[var(--color-text)]">
        <Tags size={16} aria-hidden="true" />
        Tags
      </div>

      {tags.length === 0 && !mostrarForm ? (
        <p className="mb-3 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
          Não há tags no quadro. Crie uma abaixo.
        </p>
      ) : tags.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {tags.map((t) => {
            const ativo = selecionados.has(String(t.id));
            return (
              <button
                key={t.id}
                type="button"
                disabled={disabled || salvando}
                onClick={() => toggle(t.id)}
                className={[
                  "inline-flex items-center gap-1 rounded-full transition-opacity",
                  ativo
                    ? "opacity-100 ring-2 ring-[var(--color-focus-ring)] ring-offset-2"
                    : "opacity-60 hover:opacity-100",
                ].join(" ")}
                aria-pressed={ativo}
              >
                {ativo ? <Check size={14} aria-hidden="true" /> : null}
                <TagBadge nome={t.nome} cor={t.cor} />
              </button>
            );
          })}
        </div>
      ) : null}

      {mostrarForm ? (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-4">
          <TagForm
            loading={criando}
            submitLabel="Adicionar e vincular"
            onCancel={() => setMostrarForm(false)}
            onSubmit={handleCriarTag}
          />
        </div>
      ) : (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled || salvando}
          onClick={() => setMostrarForm(true)}
        >
          Nova tag no quadro
        </Button>
      )}
    </div>
  );
}
