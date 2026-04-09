import React, { useCallback, useEffect, useState } from "react";
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

/*
Premissa:
- página focada em preferências/configurações da organização
- não deve acumular gestão de membros ou dados institucionais gerais
- usa formulário simples, desacoplado, com persistência via service

Observação:
- quando o roteamento estiver consolidado, trocar extração manual por useParams()
*/

const sidebarItems = [];

const sidebarGroups = [
  {
    key: "estrutura",
    label: "Estrutura",
    sectionLabel: "Workspace",
    items: [
      {
        key: "organizacoes",
        label: "Organizações",
        href: "/organizacoes",
        icon: Building2,
      },
    ],
  },
];

function extrairOrganizacaoIdDaUrl() {
  const partes = window.location.pathname.split("/").filter(Boolean);
  const indice = partes.findIndex((parte) => parte === "organizacoes");
  const valor = indice >= 0 ? partes[indice + 1] : null;
  return valor || null;
}

function normalizeConfiguracoes(data) {
  return {
    temaPadraoQuadro: data?.temaPadraoQuadro || data?.tema_padrao_quadro || "sistema",
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
  const organizacaoId = extrairOrganizacaoIdDaUrl();

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
        organizacaoResponse && !Array.isArray(organizacaoResponse) && "data" in organizacaoResponse
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
      setErro(error?.message || "Não foi possível carregar as configurações da organização.");
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
      currentPath="/organizacoes"
      sidebarItems={sidebarItems}
      sidebarGroups={sidebarGroups}
      breadcrumbItems={breadcrumbItems}
      user={{
        name: "Usuário",
        email: "usuario@email.com",
      }}
    >
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
            <Button variant="ghost" onClick={() => window.history.back()}>
              Voltar
            </Button>
          }
        />
      ) : !organizacao ? (
        <EmptyState
          icon={<Settings className="h-8 w-8" />}
          title="Organização não encontrada"
          description="Não foi possível localizar a organização associada a esta rota."
          action={
            <Button
              variant="ghost"
              onClick={() => (window.location.href = "/organizacoes")}
            >
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
                leftIcon={<Building2 className="h-4 w-4" />}
                onClick={() => (window.location.href = `/organizacoes/${organizacao.id}`)}
              >
                Ver organização
              </Button>
            }
          />

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <div className="mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-[var(--color-primary)]" aria-hidden="true" />
                <h2 className="text-[var(--font-size-lg)] font-semibold text-[var(--color-text)]">
                  Preferências gerais
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="temaPadraoQuadro"
                      className="mb-2 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
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

                  <div>
                    <label
                      htmlFor="visibilidadePadraoQuadros"
                      className="mb-2 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
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

                <div className="space-y-4">
                  <label className="flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-3">
                    <input
                      type="checkbox"
                      name="compactacaoPadrao"
                      checked={configuracoes.compactacaoPadrao}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4"
                    />
                    <span>
                      <span className="block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]">
                        Usar visualização compacta por padrão
                      </span>
                      <span className="mt-1 block text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
                        Define que novos acessos aos quadros desta organização iniciem com densidade visual mais compacta.
                      </span>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-3">
                    <input
                      type="checkbox"
                      name="permitirConvites"
                      checked={configuracoes.permitirConvites}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4"
                    />
                    <span>
                      <span className="block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]">
                        Permitir convites de novos membros
                      </span>
                      <span className="mt-1 block text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
                        Controla se a organização aceita convites e inclusão de novos participantes pelo fluxo padrão.
                      </span>
                    </span>
                  </label>
                </div>

                {(erro || sucesso) && (
                  <div
                    className={`rounded-lg border px-4 py-3 text-[var(--font-size-sm)] ${
                      erro
                        ? "border-[var(--color-danger-border)] bg-[var(--color-danger-surface)] text-[var(--color-danger-text)]"
                        : "border-[var(--color-success-border)] bg-[var(--color-success-surface)] text-[var(--color-success-text)]"
                    }`}
                    role={erro ? "alert" : "status"}
                  >
                    {erro || sucesso}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={saving}
                    leftIcon={<Save className="h-4 w-4" />}
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

            <aside className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <h2 className="text-[var(--font-size-lg)] font-semibold text-[var(--color-text)]">
                Observações
              </h2>

              <ul className="mt-4 space-y-3 text-[var(--font-size-sm)] leading-6 text-[var(--color-text-muted)]">
                <li>
                  As preferências aqui definidas representam o comportamento padrão da organização.
                </li>
                <li>
                  Preferências individuais de usuário e quadro podem sobrescrever parte dessas definições.
                </li>
                <li>
                  Alterações devem ser tratadas como configuração institucional, não como personalização local.
                </li>
              </ul>
            </aside>
          </section>
        </>
      )}
    </AppLayout>
  );
}