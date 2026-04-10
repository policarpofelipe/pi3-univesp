import React from "react";
import { Building2, KanbanSquare, ListTodo } from "lucide-react";

export default function CartaoHeader({
  titulo = "",
  nomeLista = "",
  nomeQuadro = "",
  nomeOrganizacao = "",
  actions = null,
  className = "",
}) {
  const partesMeta = [];
  if (String(nomeLista || "").trim()) {
    partesMeta.push({ icone: ListTodo, texto: nomeLista });
  }
  if (String(nomeQuadro || "").trim()) {
    partesMeta.push({ icone: KanbanSquare, texto: nomeQuadro });
  }

  return (
    <header
      className={[
        "rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 md:p-6 shadow-[var(--shadow-xs)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-[var(--font-size-heading-2)] font-semibold tracking-tight text-[var(--color-text)]">
            {titulo}
          </h1>

          {partesMeta.length ? (
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
              {partesMeta.map((p, i) => {
                const Icone = p.icone;
                return (
                  <span key={i} className="inline-flex items-center gap-1.5">
                    <Icone size={16} aria-hidden="true" />
                    <span>{p.texto}</span>
                  </span>
                );
              })}
            </p>
          ) : null}

          {String(nomeOrganizacao || "").trim() ? (
            <p className="mt-3 flex items-center gap-2 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
              <Building2 size={16} aria-hidden="true" />
              <span>{nomeOrganizacao}</span>
            </p>
          ) : null}
        </div>

        {actions ? (
          <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
