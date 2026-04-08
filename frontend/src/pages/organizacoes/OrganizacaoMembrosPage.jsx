import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

import "../../styles/pages/organizacao-membros.css";

/*
Premissa:
- página de gestão de membros, não de detalhe geral da organização
- usa tabela para listagem e formulário separado para convite
- mantém estados explícitos: loading, erro, vazio e sucesso
- navegação global fica no AppLayout
*/

const currentUser = {
  name: "Usuário",
};

export default function OrganizacaoMembrosPage() {
  const navigate = useNavigate();
  const { organizacaoId } = useParams();

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
        organizacaoResponse &&
        !Array.isArray(organizacaoResponse) &&
        "data" in organizacaoResponse
          ? organizacaoResponse.data
          : organizacaoResponse;

      const membrosData = Array.isArray(membrosResponse)
        ? membrosResponse
        : membrosResponse?.data;

      setOrganizacao(organizacaoData || null);
      setMembros(Array.isArray(membrosData) ? membrosData : []);
    } catch (error) {
      setErro(
        error?.message || "Não foi possível carregar os membros da organização."
      );
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

  function handleVoltar() {
    navigate(-1);
  }

  function handleIrParaOrganizacoes() {
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
    { label: "Membros" },
  ];

  return (
    <AppLayout
      title="Membros da organização"
      subtitle="Gerencie convites, papéis e participação"
      breadcrumbItems={breadcrumbItems}
      user={currentUser}
    >
      <div className="organizacao-membros-page">
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
              <Button variant="ghost" onClick={handleVoltar}>
                Voltar
              </Button>
            }
          />
        ) : !organizacao ? (
          <EmptyState
            icon={<Users size={32} />}
            title="Organização não encontrada"
            description="Não foi possível localizar a organização associada a esta rota."
            action={
              <Button variant="ghost" onClick={handleIrParaOrganizacoes}>
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
                  leftIcon={<Building2 size={16} />}
                  onClick={handleVerOrganizacao}
                >
                  Ver organização
                </Button>
              }
            />

            <section
              className="organizacao-membros-page__grid"
              aria-label="Gestão de membros da organização"
            >
              <div className="organizacao-membros-page__panel organizacao-membros-page__panel--main">
                <div className="organizacao-membros-page__panel-header">
                  <Users
                    size={20}
                    className="organizacao-membros-page__panel-icon"
                    aria-hidden="true"
                  />
                  <h2 className="organizacao-membros-page__panel-title">
                    Lista de membros
                  </h2>
                </div>

                {membros.length === 0 ? (
                  <EmptyState
                    compact
                    icon={<Users size={24} />}
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

              <aside className="organizacao-membros-page__panel organizacao-membros-page__panel--side">
                <div className="organizacao-membros-page__panel-header">
                  <MailPlus
                    size={20}
                    className="organizacao-membros-page__panel-icon"
                    aria-hidden="true"
                  />
                  <h2 className="organizacao-membros-page__panel-title">
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
      </div>
    </AppLayout>
  );
}
