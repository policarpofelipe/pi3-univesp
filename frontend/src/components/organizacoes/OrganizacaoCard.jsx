import React from "react";
import { Building2, Pencil, Users, LayoutGrid, ArrowRight } from "lucide-react";
import Button from "../ui/Button";

/*
Contrato sugerido:
- organizacao: objeto com dados da organização
- onOpen(id): abre detalhe
- onEdit(id): abre edição
- compact: versão mais enxuta, se necessário no futuro
*/

export default function OrganizacaoCard({
  organizacao,
  onOpen,
  onEdit,
  compact = false,
}) {
  if (!organizacao || !organizacao.id) {
    return null;
  }

  const {
    id,
    nome,
    descricao,
    slug,
    ativo,
    membrosCount,
    quadrosCount,
    criadoEm,
    criado_em,
  } = organizacao;

  const dataCriacao = criadoEm || criado_em || null;

  function handleOpen() {
    if (typeof onOpen === "function") {
      onOpen(id);
      return;
    }

    window.location.href = `/organizacoes/${id}`;
  }

  function handleEdit(event) {
    event.stopPropagation();

    if (typeof onEdit === "function") {
      onEdit(id);
      return;
    }

    console.log("Editar organização:", id);
  }

  return (
    <article
      className={[
        "group flex h-full flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]",
        "transition-all duration-150 hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-sm)]",
      ].join(" ")}
      aria-label={`Organização ${nome}`}
    >
      <button
        type="button"
        onClick={handleOpen}
        className="flex h-full flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 rounded-xl"
      >
        <div className={compact ? "p-4" : "p-5"}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-primary)]">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-[var(--font-size-xs)] font-medium ${
                  ativo === false
                    ? "border border-[var(--color-danger-border)] bg-[var(--color-danger-surface)] text-[var(--color-danger-text)]"
                    : "border border-[var(--color-success-border)] bg-[var(--color-success-surface)] text-[var(--color-success-text)]"
                }`}
              >
                {ativo === false ? "Inativa" : "Ativa"}
              </span>

              <button
                type="button"
                onClick={handleEdit}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2"
                aria-label={`Editar organização ${nome}`}
                title="Editar organização"
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-[var(--font-size-lg)] font-semibold text-[var(--color-text)]">
              {nome}
            </h3>

            {slug ? (
              <p className="mt-1 text-[var(--font-size-xs)] uppercase tracking-wide text-[var(--color-text-soft)]">
                {slug}
              </p>
            ) : null}

            <p className="mt-3 min-h-[3rem] text-[var(--font-size-sm)] leading-6 text-[var(--color-text-muted)]">
              {descricao || "Sem descrição cadastrada."}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-3">
              <div className="flex items-center gap-2 text-[var(--color-text-soft)]">
                <Users className="h-4 w-4" aria-hidden="true" />
                <span className="text-[var(--font-size-xs)] uppercase tracking-wide">
                  Membros
                </span>
              </div>
              <p className="mt-2 text-[var(--font-size-lg)] font-semibold text-[var(--color-text)]">
                {membrosCount ?? 0}
              </p>
            </div>

            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-3">
              <div className="flex items-center gap-2 text-[var(--color-text-soft)]">
                <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                <span className="text-[var(--font-size-xs)] uppercase tracking-wide">
                  Quadros
                </span>
              </div>
              <p className="mt-2 text-[var(--font-size-lg)] font-semibold text-[var(--color-text)]">
                {quadrosCount ?? 0}
              </p>
            </div>
          </div>

          {dataCriacao ? (
            <p className="mt-4 text-[var(--font-size-xs)] text-[var(--color-text-soft)]">
              Criada em: {dataCriacao}
            </p>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-[var(--color-border)] px-5 py-4">
          <span className="text-[var(--font-size-sm)] font-medium text-[var(--color-primary)]">
            Ver detalhes
          </span>

          <ArrowRight
            className="h-4 w-4 text-[var(--color-primary)] transition-transform duration-150 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </div>
      </button>
    </article>
  );
}