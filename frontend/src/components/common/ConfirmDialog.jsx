import Button from "../ui/Button";

export default function ConfirmDialog({
  open = false,
  title = "Confirmar ação",
  description = "Deseja continuar?",
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1300] flex items-center justify-center bg-[var(--color-scrim)] p-4"
      role="presentation"
      onClick={() => !loading && onCancel?.()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-lg)]"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-[var(--font-size-heading-3)] font-semibold text-[var(--color-text)]">
          {title}
        </h2>
        <p className="mt-2 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
          {description}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" disabled={loading} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" variant="primary" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
