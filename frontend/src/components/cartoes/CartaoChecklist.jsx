import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ListChecks, Plus, Trash2 } from "lucide-react";

import Button from "../ui/Button";
import CartaoChecklistItem from "./CartaoChecklistItem";
import cartaoChecklistService from "../../services/cartaoChecklistService";
import { extractList, extractObject } from "../../utils/apiData";

function BlocoChecklist({
  checklist,
  quadroId,
  cartaoId,
  onChanged,
  pedirFocoTitulo = false,
  onFocoTituloConsumido,
}) {
  const tituloInputRef = useRef(null);
  const blocoRef = useRef(null);
  const [titulo, setTitulo] = useState(checklist.titulo || "");
  const [novoItem, setNovoItem] = useState("");
  const [salvandoTitulo, setSalvandoTitulo] = useState(false);
  const [adicionando, setAdicionando] = useState(false);
  const [removendoLista, setRemovendoLista] = useState(false);
  const [expandido, setExpandido] = useState(true);

  useEffect(() => {
    setTitulo(checklist.titulo || "");
  }, [checklist.id, checklist.titulo]);

  useLayoutEffect(() => {
    if (!pedirFocoTitulo) return undefined;

    const run = () => {
      blocoRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
      window.requestAnimationFrame(() => {
        const el = tituloInputRef.current;
        if (el) {
          el.focus({ preventScroll: true });
          el.select?.();
        }
        onFocoTituloConsumido?.();
      });
    };

    const t = window.setTimeout(run, 0);
    return () => window.clearTimeout(t);
  }, [pedirFocoTitulo, onFocoTituloConsumido]);

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
    <div
      ref={blocoRef}
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-4 cartao-checklist__block"
    >
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
          ref={tituloInputRef}
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

const CartaoChecklist = forwardRef(function CartaoChecklist(
  { quadroId, cartaoId, esconderBotaoNova = false, onMetadadosChange, embedded = false },
  ref
) {
  const [listas, setListas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [criando, setCriando] = useState(false);
  const [checklistIdParaFocarTitulo, setChecklistIdParaFocarTitulo] =
    useState(null);

  const consumirFocoTitulo = useCallback(() => {
    setChecklistIdParaFocarTitulo(null);
  }, []);

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

  useEffect(() => {
    onMetadadosChange?.({ total: listas.length, loading });
  }, [listas.length, loading, onMetadadosChange]);

  const novaChecklist = useCallback(async () => {
    setCriando(true);
    try {
      const res = await cartaoChecklistService.criarChecklist(quadroId, cartaoId, {});
      const criada = extractObject(res);
      const novoId = criada?.id ?? criada?.checklistId;
      await carregar();
      if (novoId != null) {
        setChecklistIdParaFocarTitulo(novoId);
      }
    } catch {
      await carregar();
    } finally {
      setCriando(false);
    }
  }, [quadroId, cartaoId, carregar]);

  useImperativeHandle(
    ref,
    () => ({
      criarNovaChecklist: novaChecklist,
    }),
    [novaChecklist]
  );

  const corpo =
    loading ? (
      <p className="mt-4 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
        Carregando checklists…
      </p>
    ) : listas.length === 0 ? (
      <p className="mt-4 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
        {embedded
          ? 'Nenhuma checklist. Use "Nova checklist" na barra lateral para começar.'
          : 'Nenhuma checklist. Use "Nova checklist" para começar.'}
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
            pedirFocoTitulo={
              checklistIdParaFocarTitulo != null &&
              String(checklistIdParaFocarTitulo) === String(cl.id)
            }
            onFocoTituloConsumido={consumirFocoTitulo}
          />
        ))}
      </div>
    );

  if (embedded) {
    return corpo;
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
        {!esconderBotaoNova ? (
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
        ) : null}
      </div>

      {corpo}
    </section>
  );
});

export default CartaoChecklist;
