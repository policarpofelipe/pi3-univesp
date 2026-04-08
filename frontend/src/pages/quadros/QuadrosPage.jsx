import { useMemo, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import {
  LayoutDashboard,
  Building2,
  KanbanSquare,
  ListTodo,
  CheckSquare,
  Plus,
  Search,
  Filter,
  Users,
  CalendarDays,
  Lock,
  Globe,
} from "lucide-react";

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

const quadrosMock = [
  {
    id: "qdr-001",
    nome: "Produto e Backlog",
    descricao:
      "Quadro principal para planejamento, priorização e acompanhamento das entregas do produto.",
    organizacao: "Projeto Integrador III",
    visibilidade: "privado",
    membros: 5,
    listas: 4,
    cartoes: 18,
    atualizadoEm: "2026-04-04",
  },
  {
    id: "qdr-002",
    nome: "Operação Acadêmica",
    descricao:
      "Acompanhamento das entregas documentais, relatórios, apresentações e alinhamentos do grupo.",
    organizacao: "Projeto Integrador III",
    visibilidade: "privado",
    membros: 7,
    listas: 3,
    cartoes: 11,
    atualizadoEm: "2026-04-03",
  },
  {
    id: "qdr-003",
    nome: "Testes e Qualidade",
    descricao:
      "Quadro voltado para testes funcionais, correções e validações de integração entre frontend, backend e banco.",
    organizacao: "Laboratório PI3",
    visibilidade: "publico",
    membros: 4,
    listas: 5,
    cartoes: 9,
    atualizadoEm: "2026-04-01",
  },
];

function formatarVisibilidade(visibilidade) {
  return visibilidade === "publico" ? "Público" : "Privado";
}

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

export default function QuadrosPage() {
  const [busca, setBusca] = useState("");
  const [filtroVisibilidade, setFiltroVisibilidade] = useState("todos");

  const quadrosFiltrados = useMemo(() => {
    return quadrosMock.filter((quadro) => {
      const termo = busca.trim().toLowerCase();

      const correspondeBusca =
        !termo ||
        quadro.nome.toLowerCase().includes(termo) ||
        quadro.descricao.toLowerCase().includes(termo) ||
        quadro.organizacao.toLowerCase().includes(termo);

      const correspondeVisibilidade =
        filtroVisibilidade === "todos" ||
        quadro.visibilidade === filtroVisibilidade;

      return correspondeBusca && correspondeVisibilidade;
    });
  }, [busca, filtroVisibilidade]);

  function handleCriarQuadro() {
    console.log("Criar quadro");
  }

  function handleAbrirQuadro(id) {
    console.log("Abrir quadro:", id);
  }

  return (
    <AppLayout
      title="Quadros"
      subtitle="Gerencie os quadros disponíveis no sistema"
      currentPath="/quadros"
      sidebarItems={sidebarItems}
      sidebarGroups={sidebarGroups}
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Quadros" },
      ]}
      user={{
        name: "Usuário",
        email: "usuario@email.com",
      }}
      notificationCount={0}
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
            <label htmlFor="quadros-visibilidade" className="sr-only">
              Filtrar por visibilidade
            </label>

            <div className="quadros-page__filter">
              <span className="quadros-page__filter-icon" aria-hidden="true">
                <Filter size={16} />
              </span>

              <select
                id="quadros-visibilidade"
                value={filtroVisibilidade}
                onChange={(event) => setFiltroVisibilidade(event.target.value)}
                className="quadros-page__filter-select"
              >
                <option value="todos">Todos os quadros</option>
                <option value="privado">Somente privados</option>
                <option value="publico">Somente públicos</option>
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
            <p className="quadros-page__summary-label">Privados</p>
            <strong className="quadros-page__summary-value">
              {
                quadrosFiltrados.filter((quadro) => quadro.visibilidade === "privado")
                  .length
              }
            </strong>
          </article>

          <article className="quadros-page__summary-card">
            <p className="quadros-page__summary-label">Públicos</p>
            <strong className="quadros-page__summary-value">
              {
                quadrosFiltrados.filter((quadro) => quadro.visibilidade === "publico")
                  .length
              }
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
              const IconeVisibilidade =
                quadro.visibilidade === "publico" ? Globe : Lock;

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
                        <span>{quadro.organizacao}</span>
                      </p>
                    </div>

                    <span
                      className="quadros-page__card-badge"
                      aria-label={`Quadro ${formatarVisibilidade(
                        quadro.visibilidade
                      ).toLowerCase()}`}
                    >
                      <IconeVisibilidade size={14} aria-hidden="true" />
                      <span>{formatarVisibilidade(quadro.visibilidade)}</span>
                    </span>
                  </div>

                  <p className="quadros-page__card-description">
                    {quadro.descricao}
                  </p>

                  <dl className="quadros-page__card-metrics">
                    <div className="quadros-page__card-metric">
                      <dt>
                        <Users size={14} aria-hidden="true" />
                        <span>Membros</span>
                      </dt>
                      <dd>{quadro.membros}</dd>
                    </div>

                    <div className="quadros-page__card-metric">
                      <dt>
                        <ListTodo size={14} aria-hidden="true" />
                        <span>Listas</span>
                      </dt>
                      <dd>{quadro.listas}</dd>
                    </div>

                    <div className="quadros-page__card-metric">
                      <dt>
                        <CheckSquare size={14} aria-hidden="true" />
                        <span>Cartões</span>
                      </dt>
                      <dd>{quadro.cartoes}</dd>
                    </div>
                  </dl>

                  <div className="quadros-page__card-footer">
                    <p className="quadros-page__card-date">
                      <CalendarDays size={14} aria-hidden="true" />
                      <span>Atualizado em {formatarData(quadro.atualizadoEm)}</span>
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