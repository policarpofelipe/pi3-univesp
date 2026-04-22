import React, { useRef } from "react";
import { Hash, Trash2, X } from "lucide-react";
import Button from "../ui/Button";

export default function CartaoModalHeader({
  cartaoId,
  titulo,
  onChangeTitulo,
  onConfirmTitulo,
  onCancelTitulo,
  editandoTitulo = false,
  setEditandoTitulo,
  onClose,
  onExcluir,
  excluindo = false,
}) {
  const inputRef = useRef(null);

  function ativarEdicao() {
    setEditandoTitulo?.(true);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      onConfirmTitulo?.();
      setEditandoTitulo?.(false);
    } else if (event.key === "Escape") {
      event.preventDefault();
      onCancelTitulo?.();
      setEditandoTitulo?.(false);
    }
  }

  return (
    <header className="cartao-modal-header">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        leftIcon={<X size={16} />}
        onClick={onClose}
      >
        Fechar
      </Button>

      <div className="cartao-modal-header__title-wrap">
        {editandoTitulo ? (
          <input
            ref={inputRef}
            type="text"
            value={titulo}
            onChange={(event) => onChangeTitulo?.(event.target.value)}
            onBlur={() => {
              onConfirmTitulo?.();
              setEditandoTitulo?.(false);
            }}
            onKeyDown={handleKeyDown}
            className="cartao-modal-header__title-input"
            aria-label="Editar título do cartão"
          />
        ) : (
          <button
            type="button"
            className="cartao-modal-header__title-btn"
            onClick={ativarEdicao}
          >
            {titulo || "Sem título"}
          </button>
        )}

        <span className="cartao-modal-header__id-badge">
          <Hash size={12} />
          {cartaoId}
        </span>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        leftIcon={<Trash2 size={14} />}
        onClick={onExcluir}
        loading={excluindo}
        disabled={excluindo}
      >
        Excluir
      </Button>
    </header>
  );
}
