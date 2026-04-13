import Button from "../ui/Button";

export default function AutomacaoList({ automacoes = [], onEditar, onRemover }) {
  return (
    <div className="space-y-2">
      {automacoes.map((automacao) => (
        <article
          key={automacao.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] p-3"
        >
          <div>
            <strong className="block text-[var(--font-size-sm)] text-[var(--color-text)]">
              {automacao.nome}
            </strong>
            <span className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
              Gatilho: {automacao.gatilho} | {automacao.ativo ? "Ativa" : "Inativa"}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => onEditar?.(automacao)}>
              Editar
            </Button>
            <Button variant="ghost" onClick={() => onRemover?.(automacao)}>
              Remover
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
