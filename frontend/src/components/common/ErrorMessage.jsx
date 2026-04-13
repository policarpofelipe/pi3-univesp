export default function ErrorMessage({
  message = "Ocorreu um erro.",
  role = "alert",
}) {
  return (
    <p
      role={role}
      className="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-surface)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-danger-text)]"
    >
      {message}
    </p>
  );
}
