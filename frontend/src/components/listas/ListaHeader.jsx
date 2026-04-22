import React from "react";

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
        "lista-header",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="lista-header__main">
        <TitleTag className="lista-header__title">{nome}</TitleTag>
        <span className="lista-header__meta">
          ({totalCartoes ?? 0} cartões
          {limiteWip ? ` / Limite ${limiteWip}` : ""})
        </span>
      </div>
      {actions ? (
        <div className="lista-header__actions">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
