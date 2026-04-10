import React, { useState } from "react";
import { Flag } from "lucide-react";

import {
  PRIORIDADES_CARTAO,
  IDS_PRIORIDADE_CARTAO,
} from "../../constants/prioridades";

export { labelPrioridadeCartao } from "../../constants/prioridades";

export function classePrioridadeCartao(id) {
  switch (id) {
    case "alta":
      return "border-[var(--color-danger-border)] bg-[var(--color-danger-surface)] text-[var(--color-danger-text)]";
    case "media":
      return "border-[var(--color-warning-border)] bg-[var(--color-warning-surface)] text-[var(--color-warning-text)]";
    case "baixa":
      return "border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]";
    default:
      return "border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]";
  }
}

export default function CartaoPrioridade({
  prioridade = "",
  loading = false,
  disabled = false,
  onSave,
}) {
  const [erro, setErro] = useState("");
  const valor =
    prioridade && IDS_PRIORIDADE_CARTAO.includes(prioridade)
      ? prioridade
      : "";

  async function handleChange(event) {
    const v = event.target.value;
    setErro("");
    const next = v === "" ? null : v;
    try {
      if (typeof onSave === "function") {
        await onSave(next);
      }
    } catch (err) {
      setErro(
        err?.response?.data?.message ||
          err?.message ||
          "Não foi possível salvar a prioridade."
      );
    }
  }

  return (
    <div className="mb-6">
      <label
        htmlFor="cartao-prioridade"
        className="mb-2 flex items-center gap-2 text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
      >
        <Flag size={16} aria-hidden="true" />
        Prioridade
      </label>
      <select
        id="cartao-prioridade"
        value={valor}
        onChange={handleChange}
        disabled={disabled || loading}
        className="w-full max-w-md rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
      >
        <option value="">Sem prioridade</option>
        {PRIORIDADES_CARTAO.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>
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
