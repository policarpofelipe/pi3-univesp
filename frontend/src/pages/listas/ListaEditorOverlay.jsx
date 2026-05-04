import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

import CartaoDetalheDialog from "../../components/cartoes/CartaoDetalheDialog";
import ListaEditorSurface from "../../components/listas/ListaEditorSurface";

import "../../styles/components/cartao-detalhe-content.css";
import "../../styles/pages/consultas-dialog.css";

/**
 * Modal criar/editar lista (mesmo padrão do cartão: rota com state.background).
 */
export default function ListaEditorOverlay({ modo = "criar" }) {
  const navigate = useNavigate();
  const handleClose = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const titulo = modo === "criar" ? "Nova lista" : "Editar lista";
  const titleId =
    modo === "criar" ? "lista-editor-modal-nova-title" : "lista-editor-modal-editar-title";

  return (
    <CartaoDetalheDialog
      onClose={handleClose}
      ariaLabelledBy={titleId}
      ariaLabel={titulo}
    >
      <div className="consultas-dialog-root">
        <header className="cartao-modal-header">
          <button
            type="button"
            className="cartao-modal-header__close-btn"
            onClick={handleClose}
            aria-label="Fechar"
          >
            <X size={18} aria-hidden="true" focusable="false" />
          </button>
          <div className="cartao-modal-header__title-wrap">
            <h1
              id={titleId}
              className="truncate text-[var(--font-size-xl)] font-semibold text-[var(--color-text)]"
            >
              {titulo}
            </h1>
          </div>
          <span aria-hidden="true" />
        </header>
        <div className="consultas-dialog-root__scroll">
          <ListaEditorSurface modo={modo} onCancel={handleClose} onSaved={handleClose} />
        </div>
      </div>
    </CartaoDetalheDialog>
  );
}
