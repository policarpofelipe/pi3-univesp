import React, { useEffect, useId, useRef, useState } from "react";
import {
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Archive,
  ListTree,
} from "lucide-react";
import Button from "../ui/Button";

/**
 * Menu de ações do cartão no quadro (acessível por teclado e leitor de tela).
 */
export default function CartaoCardMenu({
  cartaoTitulo = "",
  quadroId = "",
  cartaoId = "",
  listas = [],
  onEditar,
  onArquivar,
  onMoverParaLista,
  movendo = false,
}) {
  const [aberto, setAberto] = useState(false);
  const wrapRef = useRef(null);
  const botaoRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!aberto) return undefined;
    function handlePointerDown(event) {
      if (!wrapRef.current || wrapRef.current.contains(event.target)) return;
      setAberto(false);
    }
    function handleEscape(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        setAberto(false);
        botaoRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [aberto]);

  function fechar() {
    setAberto(false);
    botaoRef.current?.focus();
  }

  function run(fn) {
    if (typeof fn !== "function") return;
    fn();
    fechar();
  }

  const detalhesHref =
    quadroId && cartaoId ? `/quadros/${quadroId}/cartoes/${cartaoId}` : "";

  return (
    <div className="cartao-card-menu" ref={wrapRef}>
      <Button
        ref={botaoRef}
        type="button"
        variant="ghost"
        size="sm"
        className="cartao-card-menu__trigger"
        aria-haspopup="true"
        aria-expanded={aberto}
        aria-controls={menuId}
        aria-label={`Mais ações para o cartão ${cartaoTitulo}`}
        onClick={() => setAberto((v) => !v)}
        leftIcon={<MoreHorizontal size={16} aria-hidden="true" />}
      />

      {aberto ? (
        <div
          id={menuId}
          role="menu"
          aria-label={`Ações do cartão ${cartaoTitulo}`}
          className="cartao-card-menu__panel"
        >
          {detalhesHref ? (
            <a
              role="menuitem"
              href={detalhesHref}
              className="cartao-card-menu__link"
              onClick={() => fechar()}
            >
              <ExternalLink size={14} aria-hidden="true" />
              Abrir detalhes
            </a>
          ) : null}
          {typeof onEditar === "function" ? (
            <Button
              type="button"
              role="menuitem"
              variant="ghost"
              size="sm"
              className="cartao-card-menu__item"
              leftIcon={<Pencil size={14} aria-hidden="true" />}
              onClick={() => run(onEditar)}
            >
              Editar
            </Button>
          ) : null}
          {listas.length > 1 && typeof onMoverParaLista === "function" ? (
            <div
              className="cartao-card-menu__sub"
              role="group"
              aria-label="Mover para outra lista"
            >
              <span className="cartao-card-menu__sub-label" id={`${menuId}-mover`}>
                <ListTree size={14} aria-hidden="true" />
                Mover para
              </span>
              <div className="cartao-card-menu__sub-list">
                {listas.map((l) => (
                  <Button
                    key={l.id}
                    type="button"
                    role="menuitem"
                    variant="ghost"
                    size="sm"
                    className="cartao-card-menu__item cartao-card-menu__item--nest"
                    disabled={movendo}
                    onClick={() => run(() => onMoverParaLista(l.id))}
                  >
                    {l.nome}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}
          {typeof onArquivar === "function" ? (
            <Button
              type="button"
              role="menuitem"
              variant="ghost"
              size="sm"
              className="cartao-card-menu__item cartao-card-menu__item--danger"
              leftIcon={<Archive size={14} aria-hidden="true" />}
              onClick={() => run(onArquivar)}
            >
              Arquivar cartão
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
