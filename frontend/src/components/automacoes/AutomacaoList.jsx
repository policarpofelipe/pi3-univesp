import Button from "../ui/Button";

const GATILHO_LABELS = {
  AO_CRIAR_CARTAO: "Ao criar cartão",
  AO_ENTRAR_NA_LISTA: "Ao entrar na lista",
  AO_SAIR_DA_LISTA: "Ao sair da lista",
  AO_ATUALIZAR_CAMPO: "Ao atualizar campo",
  AO_VENCER_PRAZO: "Ao vencer prazo",
};

const ACAO_LABELS = {
  MOVER_CARTAO: "Mover cartão",
  ADICIONAR_TAG: "Adicionar tag",
};

export default function AutomacaoList({ automacoes = [], onEditar, onRemover }) {
  return (
    <div className="space-y-2">
      {automacoes.map((automacao) => (
        <article
          key={automacao.id}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <strong className="block text-[var(--font-size-sm)] text-[var(--color-text)]">
                {automacao.nome}
              </strong>
              <p className="mt-1 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
                {automacao.descricao?.trim() ||
                  `Regra para ${GATILHO_LABELS[automacao.gatilho] || automacao.gatilho}.`}
              </p>
              <p className="mt-1 text-[var(--font-size-xs)] text-[var(--color-text-soft)]">
                Gatilho: {GATILHO_LABELS[automacao.gatilho] || automacao.gatilho} | Ação:{" "}
                {ACAO_LABELS[automacao.acoes?.[0]?.tipoAcao] ||
                  automacao.acoes?.[0]?.tipoAcao ||
                  "Não definida"}{" "}
                | Status: {automacao.ativo ? "Ativa" : "Inativa"}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                variant="secondary"
                onClick={() => onEditar?.(automacao)}
                aria-label={`Editar automação ${automacao.nome}`}
              >
                Editar
              </Button>
              <Button
                variant="ghost"
                onClick={() => onRemover?.(automacao)}
                aria-label={`Remover automação ${automacao.nome}`}
              >
                Remover
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
