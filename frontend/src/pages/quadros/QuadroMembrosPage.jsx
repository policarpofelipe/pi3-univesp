import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
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
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  Crown,
  UserRound,
  Mail,
  CalendarDays,
  MoreHorizontal,
} from "lucide-react";

import "../../styles/pages/quadro-membros.css";

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
  organizacao: {
    id: "org-001",
    nome: "Projeto Integrador III",
  },
  membros: [
    {
      id: "usr-001",
      nome: "Felipe Policarpo",
      email: "felipe@email.com",
      papel: "Administrador",
      status: "ativo",
      entrouEm: "2026-04-01",
    },
    {
      id: "usr-002",
      nome: "Ana Flávia",
      email: "ana@email.com",
      papel: "Colaboradora",
      status: "ativo",
      entrouEm: "2026-04-02",
    },
    {
      id: "usr-003",
      nome: "Cesar Yukio",
      email: "cesar@email.com",
      papel: "Colaborador",
      status: "ativo",
      entrouEm: "2026-04-03",
    },
    {
      id: "usr-004",
      nome: "Isabella Marzola",
      email: "isabella@email.com",
      papel: "Leitora",
      status: "pendente",
      entrouEm: "2026-04-04",
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

function obterIconePapel(papel) {
  if (papel === "Administrador") return Crown;
  if (papel === "Colaboradora" || papel === "Colaborador") return ShieldCheck;
  return UserRound;
}

export default function QuadroMembrosPage() {
  const { quadroId } = useParams();
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const quadro = useMemo(() => {
    if (!quadroId || quadroId === quadroMock.id) {
      return quadroMock;
    }

    return {
      ...quadroMock,
      id: quadroId,
    };
  }, [quadroId]);

  const membrosFiltrados = useMemo(() => {
    return quadro.membros.filter((membro) => {
      const termo = busca.trim().toLowerCase();

      const correspondeBusca =
        !termo ||
        membro.nome.toLowerCase().includes(termo) ||
        membro.email.toLowerCase().includes(termo) ||
        membro.papel.toLowerCase().includes(termo);

      const correspondeStatus =
        filtroStatus === "todos" || membro.status === filtroStatus;

      return correspondeBusca && correspondeStatus;
    });
  }, [busca, filtroStatus, quadro.membros]);

  function handleConvidarMembro() {
    console.log("Convidar membro para quadro:", quadro.id);
  }

  function handleGerenciarMembro(membroId) {
    console.log("Gerenciar membro:", membroId);
  }

  return (
    <AppLayout
      title="Membros do quadro"
      subtitle="Gerencie acesso, papéis e participação no quadro"
      currentPath="/quadros"
      sidebarItems={sidebarItems}
      sidebarGroups={sidebarGroups}
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Quadros", href: "/quadros" },
        { label: quadro.nome, href: `/quadros/${quadro.id}` },
        { label: "Membros" },
      ]}
      user={{
        name: "Usuário",
      }}
      notificationCount={0}
    >
      <div className="quadro-membros-page">
        <PageHeader
          title="Membros do quadro"
          description={`Controle quem participa do quadro "${quadro.nome}" e como cada membro interage com o fluxo operacional.`}
          actions={
            <Button
              variant="primary"
              leftIcon={<UserPlus size={16} />}
              onClick={handleConvidarMembro}
            >
              Convidar membro
            </Button>
          }
        />

        <section
          className="quadro-membros-page__hero"
          aria-labelledby="quadro-membros-hero-title"
        >
          <div className="quadro-membros-page__hero-content">
            <div className="quadro-membros-page__hero-badge">
              <Users size={14} aria-hidden="true" />
              <span>Participação e acesso</span>
            </div>

            <h2
              id="quadro-membros-hero-title"
              className="quadro-membros-page__hero-title"
            >
              Estruture a colaboração com papéis claros.
            </h2>

            <p className="quadro-membros-page__hero-description">
              O quadro pertence à organização{" "}
              <strong>{quadro.organizacao.nome}</strong>. Nesta área, o foco é
              administrar membros, estados de convite e distribuição de papéis,
              evitando acoplamento desorganizado entre responsabilidades.
            </p>
          </div>
        </section>

        <section
          className="quadro-membros-page__toolbar"
          aria-label="Ferramentas de busca e filtro"
        >
          <div className="quadro-membros-page__toolbar-group quadro-membros-page__toolbar-group--search">
            <label htmlFor="quadro-membros-busca" className="sr-only">
              Buscar membros
            </label>

            <div className="quadro-membros-page__search">
              <span className="quadro-membros-page__search-icon" aria-hidden="true">
                <Search size={16} />
              </span>

              <input
                id="quadro-membros-busca"
                type="search"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar por nome, e-mail ou papel"
                className="quadro-membros-page__search-input"
              />
            </div>
          </div>

          <div className="quadro-membros-page__toolbar-group">
            <label htmlFor="quadro-membros-status" className="sr-only">
              Filtrar por status
            </label>

            <select
              id="quadro-membros-status"
              value={filtroStatus}
              onChange={(event) => setFiltroStatus(event.target.value)}
              className="quadro-membros-page__filter-select"
            >
              <option value="todos">Todos os status</option>
              <option value="ativo">Somente ativos</option>
              <option value="pendente">Somente pendentes</option>
            </select>
          </div>
        </section>

        <section
          className="quadro-membros-page__summary"
          aria-label="Resumo de membros do quadro"
        >
          <article className="quadro-membros-page__summary-card">
            <p className="quadro-membros-page__summary-label">Total exibido</p>
            <strong className="quadro-membros-page__summary-value">
              {membrosFiltrados.length}
            </strong>
          </article>

          <article className="quadro-membros-page__summary-card">
            <p className="quadro-membros-page__summary-label">Ativos</p>
            <strong className="quadro-membros-page__summary-value">
              {
                membrosFiltrados.filter((membro) => membro.status === "ativo")
                  .length
              }
            </strong>
          </article>

          <article className="quadro-membros-page__summary-card">
            <p className="quadro-membros-page__summary-label">Pendentes</p>
            <strong className="quadro-membros-page__summary-value">
              {
                membrosFiltrados.filter((membro) => membro.status === "pendente")
                  .length
              }
            </strong>
          </article>
        </section>

        {membrosFiltrados.length === 0 ? (
          <section className="quadro-membros-page__empty">
            <EmptyState
              icon={<Users size={40} />}
              title="Nenhum membro encontrado"
              description="Não há membros compatíveis com os filtros aplicados. Revise a busca ou convide novos participantes."
              action={
                <Button
                  variant="primary"
                  leftIcon={<UserPlus size={16} />}
                  onClick={handleConvidarMembro}
                >
                  Convidar membro
                </Button>
              }
            />
          </section>
        ) : (
          <section
            className="quadro-membros-page__list"
            aria-label="Lista de membros do quadro"
          >
            {membrosFiltrados.map((membro) => {
              const IconePapel = obterIconePapel(membro.papel);

              return (
                <article
                  key={membro.id}
                  className="quadro-membros-page__card"
                  aria-labelledby={`membro-${membro.id}-nome`}
                >
                  <div className="quadro-membros-page__card-main">
                    <div
                      className="quadro-membros-page__avatar"
                      aria-hidden="true"
                    >
                      {membro.nome.slice(0, 1).toUpperCase()}
                    </div>

                    <div className="quadro-membros-page__card-body">
                      <div className="quadro-membros-page__card-header">
                        <div className="quadro-membros-page__card-title-block">
                          <h2
                            id={`membro-${membro.id}-nome`}
                            className="quadro-membros-page__card-title"
                          >
                            {membro.nome}
                          </h2>

                          <p className="quadro-membros-page__card-email">
                            <Mail size={14} aria-hidden="true" />
                            <span>{membro.email}</span>
                          </p>
                        </div>

                        <span
                          className={`quadro-membros-page__status quadro-membros-page__status--${membro.status}`}
                        >
                          {membro.status === "ativo" ? "Ativo" : "Pendente"}
                        </span>
                      </div>

                      <div className="quadro-membros-page__meta">
                        <span className="quadro-membros-page__meta-item">
                          <IconePapel size={14} aria-hidden="true" />
                          <span>{membro.papel}</span>
                        </span>

                        <span className="quadro-membros-page__meta-item">
                          <CalendarDays size={14} aria-hidden="true" />
                          <span>Desde {formatarData(membro.entrouEm)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="quadro-membros-page__card-actions">
                    <Button
                      variant="secondary"
                      onClick={() => handleGerenciarMembro(membro.id)}
                    >
                      Gerenciar
                    </Button>

                    <Button
                      variant="ghost"
                      leftIcon={<MoreHorizontal size={16} />}
                      onClick={() => handleGerenciarMembro(membro.id)}
                    >
                      Ações
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