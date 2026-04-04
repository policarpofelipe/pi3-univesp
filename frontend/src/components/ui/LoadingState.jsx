import React from "react";
import clsx from "clsx";

export default function LoadingState({
  title = "Carregando",
  description = "Aguarde enquanto os dados são preparados.",
  compact = false,
  fullHeight = false,
  className = "",
}) {
  return (
    <section
      className={clsx(
        "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]",
        "flex flex-col items-center justify-center text-center",
        compact ? "px-4 py-6" : "px-6 py-10 md:px-8 md:py-12",
        fullHeight && "min-h-[320px]",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center">
        <div
          className={clsx(
            "mb-4 flex items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-alt)]",
            compact ? "h-12 w-12" : "h-16 w-16"
          )}
          aria-hidden="true"
        >
          <span
            className={clsx(
              "rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin",
              compact ? "h-5 w-5" : "h-7 w-7"
            )}
          />
        </div>

        <h2
          className={clsx(
            "font-semibold tracking-tight text-[var(--color-text)]",
            compact ? "text-[var(--font-size-lg)]" : "text-[var(--font-size-heading-2)]"
          )}
        >
          {title}
        </h2>

        {description ? (
          <p
            className={clsx(
              "mt-2 max-w-xl leading-6 text-[var(--color-text-muted)]",
              compact ? "text-[var(--font-size-sm)]" : "text-[var(--font-size-md)]"
            )}
          >
            {description}
          </p>
        ) : null}

        <span className="sr-only">{title}</span>
      </div>
    </section>
  );
}