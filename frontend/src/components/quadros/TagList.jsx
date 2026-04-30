import React from "react";
import { Trash2 } from "lucide-react";

import Button from "../ui/Button";
import TagBadge from "../cartoes/TagBadge";

export default function TagList({
  tags = [],
  onEditar,
  onRemover,
  removendoId = null,
}) {
  if (!tags.length) {
    return (
      <p className="text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
        Nenhuma tag neste quadro.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {tags.map((t) => (
        <li
          key={t.id}
          className="flex items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2"
        >
          <TagBadge nome={t.nome} cor={t.cor} />
          <div className="flex items-center gap-2">
            {typeof onEditar === "function" ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onEditar(t)}
                aria-label={`Editar tag ${t.nome}`}
              >
                Editar
              </Button>
            ) : null}
            {typeof onRemover === "function" ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                loading={removendoId === t.id}
                disabled={removendoId != null}
                leftIcon={<Trash2 size={14} />}
                onClick={() => onRemover(t)}
                aria-label={`Remover tag ${t.nome}`}
              />
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
