import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";

import {
  KanbanSquare,
  Save,
  Settings,
  Archive,
  FolderOpen,
  ShieldCheck,
  Users,
  ArrowRightLeft,
} from "lucide-react";

import "../../styles/pages/quadro-configuracoes.css";

const quadroMock = {
  id: 1,
  nome: "Produto e Backlog",
  descricao:
    "Quadro principal para planejamento, priorização e acompanhamento das entregas do sistema.",
  organizacao: {
    id: 1,
    nome: "Projeto Integrador III",
  },
  organizacaoId: 1,
  criadoPorUsuarioId: 1,
  arquivadoEm: null,
  criadoEm: "2026-04-01 09:00:00",
  atualizadoEm: "2026-04-05 14:20:00",
};

export default function QuadroConfiguracoesPage() {
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

  const [formData, setFormData] = useState({
    nome: quadro.nome,
    descricao: quadro.descricao || "",
    arquivado: Boolean(quadro.arquivadoEm),
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
      console.log("Salvar configurações reais do quadro:", quadro.id, formData);
      await new Promise((resolve) => setTimeout(resolve, 800));
    } finally {
      setSalvando(false);
    }
  }

  function handleAbrirPapeis() {
    navigate(`/quadros/${quadro.id}/papeis`);
  }

  function handleAbrirMembros() {
    navigate(`/quadros/${quadro.id}/membros`);
  }

  function handleAbrirQuadro() {
    navigate(`/quadros/${quadro.id}`);
  }

  return (
    <AppLayout
      title="Configurações do quadro"
      subtitle="Ajuste dados básicos e estado operacional do quadro"
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Quadros", href: "/quadros" },
        { label: quadro.nome, href: `/quadros/${quadro.id}` },
        { label: "Configurações" },
      ]}
      user={{
        name: "Usuário",
      }}
      topbarActions={
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
    >
      <div className="quadro-configuracoes-page">
        <PageHeader
          title="Configurações do quadro"
          description="Centralize aqui os ajustes estruturais do quadro. Permissões, membros e regras de fluxo devem ser administrados em seus módulos próprios."
          actions={
            <>
              <Button
                variant="secondary"
                onClick={handleAbrirQuadro}
              >
                Ver quadro
              </Button>

              <Button
                type="submit"
                form="quadro-configuracoes-form"
                variant="primary"
                leftIcon={<Save size={16} />}
                loading={salvando}
              >
                Salvar alterações
              </Button>
            </>
          }
        />

        <section
          className="quadro-configuracoes-page__hero"
          aria-labelledby="quadro-config-hero-title"
        >
          <div className="quadro-configuracoes-page__hero-content">
            <div className="quadro-configuracoes-page__hero-badge">
              <Settings size={14} aria-hidden="true" />
              <span>Ajustes estruturais do quadro</span>
            </div>

            <h2
              id="quadro-config-hero-title"
              className="quadro-configuracoes-page__hero-title"
            >
              Configure apenas o que pertence ao quadro.
            </h2>

            <p className="quadro-configuracoes-page__hero-description">
              O quadro faz parte da organização{" "}
              <strong>{quadro.organizacao.nome}</strong>. Nesta área, o foco
              está em identidade, descrição e estado do quadro. Papéis, membros
              e regras mais específicas devem permanecer nos seus domínios
              próprios para evitar acoplamento indevido.
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
                Defina a identidade textual e o contexto funcional do quadro.
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
                <Archive size={18} aria-hidden="true" />
                <span>Estado do quadro</span>
              </h3>
              <p className="quadro-configuracoes-page__section-description">
                Determine se o quadro permanece no fluxo principal ou se deve ser
                mantido apenas para consulta e histórico.
              </p>
            </div>

            <div className="quadro-configuracoes-page__card">
              <div className="quadro-configuracoes-page__switch-list">
                <label className="quadro-configuracoes-page__switch-item">
                  <div className="quadro-configuracoes-page__switch-text">
                    <strong>Arquivar quadro</strong>
                    <span>
                      Quando ativado, o quadro sai do fluxo operacional
                      principal, mas mantém seus dados e histórico.
                    </span>
                  </div>

                  <input
                    name="arquivado"
                    type="checkbox"
                    checked={formData.arquivado}
                    onChange={handleChange}
                  />
                </label>

                <div className="quadro-configuracoes-page__status-preview">
                  <span className="quadro-configuracoes-page__status-preview-icon">
                    {formData.arquivado ? (
                      <Archive size={16} aria-hidden="true" />
                    ) : (
                      <FolderOpen size={16} aria-hidden="true" />
                    )}
                  </span>
                  <span className="quadro-configuracoes-page__status-preview-text">
                    Estado atual após salvamento:{" "}
                    <strong>{formData.arquivado ? "Arquivado" : "Ativo"}</strong>
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="quadro-configuracoes-page__section">
            <div className="quadro-configuracoes-page__section-header">
              <h3 className="quadro-configuracoes-page__section-title">
                <ShieldCheck size={18} aria-hidden="true" />
                <span>Domínios relacionados</span>
              </h3>
              <p className="quadro-configuracoes-page__section-description">
                Alguns controles não pertencem ao registro principal do quadro e
                devem ser administrados em módulos próprios.
              </p>
            </div>

            <div className="quadro-configuracoes-page__card quadro-configuracoes-page__card--related">
              <div className="quadro-configuracoes-page__related-list">
                <div className="quadro-configuracoes-page__related-item">
                  <div className="quadro-configuracoes-page__related-text">
                    <strong>Papéis e permissões</strong>
                    <span>
                      Controle quem pode gerenciar quadro, listas, automações,
                      campos, convites e criação de cartões.
                    </span>
                  </div>

                  <Button variant="secondary" onClick={handleAbrirPapeis}>
                    Abrir papéis
                  </Button>
                </div>

                <div className="quadro-configuracoes-page__related-item">
                  <div className="quadro-configuracoes-page__related-text">
                    <strong>Membros do quadro</strong>
                    <span>
                      Gerencie vínculos de usuários, status do membro e
                      associação com papéis do quadro.
                    </span>
                  </div>

                  <Button variant="secondary" onClick={handleAbrirMembros}>
                    Abrir membros
                  </Button>
                </div>

                <div className="quadro-configuracoes-page__related-item">
                  <div className="quadro-configuracoes-page__related-text">
                    <strong>Fluxo e transições</strong>
                    <span>
                      Regras de movimentação entre listas devem ser tratadas no
                      domínio de listas, permissões e transições.
                    </span>
                  </div>

                  <Button variant="ghost" disabled leftIcon={<ArrowRightLeft size={16} />}>
                    Em evolução
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </form>
      </div>
    </AppLayout>
  );
}
