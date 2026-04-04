import React from "react";
import clsx from "clsx";

const VARIANTS = {
  primary: "bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:opacity-90",
  secondary: "bg-[var(--color-secondary)] text-[var(--color-on-secondary)] hover:opacity-90",
  ghost: "bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]",
  danger: "bg-[var(--color-danger)] text-[var(--color-on-danger)] hover:opacity-90",
};

const SIZES = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export default function IconButton({
  icon,
  label,
  variant = "ghost",
  size = "md",
  type = "button",
  disabled = false,
  loading = false,
  onClick,
  className,
  ...props
}) {
  if (!label || typeof label !== "string") {
    throw new Error("IconButton requires a non-empty 'label' prop for accessibility.");
  }

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      aria-label={label}
      aria-disabled={isDisabled}
      aria-busy={loading}
      title={label}
      className={clsx(
        "inline-flex items-center justify-center rounded-lg",
        "transition-all duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "select-none shrink-0",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
          <span className="sr-only">Carregando</span>
        </>
      ) : (
        <span aria-hidden="true" className="flex items-center justify-center">
          {icon}
        </span>
      )}
    </button>
  );
}