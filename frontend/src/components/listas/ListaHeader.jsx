import React from "react";
import { Tag } from "lucide-react";

export default function ListaHeader({
  nome,
  totalCartoes = 0,
  limiteWip = null,
  actions = null,
  className = "",
  titleTag: TitleTag = "h4",
}) {
  return (
    <div
      className={[
        "flex flex-wrap items-start justify-between gap-2 border-b border-[var(--color-border)] pb-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="min-w-0 flex-1">
        <TitleTag className="text-[var(--font-size-md)] font-semibold text-[var(--color-text)]">
          {nome}
        </TitleTag>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
          <span>{totalCartoes ?? 0} cartões</span>
          <span className="inline-flex items-center gap-1">
            <Tag size={12} aria-hidden="true" />
            {limiteWip ? `WIP máx.: ${limiteWip}` : "Sem limite WIP"}
          </span>
        </div>
      </div>
      {actions ? (
        <div className="flex flex-shrink-0 flex-wrap items-center gap-1">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
