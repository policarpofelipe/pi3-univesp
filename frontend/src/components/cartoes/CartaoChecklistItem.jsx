import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import Button from "../ui/Button";
import cartaoChecklistService from "../../services/cartaoChecklistService";

export default function CartaoChecklistItem({
  quadroId,
  cartaoId,
  checklistId,
  item,
  onChanged,
}) {
  const [titulo, setTitulo] = useState(item.titulo || "");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setTitulo(item.titulo || "");
  }, [item.id, item.titulo]);
  const [alternando, setAlternando] = useState(false);
  const [removendo, setRemovendo] = useState(false);

  async function toggleConcluido() {
    setAlternando(true);
    try {
      await cartaoChecklistService.atualizarItem(
        quadroId,
        cartaoId,
        checklistId,
        item.id,
        { concluido: !item.concluido }
      );
      await onChanged?.();
    } finally {
      setAlternando(false);
    }
  }

  async function salvarTitulo() {
    const t = titulo.trim();
    if (!t || t === (item.titulo || "").trim()) return;
    setSalvando(true);
    try {
      await cartaoChecklistService.atualizarItem(
        quadroId,
        cartaoId,
        checklistId,
        item.id,
        { titulo: t }
      );
      await onChanged?.();
    } finally {
      setSalvando(false);
    }
  }

  async function remover() {
    if (!window.confirm("Remover este item?")) return;
    setRemovendo(true);
    try {
      await cartaoChecklistService.removerItem(
        quadroId,
        cartaoId,
        checklistId,
        item.id
      );
      await onChanged?.();
    } finally {
      setRemovendo(false);
    }
  }

  return (
    <li className="flex items-start gap-2 rounded-md border border-transparent py-1 hover:border-[var(--color-border)]">
      <input
        type="checkbox"
        checked={Boolean(item.concluido)}
        disabled={alternando}
        onChange={toggleConcluido}
        className="cartao-checklist__checkbox"
        aria-label={`Concluído: ${item.titulo}`}
      />
      <input
        type="text"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        onBlur={salvarTitulo}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.target.blur();
          }
        }}
        disabled={salvando}
        className={[
          "min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-[var(--font-size-sm)] text-[var(--color-text)]",
          item.concluido ? "text-[var(--color-text-soft)] line-through" : "",
        ].join(" ")}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        loading={removendo}
        disabled={removendo || salvando}
        leftIcon={<Trash2 size={14} />}
        onClick={remover}
        aria-label="Remover item"
      />
    </li>
  );
}
