import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";

import {
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
  Archive,
  FolderOpen,
} from "lucide-react";

import "../../styles/pages/quadro-detalhe.css";

const quadroMock = {
  id: 1,
  nome: "Produto e Backlog",
  descricao:
    "Quadro principal para planejamento, priorização e acompanhamento das entregas do sistema de gestão de tarefas.",
  organizacao: {
    id: 1,
    nome: "Projeto Integrador III",
  },
  organizacaoId: 1,
  criadoPorUsuarioId: 1,
  arquivadoEm: null,
  criadoEm: "2026-04-01 09:00:00",
  atualizadoEm: "2026-04-05 14:20:00",
  membros: [
    {
      id: 1,
      nome: "Felipe Policarpo",
      papeis: ["Administrador"],
    },
    {
      id: 2,
      nome: "Ana Flávia",
      papeis: ["Colaborador"],
    },
    {
      id: 3,
      nome: "Cesar Yukio",
      papeis: ["Colaborador", "Revisor"],
    },
  ],
  listas: [
    {
      id: 1,
      nome: "A fazer",
      limiteWip: 8,
      totalCartoes: 6,
    },
    {
      id: 2,
      nome: "Em andamento",
      limiteWip: 4,
      totalCartoes: 3,
    },
    {
      id: 3,
      nome: "Em validação",
      limiteWip: 3,
      totalCartoes: 1,
    },
    {
      id: 4,
      nome: "Concluído",
      limiteWip: null,
      totalCartoes: 8,
    },
  ],
  atividades: [
    {
      id: 1,
      descricao: "Cartão “Refatorar Topbar” movido para Em validação.",
      data: "2026-04-05 09:30",
    },
    {
      id: 2,
      descricao: "Nova lista “Em validação” criada no quadro.",
      data: "2026-04-04 21:10",
    },
    {
      id: 3,
      descricao: "Membro Ana Flávia vinculado ao quadro.",
      data: "2026-04-04 19:45",
    },
  ],
};

function formatarData(data) {
  if (!data) return "Não informado";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(data));
  } catch {
    return data;
  }
}

function formatarStatusQuadro(quadro) {
  return quadro.arquivadoEm ? "Arquivado" : "Ativo";
}

export default function QuadroDetalhePage() {
  const navigate = useNavigate();
  const { quadroId } = useParams();

  const quadro = useMemo(() => {
    if (!quadroId || String(quadroId) === String(quadroMock.id)) {
      return quadroMock;
    }

    return {
      ...quadroMock,
      id: quadroId,
    };
  }, [quadroId]);

  const totalCartoes = useMemo(() => {
    return quadro.listas.reduce(
      (acc, lista) => acc + (lista.totalCartoes || 0),
      0
    );
  }, [quadro]);

  function handleNovoCartao() {
    console.log("Novo cartão no quadro:", quadro.id);
  }

  function handleNovaLista() {
    console.log("Nova lista no quadro:", quadro.id);
  }

  function handleConfigurarQuadro() {
    navigate(`/quadros/${quadro.id}/configuracoes`);
  }

  function handleAbrirMembros() {
    navigate(`/quadros/${quadro.id}/membros`);
  }

  function handleAbrirPapeis() {
    navigate(`/quadros/${quadro.id}/papeis`);
  }

  return (
    <AppLayout
      title={quadro.nome}
      subtitle="Detalhes e visão geral do quadro"
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Quadros", href: "/quadros" },
        { label: quadro.nome },
      ]}
      user={{
        name: "Usuário",
      }}
      topbarActions={
        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={handleNovoCartao}
        >
          Novo cartão
        </Button>
      }
    >
      <div className="quadro-detalhe-page">
        <PageHeader
          title={quadro.nome}
          description={quadro.descricao || "Sem descrição cadastrada."}
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
              {quadro.arquivadoEm ? (
                <Archive size={14} aria-hidden="true" />
              ) : (
                <FolderOpen size={14} aria-hidden="true" />
              )}
              <span>{formatarStatusQuadro(quadro)}</span>
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
              cartões, membros e eventos recentes relacionados ao fluxo principal
              de trabalho.
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
                <h3 className="quadro-detalhe-page__panel-title">
                  Listas do quadro
                </h3>
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
                      <Button variant="ghost">Ver detalhes</Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside className="quadro-detalhe-page__panel quadro-detalhe-page__panel--side">
            <section className="quadro-detalhe-page__section">
              <div className="quadro-detalhe-page__section-header">
                <h3 className="quadro-detalhe-page__section-title">
                  Membros do quadro
                </h3>

                <Button variant="ghost" onClick={handleAbrirMembros}>
                  Ver todos
                </Button>
              </div>

              <ul className="quadro-detalhe-page__membros">
                {quadro.membros.map((membro) => (
                  <li
                    key={membro.id}
                    className="quadro-detalhe-page__membro-item"
                  >
                    <div
                      className="quadro-detalhe-page__membro-avatar"
                      aria-hidden="true"
                    >
                      {membro.nome.slice(0, 1).toUpperCase()}
                    </div>

                    <div className="quadro-detalhe-page__membro-body">
                      <strong className="quadro-detalhe-page__membro-nome">
                        {membro.nome}
                      </strong>
                      <span className="quadro-detalhe-page__membro-papel">
                        {membro.papeis.join(", ")}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="quadro-detalhe-page__section">
              <div className="quadro-detalhe-page__section-header">
                <h3 className="quadro-detalhe-page__section-title">
                  Papéis do quadro
                </h3>

                <Button variant="ghost" onClick={handleAbrirPapeis}>
                  Gerenciar
                </Button>
              </div>

              <p className="quadro-detalhe-page__section-text">
                Os papéis controlam permissões como gerenciamento do quadro,
                listas, automações, campos, convites e criação de cartões.
              </p>
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
                    <span
                      className="quadro-detalhe-page__atividade-icon"
                      aria-hidden="true"
                    >
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
