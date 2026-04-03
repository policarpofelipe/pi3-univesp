import React from "react";
import clsx from "clsx";

/*
Princípios aplicados:
- Semântica correta (button vs link)
- Estados acessíveis (focus, disabled, aria)
- Contraste dependente de variáveis globais (tokens.css)
- Tamanho controlado por escala tipográfica global
- Evita cores hardcoded (usa CSS variables)
*/

const VARIANTS = {
  primary: "bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:opacity-90",
  secondary: "bg-[var(--color-secondary)] text-[var(--color-on-secondary)] hover:opacity-90",
  ghost: "bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]",
  danger: "bg-[var(--color-danger)] text-[var(--color-on-danger)] hover:opacity-90",
};

const SIZES = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-base",
  lg: "h-12 px-6 text-lg",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  onClick,
  className,
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg",
        "font-medium transition-all duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "select-none",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {/* Ícone esquerdo */}
      {leftIcon && (
        <span aria-hidden="true" className="flex items-center">
          {leftIcon}
        </span>
      )}

      {/* Loading substitui conteúdo */}
      {loading ? (
        <span className="flex items-center gap-2">
          <span
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
          <span className="sr-only">Carregando</span>
        </span>
      ) : (
        <span className="whitespace-nowrap">{children}</span>
      )}

      {/* Ícone direito */}
      {rightIcon && !loading && (
        <span aria-hidden="true" className="flex items-center">
          {rightIcon}
        </span>
      )}
    </button>
  );
}