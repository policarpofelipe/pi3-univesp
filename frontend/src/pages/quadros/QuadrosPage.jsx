import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";

import {
  Building2,
  KanbanSquare,
  ListTodo,
  CheckSquare,
  Plus,
  Search,
  Filter,
  Users,
  CalendarDays,
  Archive,
  FolderOpen,
} from "lucide-react";

import "../../styles/pages/quadros.css";

const quadrosMock = [
  {
    id: 1,
    organizacaoId: 1,
    nome: "Produto e Backlog",
    descricao:
      "Quadro principal para planejamento, priorização e acompanhamento das entregas do sistema.",
    criadoPorUsuarioId: 1,
    arquivadoEm: null,
    criadoEm: "2026-04-01 09:00:00",
    atualizadoEm: "2026-04-04 14:30:00",
    totalMembros: 5,
    totalListas: 4,
    totalCartoes: 18,
    organizacaoNome: "Projeto Integrador III",
  },
  {
    id: 2,
    organizacaoId: 1,
    nome: "Operação Acadêmica",
    descricao:
      "Quadro voltado para relatórios, entregas parciais, apresentações e alinhamentos do grupo.",
    criadoPorUsuarioId: 1,
    arquivadoEm: null,
    criadoEm: "2026-04-02 10:15:00",
    atualizadoEm: "2026-04-05 08:20:00",
    totalMembros: 7,
    totalListas: 3,
    totalCartoes: 11,
    organizacaoNome: "Projeto Integrador III",
  },
  {
    id: 3,
    organizacaoId: 2,
    nome: "Testes e Qualidade",
    descricao:
      "Quadro destinado a correções, validações de integração e acompanhamento de testes.",
    criadoPorUsuarioId: 2,
    arquivadoEm: "2026-04-03 18:00:00",
    criadoEm: "2026-03-28 13:40:00",
    atualizadoEm: "2026-04-03 18:00:00",
    totalMembros: 4,
    totalListas: 5,
    totalCartoes: 9,
    organizacaoNome: "Laboratório PI3",
  },
];

const currentUser = {
  name: "Usuário",
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

function obterStatusQuadro(quadro) {
  return quadro.arquivadoEm ? "arquivado" : "ativo";
}

function formatarStatusQuadro(quadro) {
  return quadro.arquivadoEm ? "Arquivado" : "Ativo";
}

export default function QuadrosPage() {
  const navigate = useNavigate();
  const { organizacaoId } = useParams();

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const quadrosFiltrados = useMemo(() => {
    return quadrosMock.filter((quadro) => {
      const termo = busca.trim().toLowerCase();

      const correspondeOrganizacao =
        !organizacaoId || String(quadro.organizacaoId) === String(organizacaoId);

      const correspondeBusca =
        !termo ||
        quadro.nome.toLowerCase().includes(termo) ||
        (quadro.descricao || "").toLowerCase().includes(termo) ||
        (quadro.organizacaoNome || "").toLowerCase().includes(termo);

      const statusQuadro = obterStatusQuadro(quadro);
      const correspondeStatus =
        filtroStatus === "todos" || statusQuadro === filtroStatus;

      return correspondeOrganizacao && correspondeBusca && correspondeStatus;
    });
  }, [busca, filtroStatus, organizacaoId]);

  function handleCriarQuadro() {
    console.log("Criar quadro");
  }

  function handleAbrirQuadro(id) {
    navigate(`/quadros/${id}`);
  }

  const breadcrumbItems = [
    { label: "Início", href: "/home" },
    ...(organizacaoId
      ? [{ label: "Organizações", href: "/organizacoes" }]
      : []),
    { label: "Quadros" },
  ];

  const totalAtivos = quadrosFiltrados.filter(
    (quadro) => !quadro.arquivadoEm
  ).length;

  const totalArquivados = quadrosFiltrados.filter(
    (quadro) => Boolean(quadro.arquivadoEm)
  ).length;

  return (
    <AppLayout
      title="Quadros"
      subtitle="Gerencie os quadros disponíveis no sistema"
      breadcrumbItems={breadcrumbItems}
      user={currentUser}
      topbarActions={
        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={handleCriarQuadro}
        >
          Novo quadro
        </Button>
      }
    >
      <div className="quadros-page">
        <PageHeader
          title="Quadros"
          description="Visualize, filtre e acesse os quadros vinculados às organizações disponíveis."
          actions={
            <Button
              variant="primary"
              leftIcon={<Plus size={16} />}
              onClick={handleCriarQuadro}
            >
              Novo quadro
            </Button>
          }
        />

        <section
          className="quadros-page__toolbar"
          aria-label="Ferramentas de busca e filtro"
        >
          <div className="quadros-page__toolbar-group quadros-page__toolbar-group--search">
            <label htmlFor="quadros-busca" className="sr-only">
              Buscar quadros
            </label>

            <div className="quadros-page__search">
              <span className="quadros-page__search-icon" aria-hidden="true">
                <Search size={16} />
              </span>

              <input
                id="quadros-busca"
                type="search"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar por nome, descrição ou organização"
                className="quadros-page__search-input"
              />
            </div>
          </div>

          <div className="quadros-page__toolbar-group">
            <label htmlFor="quadros-status" className="sr-only">
              Filtrar por status
            </label>

            <div className="quadros-page__filter">
              <span className="quadros-page__filter-icon" aria-hidden="true">
                <Filter size={16} />
              </span>

              <select
                id="quadros-status"
                value={filtroStatus}
                onChange={(event) => setFiltroStatus(event.target.value)}
                className="quadros-page__filter-select"
              >
                <option value="todos">Todos os quadros</option>
                <option value="ativo">Somente ativos</option>
                <option value="arquivado">Somente arquivados</option>
              </select>
            </div>
          </div>
        </section>

        <section
          className="quadros-page__summary"
          aria-label="Resumo dos quadros listados"
        >
          <article className="quadros-page__summary-card">
            <p className="quadros-page__summary-label">Total exibido</p>
            <strong className="quadros-page__summary-value">
              {quadrosFiltrados.length}
            </strong>
          </article>

          <article className="quadros-page__summary-card">
            <p className="quadros-page__summary-label">Ativos</p>
            <strong className="quadros-page__summary-value">{totalAtivos}</strong>
          </article>

          <article className="quadros-page__summary-card">
            <p className="quadros-page__summary-label">Arquivados</p>
            <strong className="quadros-page__summary-value">
              {totalArquivados}
            </strong>
          </article>
        </section>

        {quadrosFiltrados.length === 0 ? (
          <section className="quadros-page__empty">
            <EmptyState
              icon={<KanbanSquare size={40} />}
              title="Nenhum quadro encontrado"
              description="Não há quadros compatíveis com os filtros aplicados. Ajuste a busca ou crie um novo quadro."
              action={
                <Button
                  variant="primary"
                  leftIcon={<Plus size={16} />}
                  onClick={handleCriarQuadro}
                >
                  Criar quadro
                </Button>
              }
            />
          </section>
        ) : (
          <section
            className="quadros-page__grid"
            aria-label="Lista de quadros disponíveis"
          >
            {quadrosFiltrados.map((quadro) => {
              const IconeStatus = quadro.arquivadoEm ? Archive : FolderOpen;

              return (
                <article
                  key={quadro.id}
                  className="quadros-page__card"
                  aria-labelledby={`quadro-${quadro.id}-titulo`}
                >
                  <div className="quadros-page__card-header">
                    <div className="quadros-page__card-title-block">
                      <h2
                        id={`quadro-${quadro.id}-titulo`}
                        className="quadros-page__card-title"
                      >
                        {quadro.nome}
                      </h2>

                      <p className="quadros-page__card-org">
                        <Building2 size={14} aria-hidden="true" />
                        <span>{quadro.organizacaoNome}</span>
                      </p>
                    </div>

                    <span
                      className="quadros-page__card-badge"
                      aria-label={`Quadro ${formatarStatusQuadro(quadro).toLowerCase()}`}
                    >
                      <IconeStatus size={14} aria-hidden="true" />
                      <span>{formatarStatusQuadro(quadro)}</span>
                    </span>
                  </div>

                  <p className="quadros-page__card-description">
                    {quadro.descricao || "Sem descrição cadastrada."}
                  </p>

                  <dl className="quadros-page__card-metrics">
                    <div className="quadros-page__card-metric">
                      <dt>
                        <Users size={14} aria-hidden="true" />
                        <span>Membros</span>
                      </dt>
                      <dd>{quadro.totalMembros ?? 0}</dd>
                    </div>

                    <div className="quadros-page__card-metric">
                      <dt>
                        <ListTodo size={14} aria-hidden="true" />
                        <span>Listas</span>
                      </dt>
                      <dd>{quadro.totalListas ?? 0}</dd>
                    </div>

                    <div className="quadros-page__card-metric">
                      <dt>
                        <CheckSquare size={14} aria-hidden="true" />
                        <span>Cartões</span>
                      </dt>
                      <dd>{quadro.totalCartoes ?? 0}</dd>
                    </div>
                  </dl>

                  <div className="quadros-page__card-footer">
                    <p className="quadros-page__card-date">
                      <CalendarDays size={14} aria-hidden="true" />
                      <span>
                        Atualizado em {formatarData(quadro.atualizadoEm)}
                      </span>
                    </p>

                    <Button
                      variant="secondary"
                      onClick={() => handleAbrirQuadro(quadro.id)}
                    >
                      Abrir quadro
                    </Button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </AppLayout>
  );
}
