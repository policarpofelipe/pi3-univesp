import React, { useEffect } from "react";
import Button from "./Button";

export default function Modal({
  open = false,
  title,
  children,
  onClose,
  closeLabel = "Fechar",
  footer = null,
  closeOnBackdrop = true,
  showHeaderCloseButton = true,
  dismissDisabled = false,
}) {
  useEffect(() => {
    if (!open || dismissDisabled) return;
    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, dismissDisabled]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1300] flex items-center justify-center bg-[var(--color-scrim)] p-4"
      role="presentation"
      onClick={() =>
        closeOnBackdrop && !dismissDisabled && onClose?.()
      }
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-lg)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          {title ? (
            <h2
              id="modal-title"
              className="min-w-0 flex-1 text-[var(--font-size-heading-3)] font-semibold text-[var(--color-text)]"
            >
              {title}
            </h2>
          ) : (
            <span className="flex-1" />
          )}
          {showHeaderCloseButton ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={dismissDisabled}
            >
              {closeLabel}
            </Button>
          ) : null}
        </div>
        <div className="modal__body">{children}</div>
        {footer ? <div className="mt-4">{footer}</div> : null}
      </div>
    </div>
  );
}
