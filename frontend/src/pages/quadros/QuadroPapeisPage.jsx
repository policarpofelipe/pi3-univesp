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
  ShieldCheck,
  Plus,
  Search,
  Crown,
  UserCog,
  Eye,
  Pencil,
  Trash2,
  ArrowRightLeft,
  Users,
  KeyRound,
} from "lucide-react";

import "../../styles/pages/quadro-papeis.css";

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
  papeis: [
    {
      id: "pap-001",
      nome: "Administrador",
      descricao:
        "Papel com controle amplo sobre estrutura, membros, configurações e fluxo do quadro.",
      membros: 1,
      permissoes: {
        visualizarQuadro: true,
        editarQuadro: true,
        excluirQuadro: true,
        gerenciarMembros: true,
        moverCartoes: true,
        editarListas: true,
      },
    },
    {
      id: "pap-002",
      nome: "Colaborador",
      descricao:
        "Papel operacional voltado para execução diária, edição de conteúdo e movimentação entre listas.",
      membros: 4,
      permissoes: {
        visualizarQuadro: true,
        editarQuadro: false,
        excluirQuadro: false,
        gerenciarMembros: false,
        moverCartoes: true,
        editarListas: true,
      },
    },
    {
      id: "pap-003",
      nome: "Leitor",
      descricao:
        "Papel restrito à consulta do quadro, sem capacidade de alteração estrutural ou operacional.",
      membros: 2,
      permissoes: {
        visualizarQuadro: true,
        editarQuadro: false,
        excluirQuadro: false,
        gerenciarMembros: false,
        moverCartoes: false,
        editarListas: false,
      },
    },
  ],
};

const permissoesRotulo = [
  {
    key: "visualizarQuadro",
    label: "Visualizar quadro",
    icon: Eye,
  },
  {
    key: "editarQuadro",
    label: "Editar quadro",
    icon: Pencil,
  },
  {
    key: "excluirQuadro",
    label: "Excluir quadro",
    icon: Trash2,
  },
  {
    key: "gerenciarMembros",
    label: "Gerenciar membros",
    icon: Users,
  },
  {
    key: "moverCartoes",
    label: "Mover cartões",
    icon: ArrowRightLeft,
  },
  {
    key: "editarListas",
    label: "Editar listas",
    icon: ListTodo,
  },
];

function obterIconePapel(nomePapel) {
  if (nomePapel === "Administrador") return Crown;
  if (nomePapel === "Colaborador") return UserCog;
  return ShieldCheck;
}

export default function QuadroPapeisPage() {
  const { quadroId } = useParams();
  const [busca, setBusca] = useState("");

  const quadro = useMemo(() => {
    if (!quadroId || quadroId === quadroMock.id) {
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
        papel.descricao.toLowerCase().includes(termo)
      );
    });
  }, [busca, quadro.papeis]);

  const totalMembrosVinculados = useMemo(() => {
    return quadro.papeis.reduce((acc, papel) => acc + papel.membros, 0);
  }, [quadro.papeis]);

  function handleNovoPapel() {
    console.log("Criar novo papel no quadro:", quadro.id);
  }

  function handleEditarPapel(papelId) {
    console.log("Editar papel:", papelId);
  }

  return (
    <AppLayout
      title="Papéis do quadro"
      subtitle="Defina responsabilidades e permissões por papel"
      currentPath="/quadros"
      sidebarItems={sidebarItems}
      sidebarGroups={sidebarGroups}
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Quadros", href: "/quadros" },
        { label: quadro.nome, href: `/quadros/${quadro.id}` },
        { label: "Papéis" },
      ]}
      user={{
        name: "Usuário",
      }}
      notificationCount={0}
    >
      <div className="quadro-papeis-page">
        <PageHeader
          title="Papéis do quadro"
          description={`Estruture os papéis do quadro "${quadro.nome}" com foco em permissões claras, menor ambiguidade operacional e menor acoplamento entre responsabilidades.`}
          actions={
            <Button
              variant="primary"
              leftIcon={<Plus size={16} />}
              onClick={handleNovoPapel}
            >
              Novo papel
            </Button>
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
              Neste quadro, os papéis servem como contrato operacional. Eles
              determinam quem pode visualizar, editar, mover cartões, alterar
              listas e administrar a participação de membros.
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
              <span className="quadro-papeis-page__search-icon" aria-hidden="true">
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
            <p className="quadro-papeis-page__summary-label">Membros vinculados</p>
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
                      <div className="quadro-papeis-page__card-icon" aria-hidden="true">
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

                    <Button
                      variant="secondary"
                      onClick={() => handleEditarPapel(papel.id)}
                    >
                      Editar
                    </Button>
                  </div>

                  <p className="quadro-papeis-page__card-description">
                    {papel.descricao}
                  </p>

                  <div className="quadro-papeis-page__permissions">
                    {permissoesRotulo.map((permissao) => {
                      const IconePermissao = permissao.icon;
                      const ativa = papel.permissoes[permissao.key];

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