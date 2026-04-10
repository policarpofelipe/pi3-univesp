import React from "react";

export default function TagBadge({ nome = "", cor = "#64748b", className = "" }) {
  const n = String(nome || "").trim() || "Tag";
  return (
    <span
      className={[
        "inline-flex max-w-full items-center rounded-full border px-2 py-0.5 text-[var(--font-size-xs)] font-medium",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        borderColor: cor,
        backgroundColor: `${cor}22`,
        color: cor,
      }}
      title={n}
    >
      <span className="truncate">{n}</span>
    </span>
  );
}
