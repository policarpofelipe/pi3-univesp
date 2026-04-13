export default function ExecucaoAutomacaoList({ automacoes = [] }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <h3 className="mb-2 text-[var(--font-size-sm)] font-semibold text-[var(--color-text)]">
        Execuções recentes (resumo)
      </h3>
      <p className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
        Total de automações ativas: {automacoes.filter((item) => item.ativo).length}
      </p>
      <p className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
        Histórico detalhado de execuções será incorporado em etapa futura.
      </p>
    </div>
  );
}
