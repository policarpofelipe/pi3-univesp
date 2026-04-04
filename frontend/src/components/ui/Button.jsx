import React from "react";
import clsx from "clsx";
import "../../styles/components/button.css";

function Spinner() {
  return <span className="button__spinner" aria-hidden="true" />;
}

export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = "",
  onClick,
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={clsx(
        "button",
        `button--${variant}`,
        `button--${size}`,
        fullWidth && "button--full-width",
        loading && "button--loading",
        className
      )}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      <span className="button__content">
        {loading ? (
          <Spinner />
        ) : leftIcon ? (
          <span className="button__icon button__icon--left" aria-hidden="true">
            {leftIcon}
          </span>
        ) : null}

        <span className="button__label">{children}</span>

        {!loading && rightIcon ? (
          <span className="button__icon button__icon--right" aria-hidden="true">
            {rightIcon}
          </span>
        ) : null}
      </span>
    </button>
  );
}