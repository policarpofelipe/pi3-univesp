import React, { useMemo } from "react";
import CartaoForm from "./CartaoForm";

export default function CartaoModal({
  open = false,
  modo = "criar",
  listas = [],
  listaIdFixo = "",
  cartaoEmEdicao = null,
  loading = false,
  onClose,
  onSubmit,
}) {
  const initialValues = useMemo(() => {
    if (!cartaoEmEdicao) {
      return {};
    }
    return {
      titulo: cartaoEmEdicao.titulo,
      descricao: cartaoEmEdicao.descricao,
      listaId: cartaoEmEdicao.listaId,
    };
  }, [cartaoEmEdicao]);

  if (!open) {
    return null;
  }

  const tituloModal = modo === "criar" ? "Novo cartão" : "Editar cartão";

  function handleFechar() {
    if (!loading) {
      onClose?.();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[1300] flex items-center justify-center bg-[var(--color-scrim)] p-4"
      role="presentation"
      onClick={handleFechar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cartao-modal-titulo"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="cartao-modal-titulo"
          className="text-[var(--font-size-heading-3)] font-semibold text-[var(--color-text)]"
        >
          {tituloModal}
        </h2>
        <div className="mt-4">
          <CartaoForm
            modo={modo}
            listas={listas}
            listaIdFixo={listaIdFixo}
            initialValues={initialValues}
            loading={loading}
            onCancel={handleFechar}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>
  );
}
