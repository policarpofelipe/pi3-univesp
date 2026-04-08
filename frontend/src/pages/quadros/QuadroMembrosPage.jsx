import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";

import {
  Building2,
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

const quadroMock = {
  id: 1,
  nome: "Produto e Backlog",
  organizacao: {
    id: 1,
    nome: "Projeto Integrador III",
  },
  membros: [
    {
      id: 1,
      usuarioId: 1,
      nome: "Felipe Policarpo",
      email: "felipe@email.com",
      status: "ativo",
      criadoEm: "2026-04-01 09:00:00",
      papeis: [
        {
          id: 1,
          nome: "Administrador",
          ativo: true,
        },
      ],
    },
    {
      id: 2,
      usuarioId: 2,
      nome: "Ana Flávia",
      email: "ana@email.com",
      status: "ativo",
      criadoEm: "2026-04-02 10:00:00",
      papeis: [
        {
          id: 2,
          nome: "Colaborador",
          ativo: true,
        },
      ],
    },
    {
      id: 3,
      usuarioId: 3,
      nome: "Cesar Yukio",
      email: "cesar@email.com",
      status: "ativo",
      criadoEm: "2026-04-03 11:00:00",
      papeis: [
        {
          id: 2,
          nome: "Colaborador",
          ativo: true,
        },
        {
          id: 3,
          nome: "Revisor",
          ativo: true,
        },
      ],
    },
    {
      id: 4,
      usuarioId: 4,
      nome: "Isabella Marzola",
      email: "isabella@email.com",
      status: "pendente",
      criadoEm: "2026-04-04 12:00:00",
      papeis: [],
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

function obterIconePapel(nomePapel) {
  if (nomePapel === "Administrador") return Crown;
  if (nomePapel === "Colaborador") return ShieldCheck;
  return UserRound;
}

function formatarPapeis(papeis = []) {
  if (!Array.isArray(papeis) || papeis.length === 0) {
    return "Sem papel vinculado";
  }

  return papeis.map((papel) => papel.nome).join(", ");
}

export default function QuadroMembrosPage() {
  const navigate = useNavigate();
  const { quadroId } = useParams();

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const quadro = useMemo(() => {
    if (!quadroId || String(quadroId) === String(quadroMock.id)) {
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
      const papeisTexto = formatarPapeis(membro.papeis).toLowerCase();

      const correspondeBusca =
        !termo ||
        membro.nome.toLowerCase().includes(termo) ||
        membro.email.toLowerCase().includes(termo) ||
        papeisTexto.includes(termo);

      const correspondeStatus =
        filtroStatus === "todos" || membro.status === filtroStatus;

      return correspondeBusca && correspondeStatus;
    });
  }, [busca, filtroStatus, quadro.membros]);

  const totalAtivos = useMemo(() => {
    return membrosFiltrados.filter((membro) => membro.status === "ativo").length;
  }, [membrosFiltrados]);

  const totalPendentes = useMemo(() => {
    return membrosFiltrados.filter((membro) => membro.status === "pendente").length;
  }, [membrosFiltrados]);

  function handleConvidarMembro() {
    console.log("Convidar membro para quadro:", quadro.id);
  }

  function handleGerenciarMembro(membroId) {
    console.log("Gerenciar membro:", membroId);
  }

  function handleAbrirQuadro() {
    navigate(`/quadros/${quadro.id}`);
  }

  return (
    <AppLayout
      title="Membros do quadro"
      subtitle="Gerencie acesso, papéis e participação no quadro"
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Quadros", href: "/quadros" },
        { label: quadro.nome, href: `/quadros/${quadro.id}` },
        { label: "Membros" },
      ]}
      user={{
        name: "Usuário",
      }}
      topbarActions={
        <Button
          variant="primary"
          leftIcon={<UserPlus size={16} />}
          onClick={handleConvidarMembro}
        >
          Convidar membro
        </Button>
      }
    >
      <div className="quadro-membros-page">
        <PageHeader
          title="Membros do quadro"
          description={`Controle quem participa do quadro "${quadro.nome}" e como cada membro interage com o fluxo operacional.`}
          actions={
            <>
              <Button variant="secondary" onClick={handleAbrirQuadro}>
                Ver quadro
              </Button>

              <Button
                variant="primary"
                leftIcon={<UserPlus size={16} />}
                onClick={handleConvidarMembro}
              >
                Convidar membro
              </Button>
            </>
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
              Estruture a colaboração com vínculos e papéis claros.
            </h2>

            <p className="quadro-membros-page__hero-description">
              O quadro pertence à organização{" "}
              <strong>{quadro.organizacao.nome}</strong>. Nesta área, o foco é
              administrar membros, estados do vínculo e papéis associados,
              evitando acoplamento desorganizado entre permissões e execução.
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
              <span
                className="quadro-membros-page__search-icon"
                aria-hidden="true"
              >
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
              {totalAtivos}
            </strong>
          </article>

          <article className="quadro-membros-page__summary-card">
            <p className="quadro-membros-page__summary-label">Pendentes</p>
            <strong className="quadro-membros-page__summary-value">
              {totalPendentes}
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
              const papelPrincipal = membro.papeis?.[0];
              const IconePapel = obterIconePapel(
                papelPrincipal?.nome || "Leitor"
              );

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
                          <span>{formatarPapeis(membro.papeis)}</span>
                        </span>

                        <span className="quadro-membros-page__meta-item">
                          <CalendarDays size={14} aria-hidden="true" />
                          <span>Desde {formatarData(membro.criadoEm)}</span>
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
