import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
  Building2,
  KanbanSquare,
  ListTodo,
  CheckSquare,
  ChevronRight,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import useAuth from "../hooks/useAuth";

import "../styles/pages/assistente-criacao.css";

const flowSteps = [
  { key: "org", label: "Organização", Icon: Building2 },
  { key: "quadro", label: "Quadros", Icon: KanbanSquare },
  { key: "lista", label: "Listas", Icon: ListTodo },
  { key: "cartao", label: "Cartões", Icon: CheckSquare },
];

export default function AssistenteCriacaoPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const currentUser = useMemo(() => {
    const nome =
      usuario?.nome || usuario?.name || usuario?.email || "Usuário";
    return { name: nome };
  }, [usuario]);

  return (
    <AppLayout
      title="Assistente de Criação"
      subtitle="Entenda a ordem correta para organizar seu trabalho no sistema."
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Assistente de Criação" },
      ]}
      user={currentUser}
      notificationCount={0}
    >
      <div className="assistente-page">
        <PageHeader
          title="Assistente de Criação"
          description="Guia em linguagem simples: o que é cada parte e em que ordem criar."
        />

        <div className="assistente-page__flow" aria-label="Fluxo principal do sistema">
          {flowSteps.flatMap((step, index) => {
            const { Icon } = step;
            const stepNode = (
              <div key={step.key} className="assistente-page__flow-step">
                <span className="assistente-page__flow-icon" aria-hidden="true">
                  <Icon size={22} strokeWidth={2} />
                </span>
                <p className="assistente-page__flow-label">{step.label}</p>
              </div>
            );
            if (index === 0) return [stepNode];
            return [
              <span
                key={`${step.key}-arrow`}
                className="assistente-page__flow-arrow"
                aria-hidden="true"
              >
                <ChevronRight size={22} strokeWidth={2} />
              </span>,
              stepNode,
            ];
          })}
        </div>

        <div className="assistente-page__intro">
          <p>
            Antes de criar tarefas, pense primeiro no contexto maior.
          </p>
          <p>
            A Organização é o agrupador principal. Ela pode ser um objetivo, uma
            área da vida, uma empresa, um curso, uma casa, um evento ou qualquer
            conjunto maior de assuntos.
          </p>
          <p>Dentro da Organização ficam os Quadros.</p>
          <p>Cada Quadro organiza uma área ou projeto específico.</p>
          <p>Dentro dos Quadros ficam as Listas.</p>
          <p>As Listas mostram as etapas do trabalho.</p>
          <p>Dentro das Listas ficam os Cartões.</p>
          <p>
            Os Cartões são as tarefas, conteúdos, demandas ou itens que precisam
            ser acompanhados.
          </p>
        </div>

        <div className="assistente-page__think">
          <h2 className="assistente-page__think-title">Pense assim</h2>
          <ul className="assistente-page__think-lines">
            <li>
              <strong>Organização</strong> = assunto maior
            </li>
            <li>
              <strong>Quadro</strong> = área ou projeto dentro desse assunto
            </li>
            <li>
              <strong>Lista</strong> = etapa do andamento
            </li>
            <li>
              <strong>Cartão</strong> = tarefa, conteúdo ou demanda específica
            </li>
          </ul>
          <div className="assistente-page__reinforce">
            <p>
              <strong>Organização</strong> é onde o assunto mora.
            </p>
            <p>
              <strong>Quadro</strong> é onde o trabalho acontece.
            </p>
            <p>
              <strong>Lista</strong> é em que fase está.
            </p>
            <p>
              <strong>Cartão</strong> é o que precisa ser feito.
            </p>
          </div>
        </div>

        <section aria-labelledby="assistente-passos-title">
          <h2 id="assistente-passos-title" className="assistente-page__section-title">
            Passo a passo
          </h2>

          <div className="assistente-page__cards">
            <article className="assistente-page__card">
              <div className="assistente-page__card-head">
                <h3 className="assistente-page__card-title">1. Organização</h3>
              </div>
              <div className="assistente-page__card-body">
                <p>
                  A Organização é o espaço principal onde seus quadros ficam
                  agrupados. Ela serve para separar contextos diferentes.
                </p>
                <p>
                  Uma organização pode representar um objetivo, uma área da vida,
                  uma empresa, um curso, uma casa, um evento, uma equipe ou um
                  projeto maior.
                </p>
                <h4>Exemplos de Organização</h4>
                <ul>
                  <li>Vestibular</li>
                  <li>Casa</li>
                  <li>Trabalho</li>
                  <li>Vida pessoal</li>
                  <li>Escola</li>
                  <li>Evento</li>
                  <li>Finanças</li>
                  <li>Saúde</li>
                </ul>
                <p className="assistente-page__callout">
                  Pense na Organização como uma <strong>pasta principal</strong>.
                  Dentro dessa pasta você colocará os quadros relacionados àquele
                  assunto.
                </p>
                <p className="assistente-page__callout">
                  <strong>Exemplo simples:</strong> Organização: Vestibular.
                  <br />
                  Dentro dela, você pode criar quadros como Matemática, Redação,
                  História e Biologia.
                </p>
              </div>
              <div className="assistente-page__card-footer">
                <Button variant="primary" onClick={() => navigate("/organizacoes")}>
                  Criar organização
                </Button>
              </div>
            </article>

            <article className="assistente-page__card">
              <div className="assistente-page__card-head">
                <h3 className="assistente-page__card-title">2. Quadros</h3>
              </div>
              <div className="assistente-page__card-body">
                <p>
                  O Quadro é uma área de trabalho dentro de uma Organização. Ele
                  organiza um tema, projeto ou processo específico.
                </p>
                <h4>Exemplos</h4>
                <p>
                  Se a Organização for <strong>“Vestibular”</strong>, os quadros
                  podem ser:
                </p>
                <ul>
                  <li>Matemática</li>
                  <li>Redação</li>
                  <li>História</li>
                  <li>Biologia</li>
                </ul>
                <p>
                  Se a Organização for <strong>“Casa”</strong>, os quadros podem
                  ser:
                </p>
                <ul>
                  <li>Reforma</li>
                  <li>Limpeza</li>
                  <li>Compras</li>
                  <li>Manutenção</li>
                </ul>
                <p>
                  Se a Organização for <strong>“Trabalho”</strong>, os quadros
                  podem ser:
                </p>
                <ul>
                  <li>Atendimento</li>
                  <li>Vendas</li>
                  <li>Projetos</li>
                  <li>Financeiro</li>
                </ul>
                <p className="assistente-page__callout">
                  Pense no Quadro como o lugar onde o trabalho realmente acontece.
                  Cada quadro tem suas próprias listas, cartões, membros, tags,
                  campos e automações.
                </p>
                <p className="assistente-page__callout">
                  <strong>Exemplo simples:</strong>
                  <br />
                  Organização: Vestibular
                  <br />
                  Quadro: Matemática
                </p>
              </div>
              <div className="assistente-page__card-footer">
                <Button variant="secondary" onClick={() => navigate("/quadros")}>
                  Ver quadros
                </Button>
              </div>
            </article>

            <article className="assistente-page__card">
              <div className="assistente-page__card-head">
                <h3 className="assistente-page__card-title">3. Listas</h3>
              </div>
              <div className="assistente-page__card-body">
                <p>
                  As Listas são as etapas do trabalho dentro de um Quadro. Elas
                  mostram em que fase cada tarefa, conteúdo ou demanda está.
                </p>
                <h4>Exemplos de listas para estudos</h4>
                <ul>
                  <li>Estudar</li>
                  <li>Estudando</li>
                  <li>Revisar</li>
                  <li>Concluído</li>
                </ul>
                <h4>Exemplos de listas para casa</h4>
                <ul>
                  <li>Planejar</li>
                  <li>Comprar</li>
                  <li>Em execução</li>
                  <li>Finalizado</li>
                </ul>
                <h4>Exemplos de listas para atendimento</h4>
                <ul>
                  <li>Novo</li>
                  <li>Em andamento</li>
                  <li>Aguardando resposta</li>
                  <li>Resolvido</li>
                </ul>
                <p className="assistente-page__callout">
                  Pense nas Listas como <strong>colunas</strong>. Cada coluna
                  representa uma fase do processo. Os cartões se movem entre essas
                  listas conforme o trabalho avança.
                </p>
                <p className="assistente-page__callout">
                  <strong>Exemplo simples:</strong>
                  <br />
                  Organização: Vestibular
                  <br />
                  Quadro: Matemática
                  <br />
                  Listas: Estudar, Estudando, Revisar, Concluído
                </p>
              </div>
              <div className="assistente-page__card-footer">
                <Button variant="secondary" onClick={() => navigate("/quadros")}>
                  Abrir quadro
                </Button>
              </div>
            </article>

            <article className="assistente-page__card">
              <div className="assistente-page__card-head">
                <h3 className="assistente-page__card-title">4. Cartões</h3>
              </div>
              <div className="assistente-page__card-body">
                <p>
                  Os Cartões são as tarefas, conteúdos, demandas ou itens que
                  precisam ser acompanhados. Eles ficam dentro das Listas.
                </p>
                <h4>Exemplos de cartões para estudos</h4>
                <ul>
                  <li>Conjuntos</li>
                  <li>Funções</li>
                  <li>Equações</li>
                  <li>Geometria</li>
                  <li>Porcentagem</li>
                </ul>
                <h4>Exemplos de cartões para casa</h4>
                <ul>
                  <li>Pintura</li>
                  <li>Piso</li>
                  <li>Iluminação</li>
                  <li>Orçamento</li>
                  <li>Móveis</li>
                </ul>
                <h4>Exemplos de cartões para vida pessoal</h4>
                <ul>
                  <li>Academia</li>
                  <li>Mercado</li>
                  <li>Consulta médica</li>
                  <li>Pagar contas</li>
                  <li>Organizar documentos</li>
                </ul>
                <p className="assistente-page__callout">
                  Dentro de um cartão, o usuário pode adicionar descrição, prazo,
                  prioridade, responsáveis, comentários, checklist, anexos, tags e
                  campos personalizados.
                </p>
                <p className="assistente-page__callout">
                  <strong>Exemplo simples:</strong>
                  <br />
                  Organização: Vestibular
                  <br />
                  Quadro: Matemática
                  <br />
                  Lista: Estudando
                  <br />
                  Cartão: Funções
                </p>
                <p>
                  Isso significa: dentro da Organização “Vestibular”, no Quadro
                  “Matemática”, o conteúdo “Funções” está na etapa “Estudando”.
                </p>
              </div>
              <div className="assistente-page__card-footer">
                <Button variant="secondary" onClick={() => navigate("/quadros")}>
                  Criar cartão
                </Button>
              </div>
            </article>
          </div>
        </section>

        <section aria-labelledby="assistente-exemplos-title">
          <h2 id="assistente-exemplos-title" className="assistente-page__section-title">
            Exemplos práticos
          </h2>
          <div className="assistente-page__examples">
            <div className="assistente-page__example">
              <h4>Exemplo 1 — Estudos</h4>
              <div className="assistente-page__example-tree">
                {`Organização: Vestibular
Quadro: Matemática
Listas: Estudar, Estudando, Revisar, Concluído
Cartões: Conjuntos, Funções, Equações, Geometria, Porcentagem`}
              </div>
              <p>
                A Organização “Vestibular” agrupa tudo relacionado à preparação para
                a prova. Dentro dela, o Quadro “Matemática” separa uma área de
                estudo. As Listas mostram o andamento dos conteúdos, e os Cartões
                representam os assuntos que precisam ser estudados.
              </p>
            </div>

            <div className="assistente-page__example">
              <h4>Exemplo 2 — Casa</h4>
              <div className="assistente-page__example-tree">
                {`Organização: Casa
Quadro: Reforma
Listas: Planejar, Comprar, Em execução, Finalizado
Cartões: Pintura, Piso, Iluminação, Orçamento, Móveis`}
              </div>
              <p>
                A Organização “Casa” agrupa assuntos domésticos. O Quadro “Reforma”
                organiza um projeto específico. As Listas mostram as etapas da
                reforma, e os Cartões representam tarefas ou itens importantes.
              </p>
            </div>

            <div className="assistente-page__example">
              <h4>Exemplo 3 — Trabalho</h4>
              <div className="assistente-page__example-tree">
                {`Organização: Trabalho
Quadro: Atendimento
Listas: Novo, Em andamento, Aguardando resposta, Resolvido
Cartões: Cliente A, Cliente B, Orçamento pendente, Retorno por telefone`}
              </div>
              <p>
                A Organização “Trabalho” agrupa atividades profissionais. O Quadro
                “Atendimento” organiza uma área específica. As Listas mostram o
                estado de cada atendimento, e os Cartões representam demandas
                individuais.
              </p>
            </div>

            <div className="assistente-page__example">
              <h4>Exemplo 4 — Vida pessoal</h4>
              <div className="assistente-page__example-tree">
                {`Organização: Vida pessoal
Quadro: Rotina semanal
Listas: Fazer, Fazendo, Aguardando, Concluído
Cartões: Academia, Mercado, Consulta médica, Pagar contas, Organizar documentos`}
              </div>
              <p>
                A Organização “Vida pessoal” agrupa compromissos particulares. O
                Quadro “Rotina semanal” organiza as tarefas da semana. As Listas
                indicam o andamento, e os Cartões são as tarefas concretas.
              </p>
            </div>
          </div>
        </section>

        <section className="assistente-page__summary" aria-labelledby="assistente-resumo-title">
          <h2 id="assistente-resumo-title">Resumo simples</h2>
          <p className="assistente-page__summary-lead">
            Se você está começando, siga esta ordem:
          </p>
          <ol>
            <li>Crie uma Organização.</li>
            <li>Dentro dela, crie um Quadro.</li>
            <li>Dentro do quadro, crie as Listas.</li>
            <li>Dentro das listas, crie os Cartões.</li>
          </ol>
          <p className="assistente-page__summary-label">Exemplo resumido:</p>
          <p className="assistente-page__summary-example">
            <strong>Vestibular → Matemática → Estudando → Funções</strong>
          </p>
          <p className="assistente-page__summary-example">
            Isso significa: dentro da Organização “Vestibular”, no Quadro
            “Matemática”, o Cartão “Funções” está na Lista “Estudando”.
          </p>
        </section>

        <p className="assistente-page__footer-note">
          Por que não começar pelo cartão? Porque o cartão precisa de uma lista, a
          lista precisa de um quadro, e o quadro fica dentro de uma organização.
          Seguir essa ordem evita confusão e deixa tudo no lugar certo desde o
          início.
        </p>
      </div>
    </AppLayout>
  );
}
