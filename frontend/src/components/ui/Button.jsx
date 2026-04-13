import React from "react";
import clsx from "clsx";
import "../../styles/components/button.css";

function Spinner() {
  return <span className="button__spinner" aria-hidden="true" />;
}

const Button = React.forwardRef(function Button(
  {
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
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
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
});

export default Button;