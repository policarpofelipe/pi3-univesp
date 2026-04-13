import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import QuadroForm from "../../components/quadros/QuadroForm";
import QuadroPreferenciasForm from "../../components/quadros/QuadroPreferenciasForm";

import quadroService from "../../services/quadroService";
import { buscarOrganizacaoPorId } from "../../services/organizacaoService";
import { extractObject } from "../../utils/apiData";
import useAuth from "../../hooks/useAuth";

import { Save, Settings, KanbanSquare, Archive, ShieldCheck, Users, ArrowRightLeft } from "lucide-react";

import "../../styles/pages/quadro-configuracoes.css";

export default function QuadroConfiguracoesPage() {
  const navigate = useNavigate();
  const { quadroId } = useParams();
  const { usuario } = useAuth();

  const usuarioId = usuario?.id ?? usuario?.usuarioId ?? "";

  const [quadro, setQuadro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [arquivadoInicial, setArquivadoInicial] = useState(false);

  const carregarQuadro = useCallback(async () => {
    if (!quadroId) return;

    setLoading(true);
    setErro("");

    try {
      const response = await quadroService.obterPorId(quadroId);
      const data = extractObject(response) || response;
      let enriched = { ...data };

      if (data?.organizacaoId && !data.organizacao?.nome) {
        try {
          const orgRes = await buscarOrganizacaoPorId(data.organizacaoId);
          const org = extractObject(orgRes) || orgRes;
          enriched = {
            ...enriched,
            organizacao: { id: data.organizacaoId, nome: org?.nome || "" },
            organizacaoNome: org?.nome,
          };
        } catch {
          enriched.organizacao = {
            id: data.organizacaoId,
            nome: "Organização",
          };
        }
      }

      setQuadro(enriched);
      setArquivadoInicial(
        Boolean(enriched.arquivadoEm ?? enriched.arquivado)
      );
    } catch (error) {
      setErro(
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível carregar o quadro."
      );
      setQuadro(null);
    } finally {
      setLoading(false);
    }
  }, [quadroId]);

  useEffect(() => {
    carregarQuadro();
  }, [carregarQuadro]);

  const initialFormValues = useMemo(() => {
    if (!quadro) return {};
    return {
      nome: quadro.nome || "",
      descricao: quadro.descricao || "",
      visibilidade: quadro.visibilidade || "privado",
      arquivado: Boolean(quadro.arquivadoEm ?? quadro.arquivado),
    };
  }, [quadro]);

  async function handleSubmitForm(payload) {
    if (!quadroId) return;

    setSalvando(true);
    try {
      await quadroService.atualizar(quadroId, {
        nome: payload.nome,
        descricao: payload.descricao,
        visibilidade: payload.visibilidade,
      });

      if (payload.arquivado !== arquivadoInicial) {
        if (payload.arquivado) {
          await quadroService.arquivar(quadroId);
        } else {
          await quadroService.desarquivar(quadroId);
        }
        setArquivadoInicial(payload.arquivado);
      }

      await carregarQuadro();
    } finally {
      setSalvando(false);
    }
  }

  function handleAbrirPapeis() {
    navigate(`/quadros/${quadroId}/papeis`);
  }

  function handleAbrirMembros() {
    navigate(`/quadros/${quadroId}/membros`);
  }

  function handleAbrirQuadro() {
    navigate(`/quadros/${quadroId}`);
  }

  if (loading && !quadro) {
    return (
      <AppLayout
        title="Configurações do quadro"
        subtitle="Carregando…"
        breadcrumbItems={[
          { label: "Início", href: "/home" },
          { label: "Quadros", href: "/quadros" },
          { label: "…" },
        ]}
        user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      >
        <LoadingState title="Carregando quadro" />
      </AppLayout>
    );
  }

  if (erro || !quadro) {
    return (
      <AppLayout
        title="Configurações do quadro"
        subtitle="Erro ao carregar"
        breadcrumbItems={[
          { label: "Início", href: "/home" },
          { label: "Quadros", href: "/quadros" },
        ]}
        user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      >
        <ErrorState
          title="Quadro não encontrado"
          description={erro || "Não foi possível exibir este quadro."}
          action={
            <Button variant="primary" onClick={() => navigate("/quadros")}>
              Voltar aos quadros
            </Button>
          }
        />
      </AppLayout>
    );
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
      user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
    >
      <div className="quadro-configuracoes-page">
        <PageHeader
          title="Configurações do quadro"
          description="Centralize aqui os ajustes estruturais do quadro. Permissões, membros e regras de fluxo devem ser administrados em seus módulos próprios."
          actions={
            <>
              <Button variant="secondary" onClick={handleAbrirQuadro}>
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
              <strong>
                {quadro.organizacao?.nome || quadro.organizacaoNome || "—"}
              </strong>
              . Nesta área, o foco está em identidade, descrição e estado do
              quadro.
            </p>
          </div>
        </section>

        <div className="quadro-configuracoes-page__form">
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
              <QuadroForm
                modo="editar"
                formId="quadro-configuracoes-form"
                initialValues={initialFormValues}
                loading={salvando}
                showArquivado
                submitLabel="Salvar alterações"
                onSubmit={handleSubmitForm}
              />
            </div>
          </section>

          <section className="quadro-configuracoes-page__section">
            <div className="quadro-configuracoes-page__section-header">
              <h3 className="quadro-configuracoes-page__section-title">
                <Archive size={18} aria-hidden="true" />
                <span>Preferências pessoais</span>
              </h3>
              <p className="quadro-configuracoes-page__section-description">
                Opções de exibição aplicadas só ao seu usuário neste quadro.
              </p>
            </div>

            <QuadroPreferenciasForm quadroId={quadroId} usuarioId={usuarioId} />
          </section>

          <section className="quadro-configuracoes-page__section">
            <div className="quadro-configuracoes-page__section-header">
              <h3 className="quadro-configuracoes-page__section-title">
                <ShieldCheck size={18} aria-hidden="true" />
                <span>Domínios relacionados</span>
              </h3>
              <p className="quadro-configuracoes-page__section-description">
                Controles que ficam em módulos próprios.
              </p>
            </div>

            <div className="quadro-configuracoes-page__card quadro-configuracoes-page__card--related">
              <div className="quadro-configuracoes-page__related-list">
                <div className="quadro-configuracoes-page__related-item">
                  <div className="quadro-configuracoes-page__related-text">
                    <strong>Papéis e permissões</strong>
                    <span>
                      Controle responsabilidades e permissões por papel.
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
                      Gerencie vínculos de usuários e associação com papéis.
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
                      Regras entre listas serão tratadas no módulo de listas.
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    disabled
                    leftIcon={<ArrowRightLeft size={16} />}
                  >
                    Em evolução
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
