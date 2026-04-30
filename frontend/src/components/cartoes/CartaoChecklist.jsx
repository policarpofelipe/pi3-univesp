import React, { useCallback, useEffect, useState } from "react";
import { ListChecks, Plus, Trash2 } from "lucide-react";

import Button from "../ui/Button";
import CartaoChecklistItem from "./CartaoChecklistItem";
import cartaoChecklistService from "../../services/cartaoChecklistService";
import { extractList } from "../../utils/apiData";

function BlocoChecklist({ checklist, quadroId, cartaoId, onChanged }) {
  const [titulo, setTitulo] = useState(checklist.titulo || "");
  const [novoItem, setNovoItem] = useState("");
  const [salvandoTitulo, setSalvandoTitulo] = useState(false);
  const [adicionando, setAdicionando] = useState(false);
  const [removendoLista, setRemovendoLista] = useState(false);
  const [expandido, setExpandido] = useState(true);

  useEffect(() => {
    setTitulo(checklist.titulo || "");
  }, [checklist.id, checklist.titulo]);

  async function salvarTituloLista() {
    const t = titulo.trim();
    if (!t || t === (checklist.titulo || "").trim()) return;
    setSalvandoTitulo(true);
    try {
      await cartaoChecklistService.atualizarChecklist(
        quadroId,
        cartaoId,
        checklist.id,
        { titulo: t }
      );
      await onChanged();
    } finally {
      setSalvandoTitulo(false);
    }
  }

  async function adicionarItem(event) {
    event.preventDefault();
    const t = novoItem.trim();
    if (!t || adicionando) return;
    setAdicionando(true);
    try {
      await cartaoChecklistService.criarItem(quadroId, cartaoId, checklist.id, {
        titulo: t,
      });
      setNovoItem("");
      await onChanged();
    } finally {
      setAdicionando(false);
    }
  }

  async function removerLista() {
    if (!window.confirm("Remover esta checklist e todos os itens?")) return;
    setRemovendoLista(true);
    try {
      await cartaoChecklistService.removerChecklist(
        quadroId,
        cartaoId,
        checklist.id
      );
      await onChanged();
    } finally {
      setRemovendoLista(false);
    }
  }

  const itens = Array.isArray(checklist.itens) ? checklist.itens : [];
  const total = itens.length;
  const concluidos = itens.filter((it) => Boolean(it.concluido)).length;
  const progresso = total > 0 ? Math.round((concluidos / total) * 100) : 0;

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-4 cartao-checklist__block">
      <div className="cartao-checklist__block-header">
        <button
          type="button"
          onClick={() => setExpandido((v) => !v)}
          className="cartao-checklist__collapse-btn"
          aria-expanded={expandido}
          aria-label={expandido ? "Recolher checklist" : "Expandir checklist"}
        >
          {expandido ? "▾" : "▸"}
        </button>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          onBlur={salvarTituloLista}
          disabled={salvandoTitulo}
          className="min-w-0 flex-1 rounded border border-transparent bg-transparent text-[var(--font-size-sm)] font-semibold text-[var(--color-text)] focus:border-[var(--input-border)] focus:outline-none"
          aria-label="Título da checklist"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          loading={removendoLista}
          disabled={removendoLista}
          leftIcon={<Trash2 size={14} />}
          onClick={removerLista}
          className="cartao-checklist__remove-btn"
        >
          Excluir checklist
        </Button>
      </div>
      <div className="cartao-checklist__progress">
        <span className="cartao-checklist__progress-label">
          {concluidos}/{total} itens
        </span>
        <div className="cartao-checklist__progress-track" aria-hidden="true">
          <span
            className="cartao-checklist__progress-fill"
            style={{ width: `${progresso}%` }}
          />
        </div>
      </div>

      {expandido ? (
        <>
          <ul className="cartao-checklist__list">
            {itens.map((it) => (
              <CartaoChecklistItem
                key={it.id}
                quadroId={quadroId}
                cartaoId={cartaoId}
                checklistId={checklist.id}
                item={it}
                onChanged={onChanged}
              />
            ))}
          </ul>

          <form className="cartao-checklist__new-form" onSubmit={adicionarItem}>
            <input
              type="text"
              value={novoItem}
              onChange={(e) => setNovoItem(e.target.value)}
              disabled={adicionando}
              placeholder="Adicionar item"
              className="cartao-checklist__new-input"
            />
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              loading={adicionando}
              disabled={!novoItem.trim()}
              leftIcon={<Plus size={14} />}
            >
              Adicionar
            </Button>
          </form>
        </>
      ) : null}
    </div>
  );
}

export default function CartaoChecklist({ quadroId, cartaoId }) {
  const [listas, setListas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [criando, setCriando] = useState(false);

  const carregar = useCallback(async () => {
    if (!quadroId || !cartaoId) return;
    setLoading(true);
    try {
      const res = await cartaoChecklistService.listar(quadroId, cartaoId);
      setListas(extractList(res));
    } catch {
      setListas([]);
    } finally {
      setLoading(false);
    }
  }, [quadroId, cartaoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function novaChecklist() {
    setCriando(true);
    try {
      await cartaoChecklistService.criarChecklist(quadroId, cartaoId, {});
      await carregar();
    } catch {
      await carregar();
    } finally {
      setCriando(false);
    }
  }

  return (
    <section
      className="card-section"
      aria-labelledby="cartao-checklists-titulo"
    >
      <div className="card-section__header">
        <div className="card-section__title">
          <ListChecks
            size={16}
            aria-hidden="true"
          />
          <h2 id="cartao-checklists-titulo">Checklists</h2>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={criando}
          leftIcon={<Plus size={14} />}
          onClick={novaChecklist}
        >
          Nova checklist
        </Button>
      </div>

      {loading ? (
        <p className="mt-4 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
          Carregando checklists…
        </p>
      ) : listas.length === 0 ? (
        <p className="mt-4 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
          Nenhuma checklist. Use &quot;Nova checklist&quot; para começar.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {listas.map((cl) => (
            <BlocoChecklist
              key={cl.id}
              checklist={cl}
              quadroId={quadroId}
              cartaoId={cartaoId}
              onChanged={carregar}
            />
          ))}
        </div>
      )}
    </section>
  );
}
