import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Building2, Pencil, Settings, Users } from "lucide-react";

import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import OrganizacaoForm from "../../components/organizacoes/OrganizacaoForm";
import {
  buscarOrganizacaoPorId,
  atualizarOrganizacao,
} from "../../services/organizacaoService";

import "../../styles/pages/organizacao-detalhe.css";

/*
Premissa:
- esta página mostra o detalhe institucional da organização
- não deve concentrar edição pesada nem gestão de membros inteira
- funciona como hub para:
  - dados gerais
  - membros
  - configurações
*/

const currentUser = {
  name: "Usuário",
};

function StatCard({ label, value }) {
  return (
    <div className="organizacao-detalhe-page__stat-card">
      <p className="organizacao-detalhe-page__stat-label">{label}</p>
      <p className="organizacao-detalhe-page__stat-value">{value}</p>
    </div>
  );
}

export default function OrganizacaoDetalhePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { organizacaoId } = useParams();

  const [organizacao, setOrganizacao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  const carregarOrganizacao = useCallback(async () => {
    if (!organizacaoId) {
      setErro("ID da organização não informado na rota.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const response = await buscarOrganizacaoPorId(organizacaoId);

      /*
      Compatibilidade defensiva:
      aceita:
      - { success, data: {...} }
      - {...}
      */
      const data =
        response && !Array.isArray(response) && "data" in response
          ? response.data
          : response;

      setOrganizacao(data || null);
    } catch (error) {
      setErro(
        error?.message || "Não foi possível carregar os dados da organização."
      );
      setOrganizacao(null);
    } finally {
      setLoading(false);
    }
  }, [organizacaoId]);

  useEffect(() => {
    carregarOrganizacao();
  }, [carregarOrganizacao]);

  useEffect(() => {
    if (!organizacao || loading) return;
    if (!location.state?.editarOrganizacao) return;
    setModalEditarAberto(true);
    navigate(`/organizacoes/${organizacaoId}`, { replace: true });
  }, [organizacao, loading, location.state, navigate, organizacaoId]);

  const valoresIniciaisFormulario = useMemo(() => {
    if (!organizacao) return null;
    return {
      nome: organizacao.nome ?? "",
      slug: organizacao.slug ?? "",
      descricao: organizacao.descricao ?? "",
      ativo: organizacao.ativo !== false,
    };
  }, [organizacao]);

  function handleVoltar() {
    navigate(-1);
  }

  function handleVoltarParaOrganizacoes() {
    navigate("/organizacoes");
  }

  function handleAbrirMembros() {
    if (!organizacao?.id) return;
    navigate(`/organizacoes/${organizacao.id}/membros`);
  }

  function handleAbrirConfiguracoes() {
    if (!organizacao?.id) return;
    navigate(`/organizacoes/${organizacao.id}/configuracoes`);
  }

  function handleAbrirQuadros() {
    if (!organizacao?.id) {
      navigate("/quadros");
      return;
    }

    navigate(`/organizacoes/${organizacao.id}/quadros`);
  }

  function handleEditarOrganizacao() {
    if (!organizacao?.id) return;
    setModalEditarAberto(true);
  }

  function handleFecharModalEditar() {
    if (salvandoEdicao) return;
    setModalEditarAberto(false);
  }

  async function handleSalvarEdicaoOrganizacao(values) {
    if (!organizacao?.id) return;
    setSalvandoEdicao(true);
    try {
      const body = await atualizarOrganizacao(organizacao.id, {
        nome: values.nome,
        slug: values.slug,
        descricao: values.descricao,
        ativo: values.ativo,
      });

      const ok = body?.success !== false;
      if (!ok && body?.message) {
        throw new Error(body.message);
      }

      setModalEditarAberto(false);
      await carregarOrganizacao();
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Não foi possível salvar a organização.";
      throw new Error(msg);
    } finally {
      setSalvandoEdicao(false);
    }
  }

  const breadcrumbItems = [
    { label: "Início", href: "/home" },
    { label: "Organizações", href: "/organizacoes" },
    { label: organizacao?.nome || "Detalhe da organização" },
  ];

  return (
    <AppLayout
      title="Detalhe da organização"
      subtitle="Informações gerais e acesso rápido às áreas relacionadas"
      breadcrumbItems={breadcrumbItems}
      user={currentUser}
    >
      <div className="organizacao-detalhe-page">
        {loading ? (
          <LoadingState
            title="Carregando organização"
            description="Buscando detalhes da organização selecionada."
            fullHeight
          />
        ) : erro ? (
          <ErrorState
            title="Falha ao carregar organização"
            description={erro}
            action={
              <Button variant="danger" onClick={carregarOrganizacao}>
                Tentar novamente
              </Button>
            }
            secondaryAction={
              <Button variant="ghost" onClick={handleVoltar}>
                Voltar
              </Button>
            }
          />
        ) : !organizacao ? (
          <EmptyState
            icon={<Building2 size={32} />}
            title="Organização não encontrada"
            description="Não foi possível localizar os dados da organização solicitada."
            action={
              <Button variant="ghost" onClick={handleVoltarParaOrganizacoes}>
                Voltar para organizações
              </Button>
            }
          />
        ) : (
          <>
            <PageHeader
              title={organizacao.nome}
              description={[
                organizacao.slug ? `Slug: ${organizacao.slug}` : null,
                organizacao.descricao ||
                  "Visualize os dados principais da organização e acesse as áreas de gestão relacionadas.",
              ]
                .filter(Boolean)
                .join(" — ")}
              actions={
                <>
                  <Button
                    variant="secondary"
                    leftIcon={<Users size={16} />}
                    onClick={handleAbrirMembros}
                  >
                    Membros
                  </Button>

                  <Button
                    variant="secondary"
                    leftIcon={<Settings size={16} />}
                    onClick={handleAbrirConfiguracoes}
                  >
                    Configurações
                  </Button>

                  <Button
                    variant="primary"
                    leftIcon={<Pencil size={16} />}
                    onClick={handleEditarOrganizacao}
                  >
                    Editar organização
                  </Button>
                </>
              }
            />

            <section
              aria-label="Resumo da organização"
              className="organizacao-detalhe-page__stats"
            >
              <StatCard
                label="Status"
                value={organizacao.ativo ? "Ativa" : "Inativa"}
              />
              <StatCard
                label="Membros"
                value={organizacao.membrosCount ?? 0}
              />
              <StatCard
                label="Quadros"
                value={organizacao.quadrosCount ?? 0}
              />
            </section>

            <section
              aria-label="Informações principais"
              className="organizacao-detalhe-page__content-grid"
            >
              <div className="organizacao-detalhe-page__panel organizacao-detalhe-page__panel--main">
                <h2 className="organizacao-detalhe-page__panel-title">
                  Dados gerais
                </h2>

                <dl className="organizacao-detalhe-page__details">
                  <div className="organizacao-detalhe-page__detail-item">
                    <dt className="organizacao-detalhe-page__detail-label">
                      Nome
                    </dt>
                    <dd className="organizacao-detalhe-page__detail-value">
                      {organizacao.nome}
                    </dd>
                  </div>

                  <div className="organizacao-detalhe-page__detail-item">
                    <dt className="organizacao-detalhe-page__detail-label">
                      Slug
                    </dt>
                    <dd className="organizacao-detalhe-page__detail-value">
                      {organizacao.slug || "Não informado"}
                    </dd>
                  </div>

                  <div className="organizacao-detalhe-page__detail-item organizacao-detalhe-page__detail-item--full">
                    <dt className="organizacao-detalhe-page__detail-label">
                      Descrição
                    </dt>
                    <dd className="organizacao-detalhe-page__detail-value organizacao-detalhe-page__detail-value--muted">
                      {organizacao.descricao || "Sem descrição cadastrada."}
                    </dd>
                  </div>

                  <div className="organizacao-detalhe-page__detail-item">
                    <dt className="organizacao-detalhe-page__detail-label">
                      Criada em
                    </dt>
                    <dd className="organizacao-detalhe-page__detail-value">
                      {organizacao.criado_em ||
                        organizacao.criadoEm ||
                        "Não informado"}
                    </dd>
                  </div>

                  <div className="organizacao-detalhe-page__detail-item">
                    <dt className="organizacao-detalhe-page__detail-label">
                      Atualizada em
                    </dt>
                    <dd className="organizacao-detalhe-page__detail-value">
                      {organizacao.atualizado_em ||
                        organizacao.atualizadoEm ||
                        "Não informado"}
                    </dd>
                  </div>
                </dl>
              </div>

              <aside className="organizacao-detalhe-page__panel organizacao-detalhe-page__panel--side">
                <h2 className="organizacao-detalhe-page__panel-title">
                  Ações rápidas
                </h2>

                <div className="organizacao-detalhe-page__actions">
                  <Button
                    variant="secondary"
                    fullWidth
                    leftIcon={<Users size={16} />}
                    onClick={handleAbrirMembros}
                  >
                    Gerenciar membros
                  </Button>

                  <Button
                    variant="secondary"
                    fullWidth
                    leftIcon={<Settings size={16} />}
                    onClick={handleAbrirConfiguracoes}
                  >
                    Abrir configurações
                  </Button>

                  <Button
                    variant="primary"
                    fullWidth
                    leftIcon={<Building2 size={16} />}
                    onClick={handleAbrirQuadros}
                  >
                    Ver quadros
                  </Button>
                </div>
              </aside>
            </section>

            <Modal
              open={modalEditarAberto}
              title="Editar organização"
              onClose={handleFecharModalEditar}
              closeLabel="Cancelar"
              closeOnBackdrop={!salvandoEdicao}
            >
              {valoresIniciaisFormulario ? (
                <OrganizacaoForm
                  key={`editar-org-${organizacao.id}`}
                  initialValues={valoresIniciaisFormulario}
                  submitLabel="Salvar alterações"
                  cancelLabel="Cancelar"
                  loading={salvandoEdicao}
                  onCancel={handleFecharModalEditar}
                  onSubmit={handleSalvarEdicaoOrganizacao}
                />
              ) : null}
            </Modal>
          </>
        )}
      </div>
    </AppLayout>
  );
}
