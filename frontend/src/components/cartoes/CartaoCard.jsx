import React from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import CartaoDescricao from "./CartaoDescricao";

export default function CartaoCard({
  quadroId = "",
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
        {quadroId ? (
          <Link
            to={`/quadros/${quadroId}/cartoes/${cartao.id}`}
            className="text-[var(--color-text)] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2"
          >
            {cartao.titulo}
          </Link>
        ) : (
          cartao.titulo
        )}
      </h5>
      <CartaoDescricao texto={cartao.descricao} variant="compact" />

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
