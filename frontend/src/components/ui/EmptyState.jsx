import React from "react";
import clsx from "clsx";
import "../../styles/components/empty-state.css";

export default function EmptyState({
  icon = null,
  title,
  description = "",
  action = null,
  align = "center",
  size = "md",
  className = "",
}) {
  return (
    <section
      className={clsx(
        "empty-state",
        `empty-state--${align}`,
        `empty-state--${size}`,
        className
      )}
      aria-live="polite"
    >
      {icon ? (
        <div className="empty-state__icon" aria-hidden="true">
          {icon}
        </div>
      ) : null}

      <div className="empty-state__content">
        {title ? <h2 className="empty-state__title">{title}</h2> : null}

        {description ? (
          <p className="empty-state__description">{description}</p>
        ) : null}
      </div>

      {action ? <div className="empty-state__action">{action}</div> : null}
    </section>
  );
}