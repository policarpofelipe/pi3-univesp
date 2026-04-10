import React from "react";
import ListaHeader from "./ListaHeader";

/**
 * Coluna visual para futuro quadro Kanban; hoje o conteúdo é livre (ex.: cartões).
 */
export default function ListaColumn({
  lista,
  children = null,
  headerActions = null,
  className = "",
}) {
  if (!lista) {
    return null;
  }

  return (
    <section
      className={[
        "flex min-h-[200px] min-w-[260px] max-w-[320px] flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3",
        className,
      ].join(" ")}
      aria-label={`Lista ${lista.nome}`}
    >
      <ListaHeader
        nome={lista.nome}
        totalCartoes={lista.totalCartoes}
        limiteWip={lista.limiteWip}
        actions={headerActions}
        className="border-[var(--color-border)]"
      />
      <div className="mt-3 flex flex-1 flex-col gap-2">{children}</div>
    </section>
  );
}
