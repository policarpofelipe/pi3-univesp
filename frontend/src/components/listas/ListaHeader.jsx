import React from "react";
import { CheckCircle2, ClipboardCheck, Inbox, PlayCircle } from "lucide-react";

function getListVisual(nome = "", cor = null) {
  if (cor) {
    return { accent: cor, Icon: ClipboardCheck };
  }
  const n = String(nome || "").toLowerCase();
  if (n.includes("entrada")) return { accent: "var(--color-text-soft)", Icon: Inbox };
  if (n.includes("fazendo") || n.includes("andamento")) {
    return { accent: "var(--color-primary)", Icon: PlayCircle };
  }
  if (n.includes("revis")) return { accent: "var(--color-warning)", Icon: ClipboardCheck };
  if (n.includes("feito") || n.includes("conclu")) {
    return { accent: "var(--color-success)", Icon: CheckCircle2 };
  }
  return { accent: "var(--color-primary)", Icon: ClipboardCheck };
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
        <span className="lista-header__count" aria-label="Quantidade de cartões na lista">
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
