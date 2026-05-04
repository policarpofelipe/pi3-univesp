import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

import CartaoDetalheDialog from "../../components/cartoes/CartaoDetalheDialog";
import ConsultaEnderecoContent from "../../components/consultas/ConsultaEnderecoContent";

import "../../styles/components/cartao-detalhe-content.css";
import "../../styles/pages/consultas-dialog.css";

export default function ConsultaEnderecoOverlay() {
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <CartaoDetalheDialog
      onClose={handleClose}
      ariaLabelledBy="consulta-cep-modal-title"
      ariaLabel="Consultar endereço"
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
              id="consulta-cep-modal-title"
              className="truncate text-[var(--font-size-xl)] font-semibold text-[var(--color-text)]"
            >
              Consultar endereço
            </h1>
          </div>
          <span aria-hidden="true" />
        </header>
        <div className="consultas-dialog-root__scroll">
          <p className="consultas-dialog-root__intro">
            Informe um CEP para buscar endereço. Serviço externo gratuito; os dados não
            são salvos no sistema.
          </p>
          <div className="consultas-page consultas-page--modal">
            <ConsultaEnderecoContent onFecharAposCartaoCriado={handleClose} />
          </div>
        </div>
      </div>
    </CartaoDetalheDialog>
  );
}
