import React from "react";
import {
  Building2,
  KanbanSquare,
  CalendarDays,
  Archive,
  FolderOpen,
  Settings,
  ArrowRight,
  Users,
  ListTodo,
  Layers,
} from "lucide-react";

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
  /** Quando true, oculta a linha da organização (ex.: listagem já filtrada por organização). */
  omitirNomeOrganizacao = false,
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

  const IconeStatus = arquivado ? Archive : FolderOpen;

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

  const membros = quadro.totalMembros ?? "—";
  const listas = quadro.totalListas ?? "—";
  const cartoes = quadro.totalCartoes ?? "—";

  return (
    <article
      className={`quadro-card group ${compact ? "quadro-card--compact" : ""}`.trim()}
      aria-labelledby={`quadro-card-${quadro.id}-titulo`}
    >
      <div className="quadro-card__top">
        <div className="quadro-card__icon" aria-hidden="true">
          <KanbanSquare className="quadro-card__icon-svg" />
        </div>

        <div className="quadro-card__top-actions">
          <span
            className={`quadro-card__badge ${
              arquivado ? "quadro-card__badge--arquivado" : "quadro-card__badge--ativo"
            }`}
          >
            <IconeStatus size={12} aria-hidden="true" />
            {arquivado ? "Arquivado" : "Ativo"}
          </span>

          {typeof onConfigure === "function" ? (
            <button
              type="button"
              className="quadro-card__configure"
              onClick={handleConfigure}
              aria-label={`Configurar quadro ${quadro.nome}`}
              title="Configurar quadro"
            >
              <Settings className="quadro-card__configure-icon" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        className="quadro-card__open"
        onClick={handleOpen}
        aria-label={`Abrir quadro ${quadro.nome}`}
      >
        <span className="quadro-card__open-inner" aria-hidden="true">
          <div className="quadro-card__body">
            <h3 id={`quadro-card-${quadro.id}-titulo`} className="quadro-card__title">
              {quadro.nome}
            </h3>

            {!omitirNomeOrganizacao ? (
              <p className="quadro-card__org">
                <Building2 size={14} aria-hidden="true" />
                <span>{orgNome}</span>
              </p>
            ) : null}

            <p className="quadro-card__desc">
              {quadro.descricao?.trim() || "Sem descrição cadastrada."}
            </p>

            <div className="quadro-card__metrics">
              <div className="quadro-card__metric">
                <div className="quadro-card__metric-head">
                  <Users className="quadro-card__metric-icon" aria-hidden="true" />
                  <span className="quadro-card__metric-label">Membros</span>
                </div>
                <p className="quadro-card__metric-value">{membros}</p>
              </div>

              <div className="quadro-card__metric">
                <div className="quadro-card__metric-head">
                  <ListTodo className="quadro-card__metric-icon" aria-hidden="true" />
                  <span className="quadro-card__metric-label">Listas</span>
                </div>
                <p className="quadro-card__metric-value">{listas}</p>
              </div>

              <div className="quadro-card__metric">
                <div className="quadro-card__metric-head">
                  <Layers className="quadro-card__metric-icon" aria-hidden="true" />
                  <span className="quadro-card__metric-label">Cartões</span>
                </div>
                <p className="quadro-card__metric-value">{cartoes}</p>
              </div>
            </div>

            <p className="quadro-card__date">
              <CalendarDays size={12} aria-hidden="true" />
              <span>Atualizado em {formatarData(atualizado)}</span>
            </p>
          </div>

          <div className="quadro-card__footer">
            <span className="quadro-card__footer-label">Abrir quadro</span>
            <ArrowRight className="quadro-card__footer-arrow" aria-hidden="true" />
          </div>
        </span>
      </button>
    </article>
  );
}
