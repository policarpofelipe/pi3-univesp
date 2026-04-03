import React from "react";
import { ChevronRight } from "lucide-react";
import clsx from "clsx";

/*
items esperado:
[
  { label: "Organizações", href: "/organizacoes" },
  { label: "Quadro Produto", href: "/quadros/1" },
  { label: "Cartão #32" }
]

Regras:
- último item representa a página atual
- href é opcional
- não renderiza links quebrados
*/

export default function Breadcrumb({
  items = [],
  separator = <ChevronRight className="h-4 w-4" aria-hidden="true" />,
  className = "",
}) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={clsx("w-full", className)}
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[var(--font-size-sm)]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          if (!item || typeof item.label !== "string" || item.label.trim() === "") {
            return null;
          }

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex min-w-0 items-center gap-2"
            >
              {index > 0 && (
                <span className="text-[var(--color-text-soft)]" aria-hidden="true">
                  {separator}
                </span>
              )}

              {isLast ? (
                <span
                  aria-current="page"
                  className="max-w-[20rem] truncate font-medium text-[var(--color-text)]"
                  title={item.label}
                >
                  {item.label}
                </span>
              ) : item.href ? (
                <a
                  href={item.href}
                  className={clsx(
                    "max-w-[16rem] truncate rounded-sm text-[var(--color-text-muted)] transition-colors duration-150",
                    "hover:text-[var(--color-primary)]",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2"
                  )}
                  title={item.label}
                >
                  {item.label}
                </a>
              ) : (
                <span
                  className="max-w-[16rem] truncate text-[var(--color-text-muted)]"
                  title={item.label}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}