import React from "react";

export default function TagBadge({ nome = "", cor = "", className = "" }) {
  const n = String(nome || "").trim() || "Tag";
  return (
    <span
      className={[
        "cartao-tag-chip",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        "--tag-color": cor || "var(--color-primary)",
      }}
      title={n}
    >
      <span className="cartao-tag-chip__text">{n}</span>
    </span>
  );
}
