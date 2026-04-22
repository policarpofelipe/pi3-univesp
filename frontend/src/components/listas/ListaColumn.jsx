import React, { useEffect, useId, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";

import Button from "../ui/Button";
import ListaHeader from "./ListaHeader";

/**
 * Coluna Kanban: cabeçalho, área de cartões e menu de ações da lista.
 */
export default function ListaColumn({
  lista,
  children = null,
  className = "",
  boardMenu = null,
}) {
  const [menuAberto, setMenuAberto] = useState(false);
  const menuWrapRef = useRef(null);
  const botaoMenuRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!menuAberto) return undefined;
    function handlePointerDown(event) {
      const root = menuWrapRef.current;
      if (!root || root.contains(event.target)) return;
      setMenuAberto(false);
    }
    function handleEscape(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuAberto(false);
        botaoMenuRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuAberto]);

  if (!lista) {
    return null;
  }

  const {
    onEditar,
    onExcluir,
    onMoverEsquerda,
    onMoverDireita,
    podeMoverEsquerda = false,
    podeMoverDireita = false,
  } = boardMenu || {};

  const temMenu =
    boardMenu &&
    (typeof onEditar === "function" ||
      typeof onExcluir === "function" ||
      typeof onMoverEsquerda === "function" ||
      typeof onMoverDireita === "function");

  function fecharMenuEFocarBotao() {
    setMenuAberto(false);
    botaoMenuRef.current?.focus();
  }

  function runItem(fn) {
    if (typeof fn !== "function") return;
    fn();
    fecharMenuEFocarBotao();
  }

  return (
    <section className={["lista-column", className].filter(Boolean).join(" ")}>
      <div className="lista-column__header-shell">
        <ListaHeader
          nome={lista.nome}
          totalCartoes={lista.totalCartoes}
          limiteWip={lista.limiteWip}
          titleTag="h2"
          className="border-none pb-0"
          actions={
          temMenu ? (
            <div className="lista-column__menu-wrap" ref={menuWrapRef}>
              <Button
                ref={botaoMenuRef}
                type="button"
                variant="ghost"
                size="sm"
                className="lista-column__menu-trigger"
                aria-haspopup="true"
                aria-expanded={menuAberto}
                aria-controls={menuId}
                onClick={() => setMenuAberto((v) => !v)}
                aria-label={`Ações da lista ${lista.nome}`}
                title="Ações da lista"
              >
                <MoreHorizontal size={16} aria-hidden="true" />
              </Button>
              {menuAberto ? (
                <div
                  id={menuId}
                  role="menu"
                  aria-label={`Ações da lista ${lista.nome}`}
                  className="lista-column__menu"
                >
                  {typeof onMoverEsquerda === "function" ? (
                    <Button
                      type="button"
                      role="menuitem"
                      variant="ghost"
                      size="sm"
                      className="lista-column__menu-item"
                      disabled={!podeMoverEsquerda}
                      onClick={() => runItem(onMoverEsquerda)}
                    >
                      Mover para a esquerda
                    </Button>
                  ) : null}
                  {typeof onMoverDireita === "function" ? (
                    <Button
                      type="button"
                      role="menuitem"
                      variant="ghost"
                      size="sm"
                      className="lista-column__menu-item"
                      disabled={!podeMoverDireita}
                      onClick={() => runItem(onMoverDireita)}
                    >
                      Mover para a direita
                    </Button>
                  ) : null}
                  {typeof onEditar === "function" ? (
                    <Button
                      type="button"
                      role="menuitem"
                      variant="ghost"
                      size="sm"
                      className="lista-column__menu-item"
                      onClick={() => runItem(onEditar)}
                    >
                      Editar lista
                    </Button>
                  ) : null}
                  {typeof onExcluir === "function" ? (
                    <Button
                      type="button"
                      role="menuitem"
                      variant="ghost"
                      size="sm"
                      className="lista-column__menu-item"
                      onClick={() => runItem(onExcluir)}
                    >
                      Excluir lista
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null
        }
        />
      </div>

      {lista.descricao ? (
        <p className="lista-column__descricao">{lista.descricao}</p>
      ) : null}

      <div className="lista-column__body">{children}</div>
    </section>
  );
}
