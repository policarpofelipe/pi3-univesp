import React from "react";
import {
  Building2,
  KanbanSquare,
  CalendarDays,
  Archive,
  FolderOpen,
} from "lucide-react";
import Button from "../ui/Button";

function formatarData(data) {
  if (!data) return "Não informado";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(data));
  } catch {
    return data;
  }
}

function isArquivado(quadro) {
  return Boolean(quadro?.arquivadoEm ?? quadro?.arquivado);
}

export default function QuadroCard({
  quadro,
  onOpen,
  onConfigure,
  compact = false,
}) {
  if (!quadro?.id) {
    return null;
  }

  const arquivado = isArquivado(quadro);
  const orgNome =
    quadro.organizacaoNome ||
    quadro.organizacao?.nome ||
    "Organização não informada";
  const atualizado = quadro.atualizadoEm || quadro.atualizado_em;

  function handleOpen() {
    if (typeof onOpen === "function") {
      onOpen(quadro.id);
    }
  }

  function handleConfigure(event) {
    event.stopPropagation();
    if (typeof onConfigure === "function") {
      onConfigure(quadro.id);
    }
  }

  const IconeStatus = arquivado ? Archive : FolderOpen;

  return (
    <article
      className={[
        "flex h-full flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]",
        "transition-all duration-150 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-sm)]",
      ].join(" ")}
      aria-labelledby={`quadro-card-${quadro.id}-titulo`}
    >
      <div className={compact ? "p-4" : "p-5"}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-primary)]">
            <KanbanSquare className="h-5 w-5" aria-hidden="true" />
          </div>

          <span
            className={[
              "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[var(--font-size-xs)] font-medium",
              arquivado
                ? "border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]"
                : "border-[var(--color-success-border)] bg-[var(--color-success-surface)] text-[var(--color-success-text)]",
            ].join(" ")}
          >
            <IconeStatus size={12} aria-hidden="true" />
            {arquivado ? "Arquivado" : "Ativo"}
          </span>
        </div>

        <h2
          id={`quadro-card-${quadro.id}-titulo`}
          className="mt-4 text-[var(--font-size-lg)] font-semibold text-[var(--color-text)]"
        >
          {quadro.nome}
        </h2>

        <p className="mt-1 flex items-center gap-1.5 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
          <Building2 size={14} aria-hidden="true" />
          <span>{orgNome}</span>
        </p>

        <p className="mt-3 min-h-[2.75rem] text-[var(--font-size-sm)] leading-relaxed text-[var(--color-text-muted)]">
          {quadro.descricao?.trim() || "Sem descrição cadastrada."}
        </p>

        <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-[var(--color-border)] pt-4 text-center">
          <div>
            <dt className="text-[var(--font-size-xs)] text-[var(--color-text-soft)]">
              Membros
            </dt>
            <dd className="text-[var(--font-size-sm)] font-semibold text-[var(--color-text)]">
              {quadro.totalMembros ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--font-size-xs)] text-[var(--color-text-soft)]">
              Listas
            </dt>
            <dd className="text-[var(--font-size-sm)] font-semibold text-[var(--color-text)]">
              {quadro.totalListas ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--font-size-xs)] text-[var(--color-text-soft)]">
              Cartões
            </dt>
            <dd className="text-[var(--font-size-sm)] font-semibold text-[var(--color-text)]">
              {quadro.totalCartoes ?? "—"}
            </dd>
          </div>
        </dl>

        <p className="mt-3 flex items-center gap-1.5 text-[var(--font-size-xs)] text-[var(--color-text-soft)]">
          <CalendarDays size={12} aria-hidden="true" />
          <span>Atualizado em {formatarData(atualizado)}</span>
        </p>
      </div>

      <div className="mt-auto flex flex-wrap gap-2 border-t border-[var(--color-border)] p-4">
        <Button
          type="button"
          variant="primary"
          className="flex-1 min-w-[8rem]"
          onClick={handleOpen}
        >
          Abrir quadro
        </Button>
        {typeof onConfigure === "function" ? (
          <Button
            type="button"
            variant="secondary"
            onClick={handleConfigure}
          >
            Configurar
          </Button>
        ) : null}
      </div>
    </article>
  );
}
