import React from "react";
import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import "../../styles/components/breadcrumb.css";

export default function Breadcrumb({
  items = [],
  className = "",
}) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={clsx("breadcrumb", className)}
    >
      <ol className="breadcrumb__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          if (!item || typeof item.label !== "string" || item.label.trim() === "") {
            return null;
          }

          return (
            <li key={`${item.label}-${index}`} className="breadcrumb__item">
              {index > 0 && (
                <span className="breadcrumb__separator" aria-hidden="true">
                  <ChevronRight size={16} />
                </span>
              )}

              {isLast ? (
                <span
                  aria-current="page"
                  className="breadcrumb__current"
                  title={item.label}
                >
                  {item.label}
                </span>
              ) : item.href ? (
                <a
                  href={item.href}
                  className="breadcrumb__link"
                  title={item.label}
                >
                  {item.label}
                </a>
              ) : (
                <span
                  className="breadcrumb__text"
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