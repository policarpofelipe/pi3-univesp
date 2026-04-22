import React from "react";
import { CheckCircle2, ClipboardCheck, Inbox, PlayCircle } from "lucide-react";

function getListVisual(nome = "", cor = null) {
  if (cor) {
    return { accent: cor, Icon: ClipboardCheck };
  }
  const n = String(nome || "").toLowerCase();
  if (n.includes("entrada")) return { accent: "#6c757d", Icon: Inbox };
  if (n.includes("fazendo") || n.includes("andamento")) {
    return { accent: "#007bff", Icon: PlayCircle };
  }
  if (n.includes("revis")) return { accent: "#fd7e14", Icon: ClipboardCheck };
  if (n.includes("feito") || n.includes("conclu")) {
    return { accent: "#28a745", Icon: CheckCircle2 };
  }
  return { accent: "#0079bf", Icon: ClipboardCheck };
}

export default function ListaHeader({
  nome,
  totalCartoes = 0,
  limiteWip = null,
  cor = null,
  actions = null,
  className = "",
  titleTag: TitleTag = "h4",
}) {
  const { accent, Icon } = getListVisual(nome, cor);

  return (
    <div
      style={{ "--lista-header-color": accent }}
      className={[
        "lista-header",
        "lista-header--colored",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="lista-header__main">
        <span className="lista-header__icon" aria-hidden="true">
          <Icon size={15} />
        </span>
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
