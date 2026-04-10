import React from "react";
import { Building2, Archive, FolderOpen, Settings, Users, KeyRound } from "lucide-react";
import Button from "../ui/Button";

function isArquivado(quadro) {
  return Boolean(quadro?.arquivadoEm ?? quadro?.arquivado);
}

export default function QuadroHeader({
  quadro,
  onConfigurar,
  onMembros,
  onPapeis,
  onNovoCartao,
  children,
}) {
  if (!quadro) {
    return null;
  }

  const arquivado = isArquivado(quadro);
  const orgNome =
    quadro.organizacao?.nome || quadro.organizacaoNome || null;
  const IconeStatus = arquivado ? Archive : FolderOpen;

  return (
    <header className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[var(--font-size-xs)] font-medium",
                arquivado
                  ? "border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]"
                  : "border-[var(--color-success-border)] bg-[var(--color-success-surface)] text-[var(--color-success-text)]",
              ].join(" ")}
            >
              <IconeStatus size={12} aria-hidden="true" />
              {arquivado ? "Arquivado" : "Ativo"}
            </span>
          </div>

          <h1 className="mt-2 text-[var(--font-size-heading-2)] font-semibold tracking-tight text-[var(--color-text)]">
            {quadro.nome}
          </h1>

          {quadro.descricao ? (
            <p className="mt-2 max-w-3xl text-[var(--font-size-sm)] leading-relaxed text-[var(--color-text-muted)]">
              {quadro.descricao}
            </p>
          ) : null}

          {orgNome ? (
            <p className="mt-3 flex items-center gap-2 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
              <Building2 size={16} aria-hidden="true" />
              <span>{orgNome}</span>
            </p>
          ) : null}
        </div>

        <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
          {typeof onConfigurar === "function" ? (
            <Button
              type="button"
              variant="secondary"
              leftIcon={<Settings size={16} />}
              onClick={onConfigurar}
            >
              Configurar
            </Button>
          ) : null}
          {typeof onMembros === "function" ? (
            <Button
              type="button"
              variant="secondary"
              leftIcon={<Users size={16} />}
              onClick={onMembros}
            >
              Membros
            </Button>
          ) : null}
          {typeof onPapeis === "function" ? (
            <Button
              type="button"
              variant="secondary"
              leftIcon={<KeyRound size={16} />}
              onClick={onPapeis}
            >
              Papéis
            </Button>
          ) : null}
          {children}
          {typeof onNovoCartao === "function" ? (
            <Button
              type="button"
              variant="primary"
              onClick={onNovoCartao}
            >
              Novo cartão
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
