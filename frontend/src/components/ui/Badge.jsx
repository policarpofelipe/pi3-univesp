export default function Badge({ children, tone = "neutral", className = "" }) {
  const toneClass =
    tone === "success"
      ? "border-[var(--color-success-border)] bg-[var(--color-success-surface)] text-[var(--color-success-text)]"
      : tone === "warning"
      ? "border-[var(--color-warning-border)] bg-[var(--color-warning-surface)] text-[var(--color-warning-text)]"
      : tone === "danger"
      ? "border-[var(--color-danger-border)] bg-[var(--color-danger-surface)] text-[var(--color-danger-text)]"
      : "border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[var(--font-size-xs)] font-medium ${toneClass} ${className}`}
    >
      {children}
    </span>
  );
}
