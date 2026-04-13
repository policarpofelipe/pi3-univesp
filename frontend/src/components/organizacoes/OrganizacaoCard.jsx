import React from "react";
import { Building2, Pencil, Users, LayoutGrid, ArrowRight } from "lucide-react";

/*
Contrato sugerido:
- organizacao: objeto com dados da organização
- onOpen(id): abre detalhe
- onEdit(id): edição / atalho (ex.: detalhe com estado de edição)
- compact: versão mais enxuta, se necessário no futuro

Nota: evitar <button> dentro de <button> (HTML inválido e layout quebrado no navegador).
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
  const pad = compact ? "organizacao-card--compact" : "";

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

    window.location.href = `/organizacoes/${id}`;
  }

  return (
    <article
      className={`organizacao-card group ${pad}`.trim()}
      aria-label={`Organização ${nome}`}
    >
      <div className="organizacao-card__top">
        <div
          className="organizacao-card__icon"
          aria-hidden="true"
        >
          <Building2 className="organizacao-card__icon-svg" />
        </div>

        <div className="organizacao-card__top-actions">
          <span
            className={`organizacao-card__badge ${
              ativo === false
                ? "organizacao-card__badge--inactive"
                : "organizacao-card__badge--active"
            }`}
          >
            {ativo === false ? "Inativa" : "Ativa"}
          </span>

          <button
            type="button"
            className="organizacao-card__edit"
            onClick={handleEdit}
            aria-label={`Editar organização ${nome}`}
            title="Editar organização"
          >
            <Pencil className="organizacao-card__edit-icon" aria-hidden="true" />
          </button>
        </div>
      </div>

      <button
        type="button"
        className="organizacao-card__open"
        onClick={handleOpen}
        aria-label={`Abrir organização ${nome}`}
      >
        <span className="organizacao-card__open-inner" aria-hidden="true">
          <div className="organizacao-card__body">
            <h3 className="organizacao-card__title">{nome}</h3>

            {slug ? (
              <p className="organizacao-card__slug">{slug}</p>
            ) : null}

            <p className="organizacao-card__desc">
              {descricao || "Sem descrição cadastrada."}
            </p>

            <div className="organizacao-card__metrics">
              <div className="organizacao-card__metric">
                <div className="organizacao-card__metric-head">
                  <Users
                    className="organizacao-card__metric-icon"
                    aria-hidden="true"
                  />
                  <span className="organizacao-card__metric-label">Membros</span>
                </div>
                <p className="organizacao-card__metric-value">
                  {membrosCount ?? 0}
                </p>
              </div>

              <div className="organizacao-card__metric">
                <div className="organizacao-card__metric-head">
                  <LayoutGrid
                    className="organizacao-card__metric-icon"
                    aria-hidden="true"
                  />
                  <span className="organizacao-card__metric-label">Quadros</span>
                </div>
                <p className="organizacao-card__metric-value">
                  {quadrosCount ?? 0}
                </p>
              </div>
            </div>

            {dataCriacao ? (
              <p className="organizacao-card__date">Criada em: {dataCriacao}</p>
            ) : null}
          </div>

          <div className="organizacao-card__footer">
            <span className="organizacao-card__footer-label">Ver detalhes</span>
            <ArrowRight
              className="organizacao-card__footer-arrow"
              aria-hidden="true"
            />
          </div>
        </span>
      </button>
    </article>
  );
}
