import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Building2, Save, Settings } from "lucide-react";

import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import {
  buscarOrganizacaoPorId,
  buscarConfiguracoes,
  atualizarConfiguracoes,
} from "../../services/organizacaoService";

import "../../styles/pages/organizacao-configuracoes.css";

/*
Premissa:
- página focada em preferências/configurações da organização
- não deve acumular gestão de membros ou dados institucionais gerais
- usa formulário simples, desacoplado, com persistência via service
*/

const currentUser = {
  name: "Usuário",
};

function normalizeConfiguracoes(data) {
  return {
    temaPadraoQuadro:
      data?.temaPadraoQuadro || data?.tema_padrao_quadro || "sistema",
    compactacaoPadrao: Boolean(
      data?.compactacaoPadrao ?? data?.compactacao_padrao ?? false
    ),
    permitirConvites: Boolean(
      data?.permitirConvites ?? data?.permitir_convites ?? true
    ),
    visibilidadePadraoQuadros:
      data?.visibilidadePadraoQuadros ||
      data?.visibilidade_padrao_quadros ||
      "privado",
  };
}

export default function OrganizacaoConfiguracoesPage() {
  const navigate = useNavigate();
  const { organizacaoId } = useParams();

  const [organizacao, setOrganizacao] = useState(null);
  const [configuracoes, setConfiguracoes] = useState(
    normalizeConfiguracoes({})
  );

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [saving, setSaving] = useState(false);
  const [sucesso, setSucesso] = useState("");

  const carregarDados = useCallback(async () => {
    if (!organizacaoId) {
      setErro("ID da organização não informado na rota.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErro("");
    setSucesso("");

    try {
      const [organizacaoResponse, configuracoesResponse] = await Promise.all([
        buscarOrganizacaoPorId(organizacaoId),
        buscarConfiguracoes(organizacaoId),
      ]);

      const organizacaoData =
        organizacaoResponse &&
        !Array.isArray(organizacaoResponse) &&
        "data" in organizacaoResponse
          ? organizacaoResponse.data
          : organizacaoResponse;

      const configuracoesData =
        configuracoesResponse &&
        !Array.isArray(configuracoesResponse) &&
        "data" in configuracoesResponse
          ? configuracoesResponse.data
          : configuracoesResponse;

      setOrganizacao(organizacaoData || null);
      setConfiguracoes(normalizeConfiguracoes(configuracoesData || {}));
    } catch (error) {
      setErro(
        error?.message ||
          "Não foi possível carregar as configurações da organização."
      );
      setOrganizacao(null);
    } finally {
      setLoading(false);
    }
  }, [organizacaoId]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setConfiguracoes((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setErro("");
    setSucesso("");

    try {
      await atualizarConfiguracoes(organizacaoId, configuracoes);
      setSucesso("Configurações atualizadas com sucesso.");
    } catch (error) {
      setErro(error?.message || "Não foi possível salvar as configurações.");
    } finally {
      setSaving(false);
    }
  }

  function handleVoltar() {
    navigate(-1);
  }

  function handleVoltarParaOrganizacoes() {
    navigate("/organizacoes");
  }

  function handleVerOrganizacao() {
    if (!organizacao?.id) return;
    navigate(`/organizacoes/${organizacao.id}`);
  }

  const breadcrumbItems = [
    { label: "Início", href: "/home" },
    { label: "Organizações", href: "/organizacoes" },
    ...(organizacao?.id
      ? [{ label: organizacao.nome, href: `/organizacoes/${organizacao.id}` }]
      : []),
    { label: "Configurações" },
  ];

  return (
    <AppLayout
      title="Configurações da organização"
      subtitle="Preferências institucionais e comportamento padrão"
      breadcrumbItems={breadcrumbItems}
      user={currentUser}
    >
      <div className="organizacao-configuracoes-page">
        {loading ? (
          <LoadingState
            title="Carregando configurações"
            description="Buscando preferências e dados da organização."
            fullHeight
          />
        ) : erro && !organizacao ? (
          <ErrorState
            title="Falha ao carregar configurações"
            description={erro}
            action={
              <Button variant="danger" onClick={carregarDados}>
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
            icon={<Settings size={32} />}
            title="Organização não encontrada"
            description="Não foi possível localizar a organização associada a esta rota."
            action={
              <Button variant="ghost" onClick={handleVoltarParaOrganizacoes}>
                Voltar para organizações
              </Button>
            }
          />
        ) : (
          <>
            <PageHeader
              title="Configurações"
              subtitle={organizacao.nome}
              description="Defina preferências padrão para quadros e políticas básicas de uso dentro da organização."
              actions={
                <Button
                  variant="secondary"
                  leftIcon={<Building2 size={16} />}
                  onClick={handleVerOrganizacao}
                >
                  Ver organização
                </Button>
              }
            />

            <section
              className="organizacao-configuracoes-page__grid"
              aria-label="Configurações da organização"
            >
              <div className="organizacao-configuracoes-page__panel organizacao-configuracoes-page__panel--main">
                <div className="organizacao-configuracoes-page__panel-header">
                  <Settings
                    size={20}
                    className="organizacao-configuracoes-page__panel-icon"
                    aria-hidden="true"
                  />
                  <h2 className="organizacao-configuracoes-page__panel-title">
                    Preferências gerais
                  </h2>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="organizacao-configuracoes-page__form"
                >
                  <div className="organizacao-configuracoes-page__fields-grid">
                    <div className="organizacao-configuracoes-page__field">
                      <label
                        htmlFor="temaPadraoQuadro"
                        className="organizacao-configuracoes-page__label"
                      >
                        Tema padrão dos quadros
                      </label>
                      <select
                        id="temaPadraoQuadro"
                        name="temaPadraoQuadro"
                        value={configuracoes.temaPadraoQuadro}
                        onChange={handleChange}
                      >
                        <option value="sistema">Seguir sistema</option>
                        <option value="claro">Claro</option>
                        <option value="escuro">Escuro</option>
                      </select>
                    </div>

                    <div className="organizacao-configuracoes-page__field">
                      <label
                        htmlFor="visibilidadePadraoQuadros"
                        className="organizacao-configuracoes-page__label"
                      >
                        Visibilidade padrão dos quadros
                      </label>
                      <select
                        id="visibilidadePadraoQuadros"
                        name="visibilidadePadraoQuadros"
                        value={configuracoes.visibilidadePadraoQuadros}
                        onChange={handleChange}
                      >
                        <option value="privado">Privado</option>
                        <option value="interno">Interno</option>
                        <option value="publico">Público</option>
                      </select>
                    </div>
                  </div>

                  <div className="organizacao-configuracoes-page__options">
                    <label className="organizacao-configuracoes-page__check-card">
                      <input
                        type="checkbox"
                        name="compactacaoPadrao"
                        checked={configuracoes.compactacaoPadrao}
                        onChange={handleChange}
                      />
                      <span className="organizacao-configuracoes-page__check-content">
                        <span className="organizacao-configuracoes-page__check-title">
                          Usar visualização compacta por padrão
                        </span>
                        <span className="organizacao-configuracoes-page__check-description">
                          Define que novos acessos aos quadros desta organização
                          iniciem com densidade visual mais compacta.
                        </span>
                      </span>
                    </label>

                    <label className="organizacao-configuracoes-page__check-card">
                      <input
                        type="checkbox"
                        name="permitirConvites"
                        checked={configuracoes.permitirConvites}
                        onChange={handleChange}
                      />
                      <span className="organizacao-configuracoes-page__check-content">
                        <span className="organizacao-configuracoes-page__check-title">
                          Permitir convites de novos membros
                        </span>
                        <span className="organizacao-configuracoes-page__check-description">
                          Controla se a organização aceita convites e inclusão de
                          novos participantes pelo fluxo padrão.
                        </span>
                      </span>
                    </label>
                  </div>

                  {(erro || sucesso) && (
                    <div
                      className={`organizacao-configuracoes-page__feedback ${
                        erro
                          ? "organizacao-configuracoes-page__feedback--error"
                          : "organizacao-configuracoes-page__feedback--success"
                      }`}
                      role={erro ? "alert" : "status"}
                    >
                      {erro || sucesso}
                    </div>
                  )}

                  <div className="organizacao-configuracoes-page__actions">
                    <Button
                      type="submit"
                      variant="primary"
                      loading={saving}
                      leftIcon={<Save size={16} />}
                    >
                      Salvar configurações
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={carregarDados}
                      disabled={saving}
                    >
                      Recarregar
                    </Button>
                  </div>
                </form>
              </div>

              <aside className="organizacao-configuracoes-page__panel organizacao-configuracoes-page__panel--side">
                <h2 className="organizacao-configuracoes-page__panel-title">
                  Observações
                </h2>

                <ul className="organizacao-configuracoes-page__notes">
                  <li>
                    As preferências aqui definidas representam o comportamento
                    padrão da organização.
                  </li>
                  <li>
                    Preferências individuais de usuário e quadro podem
                    sobrescrever parte dessas definições.
                  </li>
                  <li>
                    Alterações devem ser tratadas como configuração
                    institucional, não como personalização local.
                  </li>
                </ul>
              </aside>
            </section>
          </>
        )}
      </div>
    </AppLayout>
  );
}
