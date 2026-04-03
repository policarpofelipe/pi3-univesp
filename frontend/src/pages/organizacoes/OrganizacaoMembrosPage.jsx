import React, { useCallback, useEffect, useState } from "react";
import { Building2, MailPlus, Users } from "lucide-react";

import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import MembroOrganizacaoTable from "../../components/organizacoes/MembroOrganizacaoTable";
import ConviteMembroForm from "../../components/organizacoes/ConviteMembroForm";
import {
  buscarOrganizacaoPorId,
  convidarMembro,
  listarMembrosOrganizacao,
  removerMembro,
  atualizarMembro,
} from "../../services/organizacaoService";

/*
Premissa:
- página de gestão de membros, não de detalhe geral da organização
- usa tabela para listagem e formulário separado para convite
- mantém estados explícitos: loading, erro, vazio e sucesso

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

export default function OrganizacaoMembrosPage() {
  const organizacaoId = extrairOrganizacaoIdDaUrl();

  const [organizacao, setOrganizacao] = useState(null);
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [submittingInvite, setSubmittingInvite] = useState(false);

  const carregarDados = useCallback(async () => {
    if (!organizacaoId) {
      setErro("ID da organização não informado na rota.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const [organizacaoResponse, membrosResponse] = await Promise.all([
        buscarOrganizacaoPorId(organizacaoId),
        listarMembrosOrganizacao(organizacaoId),
      ]);

      const organizacaoData =
        organizacaoResponse && !Array.isArray(organizacaoResponse) && "data" in organizacaoResponse
          ? organizacaoResponse.data
          : organizacaoResponse;

      const membrosData =
        Array.isArray(membrosResponse)
          ? membrosResponse
          : membrosResponse?.data;

      setOrganizacao(organizacaoData || null);
      setMembros(Array.isArray(membrosData) ? membrosData : []);
    } catch (error) {
      setErro(error?.message || "Não foi possível carregar os membros da organização.");
      setOrganizacao(null);
      setMembros([]);
    } finally {
      setLoading(false);
    }
  }, [organizacaoId]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  async function handleConvidarMembro(payload) {
    try {
      setSubmittingInvite(true);
      await convidarMembro(organizacaoId, payload);
      await carregarDados();
    } finally {
      setSubmittingInvite(false);
    }
  }

  async function handleAtualizarMembro(membroId, payload) {
    await atualizarMembro(organizacaoId, membroId, payload);
    await carregarDados();
  }

  async function handleRemoverMembro(membroId) {
    await removerMembro(organizacaoId, membroId);
    await carregarDados();
  }

  const breadcrumbItems = [
    { label: "Início", href: "/home" },
    { label: "Organizações", href: "/organizacoes" },
    ...(organizacao?.id
      ? [{ label: organizacao.nome, href: `/organizacoes/${organizacao.id}` }]
      : []),
    { label: "Membros" },
  ];

  return (
    <AppLayout
      title="Membros da organização"
      subtitle="Gerencie convites, papéis e participação"
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
          title="Carregando membros"
          description="Buscando membros e informações da organização."
          fullHeight
        />
      ) : erro ? (
        <ErrorState
          title="Falha ao carregar membros"
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
          icon={<Users className="h-8 w-8" />}
          title="Organização não encontrada"
          description="Não foi possível localizar a organização associada a esta rota."
          action={
            <Button variant="ghost" onClick={() => (window.location.href = "/organizacoes")}>
              Voltar para organizações
            </Button>
          }
        />
      ) : (
        <>
          <PageHeader
            title="Membros"
            subtitle={organizacao.nome}
            description="Gerencie quem participa da organização, seus papéis e o status de acesso."
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
                <Users className="h-5 w-5 text-[var(--color-primary)]" aria-hidden="true" />
                <h2 className="text-[var(--font-size-lg)] font-semibold text-[var(--color-text)]">
                  Lista de membros
                </h2>
              </div>

              {membros.length === 0 ? (
                <EmptyState
                  compact
                  icon={<Users className="h-6 w-6" />}
                  title="Nenhum membro encontrado"
                  description="Ainda não há membros cadastrados nesta organização além do contexto inicial."
                />
              ) : (
                <MembroOrganizacaoTable
                  membros={membros}
                  onUpdateRole={async (membroId, papel) => {
                    await handleAtualizarMembro(membroId, { papel });
                  }}
                  onUpdateStatus={async (membroId, status) => {
                    await handleAtualizarMembro(membroId, { status });
                  }}
                  onRemove={async (membroId) => {
                    await handleRemoverMembro(membroId);
                  }}
                />
              )}
            </div>

            <aside className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <div className="mb-4 flex items-center gap-2">
                <MailPlus className="h-5 w-5 text-[var(--color-primary)]" aria-hidden="true" />
                <h2 className="text-[var(--font-size-lg)] font-semibold text-[var(--color-text)]">
                  Convidar membro
                </h2>
              </div>

              <ConviteMembroForm
                loading={submittingInvite}
                onSubmit={handleConvidarMembro}
              />
            </aside>
          </section>
        </>
      )}
    </AppLayout>
  );
}