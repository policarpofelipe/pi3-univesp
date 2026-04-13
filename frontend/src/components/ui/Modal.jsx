import Button from "./Button";

export default function Modal({
  open = false,
  title,
  children,
  onClose,
  closeLabel = "Fechar",
  footer = null,
  closeOnBackdrop = true,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1300] flex items-center justify-center bg-[var(--color-scrim)] p-4"
      role="presentation"
      onClick={() => closeOnBackdrop && onClose?.()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-lg)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-[var(--font-size-heading-3)] font-semibold text-[var(--color-text)]">
            {title}
          </h2>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {closeLabel}
          </Button>
        </div>
        <div>{children}</div>
        {footer ? <div className="mt-4">{footer}</div> : null}
      </div>
    </div>
  );
}
