import React from "react";
import clsx from "clsx";
import "../../styles/components/page-header.css";

export default function PageHeader({
  title,
  description = "",
  actions = null,
  align = "default",
  className = "",
}) {
  return (
    <header
      className={clsx(
        "page-header",
        `page-header--${align}`,
        className
      )}
    >
      <div className="page-header__content">
        {title ? <h1 className="page-header__title">{title}</h1> : null}

        {description ? (
          <p className="page-header__description">{description}</p>
        ) : null}
      </div>

      {actions ? (
        <div className="page-header__actions">
          {actions}
        </div>
      ) : null}
    </header>
  );
}