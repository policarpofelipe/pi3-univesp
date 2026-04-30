import Button from "../ui/Button";
import "../../styles/components/automacao-list.css";

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
    <div className="automacao-list">
      {automacoes.map((automacao) => (
        <article key={automacao.id} className="automacao-list__item">
          <div className="automacao-list__row">
            <div className="automacao-list__main">
              <strong className="automacao-list__title">
                {automacao.nome}
              </strong>
              <p className="automacao-list__description">
                {automacao.descricao?.trim() ||
                  `Regra para ${GATILHO_LABELS[automacao.gatilho] || automacao.gatilho}.`}
              </p>
              <p className="automacao-list__meta">
                Gatilho: {GATILHO_LABELS[automacao.gatilho] || automacao.gatilho} | Ação:{" "}
                {ACAO_LABELS[automacao.acoes?.[0]?.tipoAcao] ||
                  automacao.acoes?.[0]?.tipoAcao ||
                  "Não definida"}{" "}
                | Status: {automacao.ativo ? "Ativa" : "Inativa"}
              </p>
            </div>
            <div className="automacao-list__actions">
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
