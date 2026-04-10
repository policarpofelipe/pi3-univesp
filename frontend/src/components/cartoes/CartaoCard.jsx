import React from "react";
import Button from "../ui/Button";

export default function CartaoCard({
  cartao,
  listas = [],
  onEdit,
  onDelete,
  onMoverLista,
  movendo = false,
}) {
  return (
    <article
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-xs)]"
      aria-label={`Cartão ${cartao.titulo}`}
    >
      <h5 className="text-[var(--font-size-sm)] font-semibold text-[var(--color-text)]">
        {cartao.titulo}
      </h5>
      {cartao.descricao ? (
        <p className="mt-1 line-clamp-3 text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
          {cartao.descricao}
        </p>
      ) : null}

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {listas.length > 1 ? (
          <label className="flex min-w-0 flex-1 flex-col gap-1 sm:max-w-[11rem]">
            <span className="sr-only">Mover para lista</span>
            <select
              value={String(cartao.listaId)}
              disabled={movendo}
              onChange={(e) =>
                onMoverLista?.(cartao, e.target.value)
              }
              className="rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] px-2 py-1.5 text-[var(--font-size-xs)]"
            >
              {listas.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nome}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="flex flex-wrap gap-1">
          {typeof onEdit === "function" ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(cartao)}
            >
              Editar
            </Button>
          ) : null}
          {typeof onDelete === "function" ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDelete(cartao)}
            >
              Excluir
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
