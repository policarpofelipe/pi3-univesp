import React, { useMemo } from "react";
import ListaForm from "./ListaForm";

export default function ListaModal({
  open = false,
  modo = "criar",
  listaEmEdicao = null,
  loading = false,
  onClose,
  onSubmit,
}) {
  const initialValues = useMemo(() => {
    if (!listaEmEdicao) {
      return {};
    }
    return {
      nome: listaEmEdicao.nome,
      descricao: listaEmEdicao.descricao,
      limiteWip: listaEmEdicao.limiteWip,
      cor: listaEmEdicao.cor,
    };
  }, [listaEmEdicao]);

  if (!open) {
    return null;
  }

  const tituloModal = modo === "criar" ? "Nova lista" : "Editar lista";

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
        aria-labelledby="lista-modal-titulo"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)]"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id="lista-modal-titulo"
          className="text-[var(--font-size-heading-3)] font-semibold text-[var(--color-text)]"
        >
          {tituloModal}
        </h2>
        <div className="mt-4">
          <ListaForm
            modo={modo}
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
