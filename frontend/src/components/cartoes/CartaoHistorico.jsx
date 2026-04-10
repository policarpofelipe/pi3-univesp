import React, { useCallback, useEffect, useState } from "react";
import { History } from "lucide-react";

import cartaoHistoricoService from "../../services/cartaoHistoricoService";
import { extractList } from "../../utils/apiData";

function formatarDataHora(iso) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function CartaoHistorico({
  quadroId,
  cartaoId,
  recarregarSignal = 0,
}) {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    if (!quadroId || !cartaoId) return;
    setLoading(true);
    try {
      const res = await cartaoHistoricoService.listar(quadroId, cartaoId);
      setItens(extractList(res));
    } catch {
      setItens([]);
    } finally {
      setLoading(false);
    }
  }, [quadroId, cartaoId]);

  useEffect(() => {
    carregar();
  }, [carregar, recarregarSignal]);

  return (
    <section
      className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-xs)]"
      aria-labelledby="cartao-historico-titulo"
    >
      <div className="flex items-center gap-2">
        <History
          size={20}
          className="text-[var(--color-text-muted)]"
          aria-hidden="true"
        />
        <h2
          id="cartao-historico-titulo"
          className="text-[var(--font-size-heading-3)] font-semibold text-[var(--color-text)]"
        >
          Histórico
        </h2>
      </div>

      {loading ? (
        <p className="mt-4 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
          Carregando histórico…
        </p>
      ) : itens.length === 0 ? (
        <p className="mt-4 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
          Nenhum evento registrado ainda.
        </p>
      ) : (
        <ol className="mt-4 flex flex-col gap-3 border-l-2 border-[var(--color-border)] pl-4">
          {itens.map((e) => (
            <li key={e.id} className="relative">
              <span
                className="absolute -left-[calc(0.5rem+3px)] top-1.5 h-2 w-2 rounded-full bg-[var(--color-text-soft)]"
                aria-hidden="true"
              />
              <p className="text-[var(--font-size-sm)] text-[var(--color-text)]">
                {e.descricao}
              </p>
              <p className="mt-0.5 text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
                <span className="font-medium text-[var(--color-text-soft)]">
                  {e.autorNome}
                </span>
                <span className="mx-1">·</span>
                <time dateTime={e.criadoEm}>{formatarDataHora(e.criadoEm)}</time>
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
