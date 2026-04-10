import React from "react";

export default function CartaoDescricao({
  texto = "",
  vazio = "Nenhuma descrição.",
  variant = "compact",
  className = "",
}) {
  const t = String(texto ?? "").trim();

  if (variant === "compact") {
    if (!t) return null;
    return (
      <p
        className={[
          "mt-1 line-clamp-3 whitespace-pre-wrap text-[var(--font-size-xs)] text-[var(--color-text-muted)]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {t}
      </p>
    );
  }

  return (
    <section
      className={className}
      aria-label="Descrição do cartão"
    >
      <h3 className="text-[var(--font-size-sm)] font-medium text-[var(--color-text)]">
        Descrição
      </h3>
      <div className="mt-2 whitespace-pre-wrap text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
        {t || (
          <span className="text-[var(--color-text-soft)]">{vazio}</span>
        )}
      </div>
    </section>
  );
}
