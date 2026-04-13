import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import CartaoDetalheDialog from "../../components/cartoes/CartaoDetalheDialog";
import CartaoDetalheContent from "../../components/cartoes/CartaoDetalheContent";
import { useCartaoOverlayReturnFocus } from "../../context/CartaoOverlayReturnFocusContext";

/**
 * Camada modal sobre o quadro quando a rota do cartão é aberta com state.background (fluxo kanban).
 */
export default function CartaoDetalheOverlay() {
  const navigate = useNavigate();
  const focusCtx = useCartaoOverlayReturnFocus();

  const handleClose = useCallback(() => {
    const el = focusCtx?.consumeReturnFocus?.();
    navigate(-1);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (el && typeof el.focus === "function") {
          el.focus();
        }
      });
    });
  }, [navigate, focusCtx]);

  return (
    <CartaoDetalheDialog onClose={handleClose} ariaLabel="Detalhes do cartão">
      <CartaoDetalheContent variant="modal" onRequestClose={handleClose} />
    </CartaoDetalheDialog>
  );
}
