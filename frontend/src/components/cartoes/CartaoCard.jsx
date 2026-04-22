import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useCartaoOverlayReturnFocus } from "../../context/CartaoOverlayReturnFocusContext";
import {
  CircleUserRound,
  CalendarDays,
  CheckSquare,
  MessageCircle,
  Paperclip,
  GripVertical,
} from "lucide-react";

import CartaoDescricao from "./CartaoDescricao";
import {
  formatarPrazoExibicao,
  prazoEstaAtrasado,
} from "./CartaoPrazo";
import TagBadge from "./TagBadge";
import CartaoCardMenu from "./CartaoCardMenu";

function iniciaisNome(nome) {
  const t = String(nome || "").trim();
  if (!t) return "?";
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return t.slice(0, 2).toUpperCase();
}

export default function CartaoCard({
  quadroId = "",
  cartao,
  tagsDisponiveis = [],
  listas = [],
  membrosPorUsuarioId,
  onEdit,
  onArquivar,
  onMoverLista,
  movendo = false,
  className = "",
  dragActivatorRef = null,
  dragListeners = null,
  isDragging = false,
  dragDisabled = false,
}) {
  const location = useLocation();
  const overlayFocus = useCartaoOverlayReturnFocus();

  const membrosMap =
    membrosPorUsuarioId instanceof Map ? membrosPorUsuarioId : new Map();

  const idsTag = Array.isArray(cartao.tagIds) ? cartao.tagIds.map(String) : [];
  const tagsNoCartao = idsTag
    .map((id) => tagsDisponiveis.find((t) => String(t.id) === id))
    .filter(Boolean);

  const atribIds = Array.isArray(cartao.atribuidoUsuarioIds)
    ? cartao.atribuidoUsuarioIds
    : [];
  const atribDisplay = atribIds.slice(0, 3).map((uid) => {
    const info = membrosMap.get(Number(uid));
    return {
      key: uid,
      label: info?.nome || `Usuário ${uid}`,
      iniciais: iniciaisNome(info?.nome || ""),
    };
  });

  const pendentesChecklist = Number(cartao.checklistItensPendentes) || 0;
  const totalChecklist = Number(cartao.checklistItensTotal) || 0;
  const qtdComentarios = Number(cartao.comentariosTotal) || 0;
  const qtdAnexos = Number(cartao.anexosTotal) || 0;

  const prioridadeLabel =
    cartao.prioridade === "urgente"
      ? "Urgente"
      : cartao.prioridade === "alta"
        ? "Alta"
        : cartao.prioridade === "media"
          ? "Média"
          : cartao.prioridade === "baixa"
            ? "Baixa"
            : "Sem prioridade";

  return (
    <article
      className={[
        "cartao-board-card",
        isDragging ? "cartao-board-card--is-dragging" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={`Cartão ${cartao.titulo}`}
    >
      <div
        className={[
          "cartao-board-card__top",
          dragDisabled ? "cartao-board-card__top--no-grip" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {!dragDisabled ? (
          <button
            type="button"
            ref={dragActivatorRef}
            className="cartao-board-card__grip"
            aria-label={`Arrastar cartão ${cartao.titulo}`}
            {...(dragListeners || {})}
          >
            <GripVertical size={16} aria-hidden="true" />
          </button>
        ) : null}
        <div className="cartao-board-card__top-chips">
          {cartao.prioridade ? (
            <span
              className="cartao-board-card__priority-dot"
              title={`Prioridade ${prioridadeLabel}`}
              aria-label={`Prioridade ${prioridadeLabel}`}
            >
              <span className={`cartao-board-card__priority-dot-inner cartao-board-card__priority-dot-inner--${cartao.prioridade}`} />
            </span>
          ) : null}
          {cartao.prazoEm ? (
            <span
              className={[
                "cartao-board-card__chip cartao-board-card__chip--date",
                prazoEstaAtrasado(cartao.prazoEm)
                  ? "cartao-board-card__chip--overdue"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <CalendarDays size={12} aria-hidden="true" />
              <time dateTime={cartao.prazoEm}>
                {formatarPrazoExibicao(cartao.prazoEm)}
              </time>
            </span>
          ) : null}
        </div>
        <CartaoCardMenu
          cartaoTitulo={cartao.titulo}
          quadroId={quadroId}
          cartaoId={cartao.id}
          listas={listas}
          onEditar={typeof onEdit === "function" ? () => onEdit(cartao) : undefined}
          onArquivar={
            typeof onArquivar === "function" ? () => onArquivar(cartao) : undefined
          }
          onMoverParaLista={
            typeof onMoverLista === "function"
              ? (listaId) => onMoverLista(cartao, listaId)
              : undefined
          }
          movendo={movendo}
        />
      </div>

      {tagsNoCartao.length ? (
        <div className="cartao-board-card__tags" aria-label="Tags">
          {tagsNoCartao.map((t) => (
            <TagBadge key={t.id} nome={t.nome} cor={t.cor} />
          ))}
        </div>
      ) : null}

      <div className="cartao-board-card__body">
        <h3 className="cartao-board-card__title">
          {quadroId ? (
            <Link
              to={`cartoes/${cartao.id}`}
              state={{ background: location }}
              className="cartao-board-card__title-link"
              onClick={() =>
                overlayFocus?.setReturnFocusElement?.(document.activeElement)
              }
            >
              {cartao.titulo}
            </Link>
          ) : (
            cartao.titulo
          )}
        </h3>
        <CartaoDescricao texto={cartao.descricao} variant="compact" />
      </div>

      <div className="cartao-board-card__footer">
        <div className="cartao-board-card__avatars" aria-label="Responsáveis">
          {atribDisplay.length ? (
            atribDisplay.map((a) => (
              <span
                key={a.key}
                className="cartao-board-card__avatar"
                title={a.label}
              >
                <span className="sr-only">{a.label}</span>
                <span aria-hidden="true">{a.iniciais}</span>
              </span>
            ))
          ) : null}
          {!atribDisplay.length ? <CircleUserRound size={14} className="cartao-board-card__avatar-empty" aria-hidden="true" /> : null}
        </div>
        <div className="cartao-board-card__meta">
          {qtdComentarios > 0 ? (
            <span className="cartao-board-card__meta-item" title={`${qtdComentarios} comentário(s)`}>
              <MessageCircle size={13} aria-hidden="true" />
              <span>{qtdComentarios}</span>
            </span>
          ) : null}
          {qtdAnexos > 0 ? (
            <span className="cartao-board-card__meta-item" title={`${qtdAnexos} anexo(s)`}>
              <Paperclip size={13} aria-hidden="true" />
              <span>{qtdAnexos}</span>
            </span>
          ) : null}
          {totalChecklist > 0 ? (
            <span className="cartao-board-card__meta-item" title="Checklist">
              <CheckSquare size={13} aria-hidden="true" />
              <span>{totalChecklist - pendentesChecklist}/{totalChecklist}</span>
            </span>
          ) : pendentesChecklist > 0 ? (
            <span className="cartao-board-card__meta-item" title="Checklist">
              <CheckSquare size={13} aria-hidden="true" />
              <span>{pendentesChecklist}</span>
            </span>
          ) : null}
          {cartao.prazoEm ? (
            <span
              className={[
                "cartao-board-card__meta-item",
                prazoEstaAtrasado(cartao.prazoEm) ? "cartao-board-card__meta-item--overdue" : "",
              ].filter(Boolean).join(" ")}
              title="Prazo"
            >
              <CalendarDays size={13} aria-hidden="true" />
              <time dateTime={cartao.prazoEm}>{formatarPrazoExibicao(cartao.prazoEm)}</time>
            </span>
          ) : null}
          {pendentesChecklist > 0 ? (
            <span className="cartao-board-card__check-hint">
              {pendentesChecklist} pend.
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
