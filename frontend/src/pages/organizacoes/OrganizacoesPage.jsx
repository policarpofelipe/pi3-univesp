import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Plus } from "lucide-react";

import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import Button from "../../components/ui/Button";
import OrganizacaoCard from "../../components/organizacoes/OrganizacaoCard";
import { listarOrganizacoes } from "../../services/organizacaoService";

import "../../styles/pages/organizacoes.css";

/*
Decisão de arquitetura:
- esta página apenas orquestra estado e composição
- listagem vem do service
- renderiza loading / error / empty / success
- não mistura criação/edição dentro da listagem
- sidebar e navegação global ficam no AppLayout
*/

const currentUser = {
  name: "Usuário",
};

export default function OrganizacoesPage() {
  const navigate = useNavigate();

  const [organizacoes, setOrganizacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const carregarOrganizacoes = useCallback(async () => {
    setLoading(true);
    setErro("");

    try {
      const response = await listarOrganizacoes();

      /*
      Compatibilidade defensiva:
      aceita tanto:
      - { success, data: [...] }
      - [...]
      */
      const data = Array.isArray(response) ? response : response?.data;

      setOrganizacoes(Array.isArray(data) ? data : []);
    } catch (error) {
      setErro(error?.message || "Não foi possível carregar as organizações.");
      setOrganizacoes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarOrganizacoes();
  }, [carregarOrganizacoes]);

  function handleNovaOrganizacao() {
    console.log("Abrir fluxo de criação de organização");
  }

  function handleAbrirOrganizacao(id) {
    navigate(`/organizacoes/${id}`);
  }

  function handleEditarOrganizacao(id) {
    console.log("Editar organização:", id);
  }

  return (
    <AppLayout
      title="Organizações"
      subtitle="Gerencie organizações e acesse seus ambientes de trabalho"
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Organizações" },
      ]}
      user={currentUser}
      topbarActions={
        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={handleNovaOrganizacao}
        >
          Nova organização
        </Button>
      }
    >
      <div className="organizacoes-page">
        <PageHeader
          title="Organizações"
          description="Visualize, crie e administre as organizações às quais você pertence."
          actions={
            <Button
              variant="primary"
              leftIcon={<Plus size={16} />}
              onClick={handleNovaOrganizacao}
            >
              Nova organização
            </Button>
          }
        />

        {loading ? (
          <LoadingState
            title="Carregando organizações"
            description="Buscando as organizações disponíveis para o usuário autenticado."
            fullHeight
          />
        ) : erro ? (
          <ErrorState
            title="Falha ao carregar organizações"
            description={erro}
            action={
              <Button variant="danger" onClick={carregarOrganizacoes}>
                Tentar novamente
              </Button>
            }
          />
        ) : organizacoes.length === 0 ? (
          <EmptyState
            icon={<Building2 size={32} />}
            title="Nenhuma organização encontrada"
            description="Você ainda não participa de nenhuma organização. Crie uma nova para começar a estruturar quadros, membros e permissões."
            action={
              <Button
                variant="primary"
                leftIcon={<Plus size={16} />}
                onClick={handleNovaOrganizacao}
              >
                Criar organização
              </Button>
            }
          />
        ) : (
          <section
            aria-label="Lista de organizações"
            className="organizacoes-page__grid"
          >
            {organizacoes.map((organizacao) => (
              <OrganizacaoCard
                key={organizacao.id}
                organizacao={organizacao}
                onOpen={handleAbrirOrganizacao}
                onEdit={handleEditarOrganizacao}
              />
            ))}
          </section>
        )}
      </div>
    </AppLayout>
  );
}
