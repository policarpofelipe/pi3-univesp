import React from "react";
import clsx from "clsx";

export default function ErrorState({
  title = "Ocorreu um erro",
  description = "Não foi possível concluir esta operação no momento.",
  icon = null,
  action = null,
  secondaryAction = null,
  compact = false,
  className = "",
}) {
  return (
    <section
      className={clsx(
        "w-full rounded-xl border border-[var(--color-danger-border)] bg-[var(--color-danger-surface)]",
        "text-center",
        compact ? "px-4 py-6" : "px-6 py-10 md:px-8 md:py-12",
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center">
        {icon ? (
          <div
            className={clsx(
              "mb-4 flex items-center justify-center rounded-full border border-[var(--color-danger-border)] bg-[var(--color-danger-surface-alt)] text-[var(--color-danger-text)]",
              compact ? "h-12 w-12" : "h-16 w-16"
            )}
            aria-hidden="true"
          >
            {icon}
          </div>
        ) : (
          <div
            className={clsx(
              "mb-4 flex items-center justify-center rounded-full border border-[var(--color-danger-border)] bg-[var(--color-danger-surface-alt)] text-[var(--color-danger-text)] font-bold",
              compact
                ? "h-12 w-12 text-[var(--font-size-lg)]"
                : "h-16 w-16 text-[var(--font-size-2xl)]"
            )}
            aria-hidden="true"
          >
            !
          </div>
        )}

        <h2
          className={clsx(
            "font-semibold tracking-tight text-[var(--color-danger-text)]",
            compact ? "text-[var(--font-size-lg)]" : "text-[var(--font-size-heading-2)]"
          )}
        >
          {title}
        </h2>

        {description ? (
          <p
            className={clsx(
              "mt-2 max-w-xl leading-6 text-[var(--color-danger-text-muted)]",
              compact ? "text-[var(--font-size-sm)]" : "text-[var(--font-size-md)]"
            )}
          >
            {description}
          </p>
        ) : null}

        {(action || secondaryAction) ? (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {action}
            {secondaryAction}
          </div>
        ) : null}
      </div>
    </section>
  );
}