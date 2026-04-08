import { useMemo } from "react";
import { useParams } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import {
  LayoutDashboard,
  Building2,
  KanbanSquare,
  ListTodo,
  CheckSquare,
  Plus,
  Settings,
  Users,
  CalendarDays,
  ArrowRight,
  Clock3,
  Tag,
} from "lucide-react";

import "../../styles/pages/quadro-detalhe.css";

const sidebarItems = [
  { key: "home", label: "Início", href: "/home", icon: LayoutDashboard },
];

const sidebarGroups = [
  {
    key: "estrutura",
    label: "Estrutura",
    sectionLabel: "Workspace",
    icon: Building2,
    items: [
      {
        key: "organizacoes",
        label: "Organizações",
        href: "/organizacoes",
        icon: Building2,
      },
      {
        key: "quadros",
        label: "Quadros",
        href: "/quadros",
        icon: KanbanSquare,
      },
    ],
  },
  {
    key: "gestao",
    label: "Gestão",
    sectionLabel: "Operacional",
    icon: ListTodo,
    items: [
      {
        key: "listas",
        label: "Listas",
        href: "/listas",
        icon: ListTodo,
      },
      {
        key: "cartoes",
        label: "Cartões",
        href: "/cartoes",
        icon: CheckSquare,
      },
    ],
  },
];

const quadroMock = {
  id: "qdr-001",
  nome: "Produto e Backlog",
  descricao:
    "Quadro principal para planejamento, priorização e acompanhamento das entregas do sistema de gestão de tarefas.",
  organizacao: {
    id: "org-001",
    nome: "Projeto Integrador III",
  },
  visibilidade: "Privado",
  atualizadoEm: "2026-04-05",
  membros: [
    { id: "usr-001", nome: "Felipe Policarpo", papel: "Administrador" },
    { id: "usr-002", nome: "Ana Flávia", papel: "Colaboradora" },
    { id: "usr-003", nome: "Cesar Yukio", papel: "Colaborador" },
  ],
  listas: [
    {
      id: "lst-001",
      nome: "A fazer",
      limiteWip: 8,
      totalCartoes: 6,
    },
    {
      id: "lst-002",
      nome: "Em andamento",
      limiteWip: 4,
      totalCartoes: 3,
    },
    {
      id: "lst-003",
      nome: "Em validação",
      limiteWip: 3,
      totalCartoes: 1,
    },
    {
      id: "lst-004",
      nome: "Concluído",
      limiteWip: null,
      totalCartoes: 8,
    },
  ],
  atividades: [
    {
      id: "act-001",
      descricao: "Cartão “Refatorar Topbar” movido para Em validação.",
      data: "2026-04-05 09:30",
    },
    {
      id: "act-002",
      descricao: "Nova lista “Em validação” criada no quadro.",
      data: "2026-04-04 21:10",
    },
    {
      id: "act-003",
      descricao: "Membro Ana Flávia adicionado ao quadro.",
      data: "2026-04-04 19:45",
    },
  ],
};

function formatarData(dataIso) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(`${dataIso}T00:00:00`));
  } catch {
    return dataIso;
  }
}

export default function QuadroDetalhePage() {
  const { quadroId } = useParams();

  const quadro = useMemo(() => {
    if (!quadroId || quadroId === quadroMock.id) {
      return quadroMock;
    }

    return {
      ...quadroMock,
      id: quadroId,
    };
  }, [quadroId]);

  const totalCartoes = useMemo(() => {
    return quadro.listas.reduce((acc, lista) => acc + lista.totalCartoes, 0);
  }, [quadro]);

  function handleNovoCartao() {
    console.log("Novo cartão no quadro:", quadro.id);
  }

  function handleNovaLista() {
    console.log("Nova lista no quadro:", quadro.id);
  }

  function handleConfigurarQuadro() {
    console.log("Configurar quadro:", quadro.id);
  }

  return (
    <AppLayout
      title={quadro.nome}
      subtitle="Detalhes e visão geral do quadro"
      currentPath="/quadros"
      sidebarItems={sidebarItems}
      sidebarGroups={sidebarGroups}
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Quadros", href: "/quadros" },
        { label: quadro.nome },
      ]}
      user={{
        name: "Usuário",
      }}
      notificationCount={0}
    >
      <div className="quadro-detalhe-page">
        <PageHeader
          title={quadro.nome}
          description={quadro.descricao}
          actions={
            <>
              <Button
                variant="secondary"
                leftIcon={<Settings size={16} />}
                onClick={handleConfigurarQuadro}
              >
                Configurar
              </Button>

              <Button
                variant="primary"
                leftIcon={<Plus size={16} />}
                onClick={handleNovoCartao}
              >
                Novo cartão
              </Button>
            </>
          }
        />

        <section
          className="quadro-detalhe-page__hero"
          aria-labelledby="quadro-resumo-titulo"
        >
          <div className="quadro-detalhe-page__hero-main">
            <div className="quadro-detalhe-page__badge">
              <KanbanSquare size={14} aria-hidden="true" />
              <span>{quadro.visibilidade}</span>
            </div>

            <h2
              id="quadro-resumo-titulo"
              className="quadro-detalhe-page__hero-title"
            >
              Resumo do quadro
            </h2>

            <p className="quadro-detalhe-page__hero-description">
              Este quadro pertence à organização{" "}
              <strong>{quadro.organizacao.nome}</strong> e concentra listas,
              cartões, membros e eventos recentes relacionados ao fluxo de
              trabalho principal.
            </p>
          </div>

          <div className="quadro-detalhe-page__hero-meta">
            <div className="quadro-detalhe-page__hero-meta-item">
              <Building2 size={16} aria-hidden="true" />
              <span>{quadro.organizacao.nome}</span>
            </div>

            <div className="quadro-detalhe-page__hero-meta-item">
              <CalendarDays size={16} aria-hidden="true" />
              <span>Atualizado em {formatarData(quadro.atualizadoEm)}</span>
            </div>
          </div>
        </section>

        <section
          className="quadro-detalhe-page__stats"
          aria-label="Indicadores do quadro"
        >
          <article className="quadro-detalhe-page__stat-card">
            <div className="quadro-detalhe-page__stat-icon" aria-hidden="true">
              <ListTodo size={20} />
            </div>
            <div className="quadro-detalhe-page__stat-body">
              <p className="quadro-detalhe-page__stat-label">Listas</p>
              <strong className="quadro-detalhe-page__stat-value">
                {quadro.listas.length}
              </strong>
            </div>
          </article>

          <article className="quadro-detalhe-page__stat-card">
            <div className="quadro-detalhe-page__stat-icon" aria-hidden="true">
              <CheckSquare size={20} />
            </div>
            <div className="quadro-detalhe-page__stat-body">
              <p className="quadro-detalhe-page__stat-label">Cartões</p>
              <strong className="quadro-detalhe-page__stat-value">
                {totalCartoes}
              </strong>
            </div>
          </article>

          <article className="quadro-detalhe-page__stat-card">
            <div className="quadro-detalhe-page__stat-icon" aria-hidden="true">
              <Users size={20} />
            </div>
            <div className="quadro-detalhe-page__stat-body">
              <p className="quadro-detalhe-page__stat-label">Membros</p>
              <strong className="quadro-detalhe-page__stat-value">
                {quadro.membros.length}
              </strong>
            </div>
          </article>
        </section>

        <section
          className="quadro-detalhe-page__content-grid"
          aria-label="Detalhamento do quadro"
        >
          <div className="quadro-detalhe-page__panel quadro-detalhe-page__panel--main">
            <div className="quadro-detalhe-page__panel-header">
              <div>
                <h3 className="quadro-detalhe-page__panel-title">Listas do quadro</h3>
                <p className="quadro-detalhe-page__panel-description">
                  Estrutura atual das listas e distribuição inicial dos cartões.
                </p>
              </div>

              <Button
                variant="secondary"
                leftIcon={<Plus size={16} />}
                onClick={handleNovaLista}
              >
                Nova lista
              </Button>
            </div>

            {quadro.listas.length === 0 ? (
              <EmptyState
                icon={<ListTodo size={36} />}
                title="Nenhuma lista criada"
                description="Este quadro ainda não possui listas. Crie a primeira para começar a estruturar o fluxo."
                action={
                  <Button
                    variant="primary"
                    leftIcon={<Plus size={16} />}
                    onClick={handleNovaLista}
                  >
                    Criar lista
                  </Button>
                }
              />
            ) : (
              <div className="quadro-detalhe-page__listas">
                {quadro.listas.map((lista) => (
                  <article
                    key={lista.id}
                    className="quadro-detalhe-page__lista-card"
                  >
                    <div className="quadro-detalhe-page__lista-header">
                      <h4 className="quadro-detalhe-page__lista-title">
                        {lista.nome}
                      </h4>

                      <span className="quadro-detalhe-page__lista-total">
                        {lista.totalCartoes} cartões
                      </span>
                    </div>

                    <div className="quadro-detalhe-page__lista-meta">
                      <span className="quadro-detalhe-page__lista-meta-item">
                        <Tag size={14} aria-hidden="true" />
                        <span>
                          {lista.limiteWip
                            ? `Limite WIP: ${lista.limiteWip}`
                            : "Sem limite WIP"}
                        </span>
                      </span>
                    </div>

                    <div className="quadro-detalhe-page__lista-footer">
                      <Button variant="ghost">
                        Ver detalhes
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside className="quadro-detalhe-page__panel quadro-detalhe-page__panel--side">
            <section className="quadro-detalhe-page__section">
              <h3 className="quadro-detalhe-page__section-title">
                Membros do quadro
              </h3>

              <ul className="quadro-detalhe-page__membros">
                {quadro.membros.map((membro) => (
                  <li
                    key={membro.id}
                    className="quadro-detalhe-page__membro-item"
                  >
                    <div className="quadro-detalhe-page__membro-avatar" aria-hidden="true">
                      {membro.nome.slice(0, 1).toUpperCase()}
                    </div>

                    <div className="quadro-detalhe-page__membro-body">
                      <strong className="quadro-detalhe-page__membro-nome">
                        {membro.nome}
                      </strong>
                      <span className="quadro-detalhe-page__membro-papel">
                        {membro.papel}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="quadro-detalhe-page__section">
              <h3 className="quadro-detalhe-page__section-title">
                Atividade recente
              </h3>

              <ol className="quadro-detalhe-page__atividades">
                {quadro.atividades.map((atividade) => (
                  <li
                    key={atividade.id}
                    className="quadro-detalhe-page__atividade-item"
                  >
                    <span className="quadro-detalhe-page__atividade-icon" aria-hidden="true">
                      <ArrowRight size={14} />
                    </span>

                    <div className="quadro-detalhe-page__atividade-body">
                      <p className="quadro-detalhe-page__atividade-texto">
                        {atividade.descricao}
                      </p>
                      <p className="quadro-detalhe-page__atividade-data">
                        <Clock3 size={13} aria-hidden="true" />
                        <span>{atividade.data}</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </aside>
        </section>
      </div>
    </AppLayout>
  );
}