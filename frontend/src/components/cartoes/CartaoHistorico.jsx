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
      className="card-section"
      aria-labelledby="cartao-historico-titulo"
    >
      <div className="card-section__header">
        <div className="card-section__title">
        <History
          size={16}
          aria-hidden="true"
        />
        <h2 id="cartao-historico-titulo">Histórico</h2>
        </div>
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
        <ol className="cartao-historico__list">
          {itens.map((e) => (
            <li key={e.id} className="cartao-historico__item">
              <p className="cartao-historico__text">{e.descricao}</p>
              <p className="cartao-historico__meta">
                <span className="cartao-historico__author">{e.autorNome}</span>
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
