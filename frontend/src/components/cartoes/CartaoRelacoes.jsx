import { useCallback, useEffect, useState } from "react";
import { Link2 } from "lucide-react";
import cartaoRelacaoService from "../../services/cartaoRelacaoService";
import { extractList } from "../../utils/apiData";

export default function CartaoRelacoes({ quadroId, cartaoId }) {
  const [loading, setLoading] = useState(true);
  const [relacoes, setRelacoes] = useState([]);

  const carregar = useCallback(async () => {
    if (!quadroId || !cartaoId) return;
    setLoading(true);
    try {
      const res = await cartaoRelacaoService.listar(quadroId, cartaoId);
      setRelacoes(extractList(res));
    } finally {
      setLoading(false);
    }
  }, [quadroId, cartaoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <section className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-xs)]">
      <div className="mb-3 flex items-center gap-2">
        <Link2 size={18} />
        <h2 className="text-[var(--font-size-heading-4)] font-semibold text-[var(--color-text)]">
          Relações
        </h2>
      </div>

      {loading ? (
        <p className="text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
          Carregando relações…
        </p>
      ) : relacoes.length === 0 ? (
        <p className="text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
          Nenhuma relação cadastrada para este cartão.
        </p>
      ) : (
        <ul className="space-y-2">
          {relacoes.map((relacao) => (
            <li
              key={relacao.id}
              className="rounded-lg border border-[var(--color-border)] p-2 text-[var(--font-size-sm)] text-[var(--color-text)]"
            >
              {relacao.tipo || "Relacionado a"}: cartão #{relacao.cartaoRelacionadoId}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
