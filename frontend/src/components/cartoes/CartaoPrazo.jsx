import React, { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";

import Button from "../ui/Button";

export function isoParaInputData(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function inputDataParaIso(yyyyMmDd) {
  if (!yyyyMmDd || !String(yyyyMmDd).trim()) return null;
  const partes = String(yyyyMmDd).split("-").map(Number);
  const [y, m, d] = partes;
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).toISOString();
}

export function formatarPrazoExibicao(iso) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function prazoEstaAtrasado(iso) {
  if (!iso) return false;
  const fim = new Date(iso);
  if (Number.isNaN(fim.getTime())) return false;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const limite = new Date(fim);
  limite.setHours(0, 0, 0, 0);
  return limite < hoje;
}

export default function CartaoPrazo({
  prazoEm = null,
  loading = false,
  disabled = false,
  onSave,
}) {
  const [data, setData] = useState(() => isoParaInputData(prazoEm));
  const [erro, setErro] = useState("");

  useEffect(() => {
    setData(isoParaInputData(prazoEm));
  }, [prazoEm]);

  const salvo = isoParaInputData(prazoEm);

  async function persistir(iso) {
    setErro("");
    try {
      if (typeof onSave === "function") {
        await onSave(iso);
      }
    } catch (err) {
      setErro(
        err?.response?.data?.message ||
          err?.message ||
          "Não foi possível salvar o prazo."
      );
    }
  }

  async function handleSalvar() {
    const iso = inputDataParaIso(data);
    if (data && !iso) {
      setErro("Data inválida.");
      return;
    }
    await persistir(iso);
  }

  async function handleLimpar() {
    setData("");
    await persistir(null);
  }

  async function handleBlur() {
    if (disabled || loading) return;
    const iso = inputDataParaIso(data);
    if ((data || "") === (salvo || "") && (iso || null) === (prazoEm || null)) {
      return;
    }
    if (data && !iso) {
      setErro("Data inválida.");
      return;
    }
    if (!data && !prazoEm) return;
    await persistir(iso);
  }

  return (
    <div className="mb-6">
      <label
        htmlFor="cartao-prazo-data"
        className="mb-2 flex items-center gap-2 text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
      >
        <CalendarDays size={16} aria-hidden="true" />
        Prazo
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <input
          id="cartao-prazo-data"
          type="date"
          value={data}
          onChange={(e) => {
            setErro("");
            setData(e.target.value);
          }}
          onBlur={handleBlur}
          disabled={disabled || loading}
          className="rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={loading}
            disabled={disabled}
            onClick={handleSalvar}
          >
            Salvar prazo
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled || loading || !prazoEm}
            onClick={handleLimpar}
          >
            Limpar
          </Button>
        </div>
      </div>
      {prazoEm ? (
        <p
          className={[
            "mt-2 text-[var(--font-size-xs)]",
            prazoEstaAtrasado(prazoEm)
              ? "text-[var(--color-danger-text)]"
              : "text-[var(--color-text-muted)]",
          ].join(" ")}
        >
          {prazoEstaAtrasado(prazoEm) ? "Atrasado: " : "Definido para "}
          <time dateTime={prazoEm}>{formatarPrazoExibicao(prazoEm)}</time>
        </p>
      ) : null}
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
