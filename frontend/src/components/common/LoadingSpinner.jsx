export default function LoadingSpinner({ size = "md", label = "Carregando..." }) {
  const dimension = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-6 w-6";

  return (
    <span className="inline-flex items-center gap-2 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
      <span
        className={`${dimension} inline-block animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent`}
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  );
}
