import React, { useCallback, useEffect, useState } from "react";
import { Building2, Pencil, Settings, Users } from "lucide-react";

import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import { buscarOrganizacaoPorId } from "../../services/organizacaoService";

/*
Premissa:
- esta página mostra o detalhe institucional da organização
- não deve concentrar edição pesada nem gestão de membros inteira
- funciona como hub para:
  - dados gerais
  - membros
  - configurações

Observação:
- aqui estou assumindo uso com react-router via window.location.pathname
- quando a camada de roteamento estiver consolidada, substitua a obtenção do id
  por useParams()
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

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <p className="text-[var(--font-size-xs)] uppercase tracking-wide text-[var(--color-text-soft)]">
        {label}
      </p>
      <p className="mt-2 text-[var(--font-size-xl)] font-semibold text-[var(--color-text)]">
        {value}
      </p>
    </div>
  );
}

export default function OrganizacaoDetalhePage() {
  const organizacaoId = extrairOrganizacaoIdDaUrl();

  const [organizacao, setOrganizacao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

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
      setErro(error?.message || "Não foi possível carregar os dados da organização.");
      setOrganizacao(null);
    } finally {
      setLoading(false);
    }
  }, [organizacaoId]);

  useEffect(() => {
    carregarOrganizacao();
  }, [carregarOrganizacao]);

  const breadcrumbItems = [
    { label: "Início", href: "/home" },
    { label: "Organizações", href: "/organizacoes" },
    { label: organizacao?.nome || "Detalhe da organização" },
  ];

  return (
    <AppLayout
      title="Detalhe da organização"
      subtitle="Informações gerais e acesso rápido às áreas relacionadas"
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
            <Button variant="ghost" onClick={() => window.history.back()}>
              Voltar
            </Button>
          }
        />
      ) : !organizacao ? (
        <EmptyState
          icon={<Building2 className="h-8 w-8" />}
          title="Organização não encontrada"
          description="Não foi possível localizar os dados da organização solicitada."
          action={
            <Button variant="ghost" onClick={() => (window.location.href = "/organizacoes")}>
              Voltar para organizações
            </Button>
          }
        />
      ) : (
        <>
          <PageHeader
            title={organizacao.nome}
            subtitle={organizacao.slug ? `Slug: ${organizacao.slug}` : "Organização ativa"}
            description={
              organizacao.descricao ||
              "Visualize os dados principais da organização e acesse as áreas de gestão relacionadas."
            }
            actions={
              <>
                <Button
                  variant="secondary"
                  leftIcon={<Users className="h-4 w-4" />}
                  onClick={() =>
                    (window.location.href = `/organizacoes/${organizacao.id}/membros`)
                  }
                >
                  Membros
                </Button>

                <Button
                  variant="ghost"
                  leftIcon={<Settings className="h-4 w-4" />}
                  onClick={() =>
                    (window.location.href = `/organizacoes/${organizacao.id}/configuracoes`)
                  }
                >
                  Configurações
                </Button>

                <Button
                  variant="primary"
                  leftIcon={<Pencil className="h-4 w-4" />}
                  onClick={() => {
                    console.log("Abrir edição da organização:", organizacao.id);
                  }}
                >
                  Editar organização
                </Button>
              </>
            }
          />

          <section
            aria-label="Resumo da organização"
            className="grid grid-cols-1 gap-4 md:grid-cols-3"
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
            className="grid grid-cols-1 gap-4 xl:grid-cols-3"
          >
            <div className="xl:col-span-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <h2 className="text-[var(--font-size-lg)] font-semibold text-[var(--color-text)]">
                Dados gerais
              </h2>

              <dl className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <dt className="text-[var(--font-size-xs)] uppercase tracking-wide text-[var(--color-text-soft)]">
                    Nome
                  </dt>
                  <dd className="mt-1 text-[var(--font-size-md)] text-[var(--color-text)]">
                    {organizacao.nome}
                  </dd>
                </div>

                <div>
                  <dt className="text-[var(--font-size-xs)] uppercase tracking-wide text-[var(--color-text-soft)]">
                    Slug
                  </dt>
                  <dd className="mt-1 text-[var(--font-size-md)] text-[var(--color-text)]">
                    {organizacao.slug || "Não informado"}
                  </dd>
                </div>

                <div className="md:col-span-2">
                  <dt className="text-[var(--font-size-xs)] uppercase tracking-wide text-[var(--color-text-soft)]">
                    Descrição
                  </dt>
                  <dd className="mt-1 text-[var(--font-size-md)] leading-6 text-[var(--color-text-muted)]">
                    {organizacao.descricao || "Sem descrição cadastrada."}
                  </dd>
                </div>

                <div>
                  <dt className="text-[var(--font-size-xs)] uppercase tracking-wide text-[var(--color-text-soft)]">
                    Criada em
                  </dt>
                  <dd className="mt-1 text-[var(--font-size-md)] text-[var(--color-text)]">
                    {organizacao.criado_em || organizacao.criadoEm || "Não informado"}
                  </dd>
                </div>

                <div>
                  <dt className="text-[var(--font-size-xs)] uppercase tracking-wide text-[var(--color-text-soft)]">
                    Atualizada em
                  </dt>
                  <dd className="mt-1 text-[var(--font-size-md)] text-[var(--color-text)]">
                    {organizacao.atualizado_em || organizacao.atualizadoEm || "Não informado"}
                  </dd>
                </div>
              </dl>
            </div>

            <aside className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <h2 className="text-[var(--font-size-lg)] font-semibold text-[var(--color-text)]">
                Ações rápidas
              </h2>

              <div className="mt-4 flex flex-col gap-3">
                <Button
                  variant="secondary"
                  fullWidth
                  leftIcon={<Users className="h-4 w-4" />}
                  onClick={() =>
                    (window.location.href = `/organizacoes/${organizacao.id}/membros`)
                  }
                >
                  Gerenciar membros
                </Button>

                <Button
                  variant="ghost"
                  fullWidth
                  leftIcon={<Settings className="h-4 w-4" />}
                  onClick={() =>
                    (window.location.href = `/organizacoes/${organizacao.id}/configuracoes`)
                  }
                >
                  Abrir configurações
                </Button>

                <Button
                  variant="primary"
                  fullWidth
                  leftIcon={<Building2 className="h-4 w-4" />}
                  onClick={() => (window.location.href = "/quadros")}
                >
                  Ver quadros
                </Button>
              </div>
            </aside>
          </section>
        </>
      )}
    </AppLayout>
  );
}