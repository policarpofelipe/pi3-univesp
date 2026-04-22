import React from "react";

export default function CartaoSidebar({ children }) {
  return (
    <aside className="cartao-modal-layout__sidebar" aria-label="Controles do cartão">
      {children}
    </aside>
  );
}
