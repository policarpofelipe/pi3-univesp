import React from "react";
import clsx from "clsx";

export default function PageHeader({
  title,
  subtitle = null,
  description = null,
  actions = null,
  breadcrumbs = null,
  as: HeadingTag = "h1",
  className = "",
}) {
  if (!title || typeof title !== "string") {
    throw new Error("PageHeader requires a non-empty 'title' prop.");
  }

  return (
    <header
      className={clsx(
        "flex flex-col gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 md:px-6 md:py-5",
        className
      )}
    >
      {breadcrumbs ? (
        <div className="min-w-0">
          {breadcrumbs}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <HeadingTag className="text-[var(--font-size-heading-1)] font-semibold tracking-tight text-[var(--color-text)]">
            {title}
          </HeadingTag>

          {subtitle ? (
            <p className="mt-1 text-[var(--font-size-md)] font-medium text-[var(--color-text-muted)]">
              {subtitle}
            </p>
          ) : null}

          {description ? (
            <p className="mt-2 max-w-3xl text-[var(--font-size-sm)] leading-6 text-[var(--color-text-muted)]">
              {description}
            </p>
          ) : null}
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}