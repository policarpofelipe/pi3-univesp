import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import {
  LayoutDashboard,
  Building2,
  KanbanSquare,
  ListTodo,
  CheckSquare,
  Settings,
  Save,
  Lock,
  Globe,
  Archive,
  ShieldCheck,
  Users,
  ArrowLeftRight,
} from "lucide-react";

import "../../styles/pages/quadro-configuracoes.css";

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
    "Quadro principal para planejamento, priorização e acompanhamento das entregas do sistema.",
  organizacao: {
    id: "org-001",
    nome: "Projeto Integrador III",
  },
  visibilidade: "privado",
  arquivado: false,
  permitirConvites: true,
  permitirComentarios: true,
  exigirPermissaoMoverCartoes: false,
  permitirTransicoesLivres: true,
};

export default function QuadroConfiguracoesPage() {
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

  const [formData, setFormData] = useState({
    nome: quadro.nome,
    descricao: quadro.descricao,
    visibilidade: quadro.visibilidade,
    arquivado: quadro.arquivado,
    permitirConvites: quadro.permitirConvites,
    permitirComentarios: quadro.permitirComentarios,
    exigirPermissaoMoverCartoes: quadro.exigirPermissaoMoverCartoes,
    permitirTransicoesLivres: quadro.permitirTransicoesLivres,
  });

  const [salvando, setSalvando] = useState(false);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSalvando(true);

    try {
      console.log("Salvar configurações do quadro:", quadro.id, formData);
      await new Promise((resolve) => setTimeout(resolve, 800));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <AppLayout
      title="Configurações do quadro"
      subtitle="Ajuste nome, visibilidade, permissões e comportamento operacional"
      currentPath="/quadros"
      sidebarItems={sidebarItems}
      sidebarGroups={sidebarGroups}
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Quadros", href: "/quadros" },
        { label: quadro.nome, href: `/quadros/${quadro.id}` },
        { label: "Configurações" },
      ]}
      user={{
        name: "Usuário",
      }}
      notificationCount={0}
    >
      <div className="quadro-configuracoes-page">
        <PageHeader
          title="Configurações do quadro"
          description="Centralize aqui os ajustes estruturais e operacionais do quadro. Evite mudanças sem contrato claro com permissões, listas e fluxo."
          actions={
            <Button
              type="submit"
              form="quadro-configuracoes-form"
              variant="primary"
              leftIcon={<Save size={16} />}
              loading={salvando}
            >
              Salvar alterações
            </Button>
          }
        />

        <section
          className="quadro-configuracoes-page__hero"
          aria-labelledby="quadro-config-hero-title"
        >
          <div className="quadro-configuracoes-page__hero-content">
            <div className="quadro-configuracoes-page__hero-badge">
              <Settings size={14} aria-hidden="true" />
              <span>Ajustes do quadro</span>
            </div>

            <h2
              id="quadro-config-hero-title"
              className="quadro-configuracoes-page__hero-title"
            >
              Configure o comportamento e o escopo do quadro.
            </h2>

            <p className="quadro-configuracoes-page__hero-description">
              As definições abaixo afetam visibilidade, colaboração, comentários,
              transições e o ciclo operacional do quadro dentro da organização{" "}
              <strong>{quadro.organizacao.nome}</strong>.
            </p>
          </div>
        </section>

        <form
          id="quadro-configuracoes-form"
          className="quadro-configuracoes-page__form"
          onSubmit={handleSubmit}
        >
          <section className="quadro-configuracoes-page__section">
            <div className="quadro-configuracoes-page__section-header">
              <h3 className="quadro-configuracoes-page__section-title">
                <KanbanSquare size={18} aria-hidden="true" />
                <span>Informações básicas</span>
              </h3>
              <p className="quadro-configuracoes-page__section-description">
                Defina identidade, contexto e descrição funcional do quadro.
              </p>
            </div>

            <div className="quadro-configuracoes-page__card">
              <div className="quadro-configuracoes-page__field">
                <label
                  htmlFor="quadro-nome"
                  className="quadro-configuracoes-page__label"
                >
                  Nome do quadro
                </label>
                <input
                  id="quadro-nome"
                  name="nome"
                  type="text"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Informe o nome do quadro"
                />
              </div>

              <div className="quadro-configuracoes-page__field">
                <label
                  htmlFor="quadro-descricao"
                  className="quadro-configuracoes-page__label"
                >
                  Descrição
                </label>
                <textarea
                  id="quadro-descricao"
                  name="descricao"
                  rows="5"
                  value={formData.descricao}
                  onChange={handleChange}
                  placeholder="Descreva a finalidade do quadro"
                />
              </div>
            </div>
          </section>

          <section className="quadro-configuracoes-page__section">
            <div className="quadro-configuracoes-page__section-header">
              <h3 className="quadro-configuracoes-page__section-title">
                <ShieldCheck size={18} aria-hidden="true" />
                <span>Visibilidade e acesso</span>
              </h3>
              <p className="quadro-configuracoes-page__section-description">
                Controle quem vê o quadro e como o ingresso de membros pode ocorrer.
              </p>
            </div>

            <div className="quadro-configuracoes-page__card">
              <div className="quadro-configuracoes-page__field">
                <label
                  htmlFor="quadro-visibilidade"
                  className="quadro-configuracoes-page__label"
                >
                  Visibilidade
                </label>

                <div className="quadro-configuracoes-page__select-wrap">
                  <span
                    className="quadro-configuracoes-page__select-icon"
                    aria-hidden="true"
                  >
                    {formData.visibilidade === "publico" ? (
                      <Globe size={16} />
                    ) : (
                      <Lock size={16} />
                    )}
                  </span>

                  <select
                    id="quadro-visibilidade"
                    name="visibilidade"
                    value={formData.visibilidade}
                    onChange={handleChange}
                  >
                    <option value="privado">Privado</option>
                    <option value="publico">Público</option>
                  </select>
                </div>
              </div>

              <div className="quadro-configuracoes-page__switch-list">
                <label className="quadro-configuracoes-page__switch-item">
                  <div className="quadro-configuracoes-page__switch-text">
                    <strong>Permitir convites de membros</strong>
                    <span>
                      Usuários autorizados poderão convidar novos participantes
                      para o quadro.
                    </span>
                  </div>

                  <input
                    name="permitirConvites"
                    type="checkbox"
                    checked={formData.permitirConvites}
                    onChange={handleChange}
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="quadro-configuracoes-page__section">
            <div className="quadro-configuracoes-page__section-header">
              <h3 className="quadro-configuracoes-page__section-title">
                <Users size={18} aria-hidden="true" />
                <span>Colaboração</span>
              </h3>
              <p className="quadro-configuracoes-page__section-description">
                Estabeleça regras para comentários e interação dos membros.
              </p>
            </div>

            <div className="quadro-configuracoes-page__card">
              <div className="quadro-configuracoes-page__switch-list">
                <label className="quadro-configuracoes-page__switch-item">
                  <div className="quadro-configuracoes-page__switch-text">
                    <strong>Permitir comentários nos cartões</strong>
                    <span>
                      Habilita a colaboração textual nas tarefas e no histórico
                      operacional.
                    </span>
                  </div>

                  <input
                    name="permitirComentarios"
                    type="checkbox"
                    checked={formData.permitirComentarios}
                    onChange={handleChange}
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="quadro-configuracoes-page__section">
            <div className="quadro-configuracoes-page__section-header">
              <h3 className="quadro-configuracoes-page__section-title">
                <ArrowLeftRight size={18} aria-hidden="true" />
                <span>Fluxo e transições</span>
              </h3>
              <p className="quadro-configuracoes-page__section-description">
                Determine se a movimentação entre listas será livre ou regida por
                regras mais estritas.
              </p>
            </div>

            <div className="quadro-configuracoes-page__card">
              <div className="quadro-configuracoes-page__switch-list">
                <label className="quadro-configuracoes-page__switch-item">
                  <div className="quadro-configuracoes-page__switch-text">
                    <strong>Exigir permissão para mover cartões</strong>
                    <span>
                      Restringe movimentações a usuários com verbo de permissão
                      apropriado.
                    </span>
                  </div>

                  <input
                    name="exigirPermissaoMoverCartoes"
                    type="checkbox"
                    checked={formData.exigirPermissaoMoverCartoes}
                    onChange={handleChange}
                  />
                </label>

                <label className="quadro-configuracoes-page__switch-item">
                  <div className="quadro-configuracoes-page__switch-text">
                    <strong>Permitir transições livres entre listas</strong>
                    <span>
                      Quando desativado, o quadro pode ser configurado com regras
                      formais de transição.
                    </span>
                  </div>

                  <input
                    name="permitirTransicoesLivres"
                    type="checkbox"
                    checked={formData.permitirTransicoesLivres}
                    onChange={handleChange}
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="quadro-configuracoes-page__section">
            <div className="quadro-configuracoes-page__section-header">
              <h3 className="quadro-configuracoes-page__section-title">
                <Archive size={18} aria-hidden="true" />
                <span>Estado do quadro</span>
              </h3>
              <p className="quadro-configuracoes-page__section-description">
                Defina se o quadro permanece ativo no fluxo principal ou deve ser
                mantido apenas para consulta.
              </p>
            </div>

            <div className="quadro-configuracoes-page__card">
              <div className="quadro-configuracoes-page__switch-list">
                <label className="quadro-configuracoes-page__switch-item">
                  <div className="quadro-configuracoes-page__switch-text">
                    <strong>Arquivar quadro</strong>
                    <span>
                      Remove o quadro do fluxo operacional principal, preservando
                      seu histórico e seus dados.
                    </span>
                  </div>

                  <input
                    name="arquivado"
                    type="checkbox"
                    checked={formData.arquivado}
                    onChange={handleChange}
                  />
                </label>
              </div>
            </div>
          </section>
        </form>
      </div>
    </AppLayout>
  );
}