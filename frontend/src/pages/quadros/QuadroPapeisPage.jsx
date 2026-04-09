import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";

import {
  ShieldCheck,
  Plus,
  Search,
  Crown,
  UserCog,
  EyeOff,
  Users,
  KeyRound,
  KanbanSquare,
  ListTodo,
  Sparkles,
  Columns3,
  UserPlus,
  CheckSquare,
} from "lucide-react";

import "../../styles/pages/quadro-papeis.css";

const quadroMock = {
  id: 1,
  nome: "Produto e Backlog",
  organizacao: {
    id: 1,
    nome: "Projeto Integrador III",
  },
  papeis: [
    {
      id: 1,
      nome: "Administrador",
      descricao:
        "Papel com controle amplo sobre estrutura, papéis, membros e comportamento geral do quadro.",
      ativo: true,
      membros: 1,
      permissoes: {
        podeGerenciarQuadro: true,
        podeGerenciarListas: true,
        podeGerenciarAutomacoes: true,
        podeGerenciarCampos: true,
        podeConvidarMembros: true,
        podeCriarCartao: true,
      },
    },
    {
      id: 2,
      nome: "Colaborador",
      descricao:
        "Papel operacional para uso cotidiano do quadro, com foco em execução e criação de conteúdo.",
      ativo: true,
      membros: 4,
      permissoes: {
        podeGerenciarQuadro: false,
        podeGerenciarListas: true,
        podeGerenciarAutomacoes: false,
        podeGerenciarCampos: false,
        podeConvidarMembros: false,
        podeCriarCartao: true,
      },
    },
    {
      id: 3,
      nome: "Leitor",
      descricao:
        "Papel restrito para acompanhamento do quadro, sem capacidade de administração estrutural.",
      ativo: false,
      membros: 2,
      permissoes: {
        podeGerenciarQuadro: false,
        podeGerenciarListas: false,
        podeGerenciarAutomacoes: false,
        podeGerenciarCampos: false,
        podeConvidarMembros: false,
        podeCriarCartao: false,
      },
    },
  ],
};

const permissoesRotulo = [
  {
    key: "podeGerenciarQuadro",
    label: "Gerenciar quadro",
    icon: KanbanSquare,
  },
  {
    key: "podeGerenciarListas",
    label: "Gerenciar listas",
    icon: ListTodo,
  },
  {
    key: "podeGerenciarAutomacoes",
    label: "Gerenciar automações",
    icon: Sparkles,
  },
  {
    key: "podeGerenciarCampos",
    label: "Gerenciar campos",
    icon: Columns3,
  },
  {
    key: "podeConvidarMembros",
    label: "Convidar membros",
    icon: UserPlus,
  },
  {
    key: "podeCriarCartao",
    label: "Criar cartão",
    icon: CheckSquare,
  },
];

function obterIconePapel(nomePapel) {
  if (nomePapel === "Administrador") return Crown;
  if (nomePapel === "Colaborador") return UserCog;
  return ShieldCheck;
}

export default function QuadroPapeisPage() {
  const navigate = useNavigate();
  const { quadroId } = useParams();
  const [busca, setBusca] = useState("");

  const quadro = useMemo(() => {
    if (!quadroId || String(quadroId) === String(quadroMock.id)) {
      return quadroMock;
    }

    return {
      ...quadroMock,
      id: quadroId,
    };
  }, [quadroId]);

  const papeisFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return quadro.papeis.filter((papel) => {
      if (!termo) return true;

      return (
        papel.nome.toLowerCase().includes(termo) ||
        (papel.descricao || "").toLowerCase().includes(termo)
      );
    });
  }, [busca, quadro.papeis]);

  const totalMembrosVinculados = useMemo(() => {
    return quadro.papeis.reduce((acc, papel) => acc + (papel.membros || 0), 0);
  }, [quadro.papeis]);

  const totalPapeisAtivos = useMemo(() => {
    return quadro.papeis.filter((papel) => papel.ativo).length;
  }, [quadro.papeis]);

  function handleNovoPapel() {
    console.log("Criar novo papel no quadro:", quadro.id);
  }

  function handleEditarPapel(papelId) {
    console.log("Editar papel:", papelId);
  }

  function handleAbrirQuadro() {
    navigate(`/quadros/${quadro.id}`);
  }

  return (
    <AppLayout
      title="Papéis do quadro"
      subtitle="Defina responsabilidades e permissões por papel"
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Quadros", href: "/quadros" },
        { label: quadro.nome, href: `/quadros/${quadro.id}` },
        { label: "Papéis" },
      ]}
      user={{
        name: "Usuário",
      }}
      topbarActions={
        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={handleNovoPapel}
        >
          Novo papel
        </Button>
      }
    >
      <div className="quadro-papeis-page">
        <PageHeader
          title="Papéis do quadro"
          description={`Estruture os papéis do quadro "${quadro.nome}" com foco em permissões claras, menor ambiguidade operacional e menor acoplamento entre responsabilidades.`}
          actions={
            <>
              <Button
                variant="secondary"
                onClick={handleAbrirQuadro}
              >
                Ver quadro
              </Button>

              <Button
                variant="primary"
                leftIcon={<Plus size={16} />}
                onClick={handleNovoPapel}
              >
                Novo papel
              </Button>
            </>
          }
        />

        <section
          className="quadro-papeis-page__hero"
          aria-labelledby="quadro-papeis-hero-title"
        >
          <div className="quadro-papeis-page__hero-content">
            <div className="quadro-papeis-page__hero-badge">
              <KeyRound size={14} aria-hidden="true" />
              <span>Permissões e responsabilidades</span>
            </div>

            <h2
              id="quadro-papeis-hero-title"
              className="quadro-papeis-page__hero-title"
            >
              Papéis bem definidos reduzem conflito e retrabalho.
            </h2>

            <p className="quadro-papeis-page__hero-description">
              Neste quadro, os papéis funcionam como contrato operacional. Eles
              determinam quem administra o quadro, listas, automações, campos,
              convites e criação de cartões.
            </p>
          </div>
        </section>

        <section
          className="quadro-papeis-page__toolbar"
          aria-label="Ferramentas de busca de papéis"
        >
          <div className="quadro-papeis-page__toolbar-group quadro-papeis-page__toolbar-group--search">
            <label htmlFor="quadro-papeis-busca" className="sr-only">
              Buscar papéis
            </label>

            <div className="quadro-papeis-page__search">
              <span
                className="quadro-papeis-page__search-icon"
                aria-hidden="true"
              >
                <Search size={16} />
              </span>

              <input
                id="quadro-papeis-busca"
                type="search"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar por nome ou descrição do papel"
                className="quadro-papeis-page__search-input"
              />
            </div>
          </div>
        </section>

        <section
          className="quadro-papeis-page__summary"
          aria-label="Resumo dos papéis do quadro"
        >
          <article className="quadro-papeis-page__summary-card">
            <p className="quadro-papeis-page__summary-label">Papéis exibidos</p>
            <strong className="quadro-papeis-page__summary-value">
              {papeisFiltrados.length}
            </strong>
          </article>

          <article className="quadro-papeis-page__summary-card">
            <p className="quadro-papeis-page__summary-label">Papéis ativos</p>
            <strong className="quadro-papeis-page__summary-value">
              {totalPapeisAtivos}
            </strong>
          </article>

          <article className="quadro-papeis-page__summary-card">
            <p className="quadro-papeis-page__summary-label">
              Membros vinculados
            </p>
            <strong className="quadro-papeis-page__summary-value">
              {totalMembrosVinculados}
            </strong>
          </article>
        </section>

        {papeisFiltrados.length === 0 ? (
          <section className="quadro-papeis-page__empty">
            <EmptyState
              icon={<ShieldCheck size={40} />}
              title="Nenhum papel encontrado"
              description="Não há papéis compatíveis com a busca atual. Revise o filtro ou crie um novo papel para o quadro."
              action={
                <Button
                  variant="primary"
                  leftIcon={<Plus size={16} />}
                  onClick={handleNovoPapel}
                >
                  Criar papel
                </Button>
              }
            />
          </section>
        ) : (
          <section
            className="quadro-papeis-page__grid"
            aria-label="Lista de papéis do quadro"
          >
            {papeisFiltrados.map((papel) => {
              const IconePapel = obterIconePapel(papel.nome);

              return (
                <article
                  key={papel.id}
                  className="quadro-papeis-page__card"
                  aria-labelledby={`papel-${papel.id}-titulo`}
                >
                  <div className="quadro-papeis-page__card-header">
                    <div className="quadro-papeis-page__card-title-block">
                      <div
                        className="quadro-papeis-page__card-icon"
                        aria-hidden="true"
                      >
                        <IconePapel size={18} />
                      </div>

                      <div>
                        <h2
                          id={`papel-${papel.id}-titulo`}
                          className="quadro-papeis-page__card-title"
                        >
                          {papel.nome}
                        </h2>
                        <p className="quadro-papeis-page__card-members">
                          {papel.membros} membro(s) vinculados
                        </p>
                      </div>
                    </div>

                    <div className="quadro-papeis-page__card-actions">
                      <span
                        className={`quadro-papeis-page__card-status ${
                          papel.ativo
                            ? "quadro-papeis-page__card-status--active"
                            : "quadro-papeis-page__card-status--inactive"
                        }`}
                      >
                        {papel.ativo ? "Ativo" : "Inativo"}
                      </span>

                      <Button
                        variant="secondary"
                        onClick={() => handleEditarPapel(papel.id)}
                      >
                        Editar
                      </Button>
                    </div>
                  </div>

                  <p className="quadro-papeis-page__card-description">
                    {papel.descricao || "Sem descrição cadastrada."}
                  </p>

                  <div className="quadro-papeis-page__permissions">
                    {permissoesRotulo.map((permissao) => {
                      const IconePermissao = permissao.icon;
                      const ativa = Boolean(papel.permissoes?.[permissao.key]);

                      return (
                        <div
                          key={permissao.key}
                          className={`quadro-papeis-page__permission quadro-papeis-page__permission--${
                            ativa ? "enabled" : "disabled"
                          }`}
                        >
                          <span
                            className="quadro-papeis-page__permission-icon"
                            aria-hidden="true"
                          >
                            <IconePermissao size={14} />
                          </span>

                          <span className="quadro-papeis-page__permission-label">
                            {permissao.label}
                          </span>

                          {!ativa ? (
                            <span className="quadro-papeis-page__permission-state">
                              <EyeOff size={12} aria-hidden="true" />
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
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
