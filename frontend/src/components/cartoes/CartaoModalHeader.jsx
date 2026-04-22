import React, { useRef } from "react";
import { Hash, X } from "lucide-react";

export default function CartaoModalHeader({
  cartaoId,
  titulo,
  onChangeTitulo,
  onConfirmTitulo,
  onCancelTitulo,
  editandoTitulo = false,
  setEditandoTitulo,
  onClose,
  titleId = "cartao-modal-title",
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
      <button
        type="button"
        className="cartao-modal-header__close-btn"
        onClick={onClose}
        aria-label="Fechar"
      >
        <X size={18} aria-hidden="true" focusable="false" />
      </button>

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
            id={titleId}
          />
        ) : (
          <button
            type="button"
            className="cartao-modal-header__title-btn"
            onClick={ativarEdicao}
            id={titleId}
          >
            {titulo || "Sem título"}
          </button>
        )}
      </div>

      <span className="cartao-modal-header__id-badge">
        <Hash size={12} aria-hidden="true" focusable="false" />
        {cartaoId}
      </span>
    </header>
  );
}
