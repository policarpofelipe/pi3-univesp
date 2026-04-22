import React, { useCallback, useEffect, useRef } from "react";
import "../../styles/components/cartao-detalhe-dialog.css";

const FOCUSABLE_SELECTOR = [
  "a[href]:not([tabindex='-1'])",
  "button:not([disabled]):not([tabindex='-1'])",
  "input:not([disabled]):not([tabindex='-1'])",
  "select:not([disabled]):not([tabindex='-1'])",
  "textarea:not([disabled]):not([tabindex='-1'])",
  "[tabindex]:not([tabindex='-1']):not([tabindex='0'])",
].join(", ");

function getFocusableElements(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (el) =>
      el.offsetParent !== null ||
      (el.getClientRects && el.getClientRects().length > 0)
  );
}

/**
 * Modal grande e acessível para detalhe do cartão sobre o quadro.
 * — ESC fecha (listener em captura); backdrop não fecha.
 * — Armadilha de foco simples (Tab / Shift+Tab).
 */
export default function CartaoDetalheDialog({
  open = true,
  ariaLabel = "",
  ariaLabelledBy = "",
  onClose,
  dismissDisabled = false,
  children,
}) {
  const panelRef = useRef(null);

  const handleKeyDown = useCallback(
    (event) => {
      if (!open || dismissDisabled) return;
      if (event.key !== "Tab" || !panelRef.current) return;

      const nodes = getFocusableElements(panelRef.current);
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || !panelRef.current.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [open, dismissDisabled, onClose]
  );

  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open || dismissDisabled) return undefined;
    function onDocKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
      }
    }
    document.addEventListener("keydown", onDocKeyDown, true);
    return () => document.removeEventListener("keydown", onDocKeyDown, true);
  }, [open, dismissDisabled, onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const t = window.setTimeout(() => {
      const panel = panelRef.current;
      const nodes = getFocusableElements(panel);
      if (nodes[0]) {
        nodes[0].focus();
      } else {
        panel?.focus();
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="cartao-detalhe-dialog__scrim"
      role="presentation"
      aria-hidden="true"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || undefined}
        aria-labelledby={ariaLabelledBy || undefined}
        tabIndex={-1}
        className="cartao-detalhe-dialog__panel"
        onKeyDown={handleKeyDown}
      >
        <div className="cartao-detalhe-dialog__body">{children}</div>
      </div>
    </div>
  );
}
