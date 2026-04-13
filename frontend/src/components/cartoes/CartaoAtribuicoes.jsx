import { useCallback, useEffect, useMemo, useState } from "react";
import { UserPlus } from "lucide-react";
import Button from "../ui/Button";
import quadroMembroService from "../../services/quadroMembroService";
import cartaoAtribuicaoService from "../../services/cartaoAtribuicaoService";
import { extractList } from "../../utils/apiData";

export default function CartaoAtribuicoes({ quadroId, cartaoId }) {
  const [membros, setMembros] = useState([]);
  const [atribuicoes, setAtribuicoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    if (!quadroId || !cartaoId) return;
    setLoading(true);
    try {
      const [resMembros, resAtribuicoes] = await Promise.all([
        quadroMembroService.listar(quadroId).catch(() => ({ data: [] })),
        cartaoAtribuicaoService.listar(quadroId, cartaoId),
      ]);
      setMembros(extractList(resMembros));
      setAtribuicoes(extractList(resAtribuicoes));
    } finally {
      setLoading(false);
    }
  }, [quadroId, cartaoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const atribuicoesSet = useMemo(
    () =>
      new Set(
        atribuicoes.map((item) => String(item.membroId || item.usuarioId || item.id))
      ),
    [atribuicoes]
  );

  async function toggleMembro(membroId) {
    setSalvando(true);
    try {
      if (atribuicoesSet.has(String(membroId))) {
        await cartaoAtribuicaoService.remover(quadroId, cartaoId, membroId);
      } else {
        await cartaoAtribuicaoService.adicionar(quadroId, cartaoId, { membroId });
      }
      await carregar();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-xs)]">
      <div className="mb-3 flex items-center gap-2">
        <UserPlus size={18} />
        <h2 className="text-[var(--font-size-heading-4)] font-semibold text-[var(--color-text)]">
          Atribuições
        </h2>
      </div>

      {loading ? (
        <p className="text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
          Carregando atribuições…
        </p>
      ) : membros.length === 0 ? (
        <p className="text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
          Sem membros no quadro para atribuir.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {membros.map((membro) => {
            const active = atribuicoesSet.has(String(membro.id));
            return (
              <Button
                key={membro.id}
                variant={active ? "primary" : "secondary"}
                disabled={salvando}
                onClick={() => toggleMembro(membro.id)}
              >
                {membro.nome}
              </Button>
            );
          })}
        </div>
      )}
    </section>
  );
}
