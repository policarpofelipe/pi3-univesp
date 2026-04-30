import React, { useState } from "react";
import { Check, Tags } from "lucide-react";

import Button from "../ui/Button";
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
  const [erro, setErro] = useState("");

  const selecionados = new Set((tagIds || []).map(String));

  async function toggle(tagId) {
    if (disabled || salvando) return;
    setErro("");
    const id = String(tagId);
    const next = new Set(selecionados);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSalvando(true);
    try {
      await onChange?.(
        [...next]
          .map((v) => Number(v))
          .filter((v) => Number.isInteger(v) && v > 0)
      );
    } catch (err) {
      setErro(
        err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          err?.message ||
          "Não foi possível atualizar as tags do cartão."
      );
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
          await onChange?.(
            next
              .map((v) => Number(v))
              .filter((v) => Number.isInteger(v) && v > 0)
          );
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
        <div className="cartao-tags-list">
          {tags.map((t) => {
            const ativo = selecionados.has(String(t.id));
            return (
              <button
                key={t.id}
                type="button"
                disabled={disabled || salvando}
                onClick={() => toggle(t.id)}
                className={[
                  "cartao-tag-chip",
                  "cartao-tag-chip--selector",
                  ativo
                    ? "cartao-tag-chip--selected"
                    : "",
                ].join(" ")}
                style={{
                  "--tag-color": t.cor || "var(--color-primary)",
                }}
                aria-pressed={ativo}
                title={t.nome}
              >
                {ativo ? <Check className="cartao-tag-chip__check" size={14} aria-hidden="true" /> : null}
                <span className="cartao-tag-chip__text">{t.nome}</span>
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

      {erro ? (
        <p
          className="mt-2 text-[var(--font-size-xs)] text-[var(--color-danger-text)]"
          role="alert"
        >
          {erro}
        </p>
      ) : null}
    </div>
  );
}
