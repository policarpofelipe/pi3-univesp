import React from "react";

export default function ListaHeader({
  nome,
  totalCartoes = 0,
  limiteWip = null,
  cor = null,
  actions = null,
  className = "",
  titleTag: TitleTag = "h4",
}) {
  return (
    <div
      style={cor ? { "--lista-header-color": cor } : undefined}
      className={[
        "lista-header",
        cor ? "lista-header--colored" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="lista-header__main">
        <TitleTag className="lista-header__title">{nome}</TitleTag>
        <span className="lista-header__meta">
          ({totalCartoes ?? 0}
          {limiteWip ? `/${limiteWip}` : ""})
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
