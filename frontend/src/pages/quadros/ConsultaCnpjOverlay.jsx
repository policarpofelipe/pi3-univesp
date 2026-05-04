import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

import CartaoDetalheDialog from "../../components/cartoes/CartaoDetalheDialog";
import ConsultaCnpjContent from "../../components/consultas/ConsultaCnpjContent";

import "../../styles/components/cartao-detalhe-content.css";
import "../../styles/pages/consultas-dialog.css";

/**
 * Modal sobre o quadro (mesmo padrão do cartão: rota com state.background).
 */
export default function ConsultaCnpjOverlay() {
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <CartaoDetalheDialog
      onClose={handleClose}
      ariaLabelledBy="consulta-cnpj-modal-title"
      ariaLabel="Consultar CNPJ"
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
              id="consulta-cnpj-modal-title"
              className="truncate text-[var(--font-size-xl)] font-semibold text-[var(--color-text)]"
            >
              Consultar CNPJ
            </h1>
          </div>
          <span aria-hidden="true" />
        </header>
        <div className="consultas-dialog-root__scroll">
          <p className="consultas-dialog-root__intro">
            Informe um CNPJ para buscar dados públicos da empresa. Esta consulta usa
            serviços externos; os dados não são salvos no sistema.
          </p>
          <div className="consultas-page consultas-page--modal">
            <ConsultaCnpjContent onFecharAposCartaoCriado={handleClose} />
          </div>
        </div>
      </div>
    </CartaoDetalheDialog>
  );
}
