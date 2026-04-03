import React, { useCallback, useEffect, useState } from "react";
import { Building2, Plus } from "lucide-react";

import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import Button from "../../components/ui/Button";
import OrganizacaoCard from "../../components/organizacoes/OrganizacaoCard";
import { listarOrganizacoes } from "../../services/organizacaoService";

/*
Decisão de arquitetura:
- esta página apenas orquestra estado e composição
- listagem vem do service
- renderiza loading / error / empty / success
- não mistura criação/edição dentro da listagem
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

export default function OrganizacoesPage() {
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

  return (
    <AppLayout
      title="Organizações"
      subtitle="Gerencie organizações e acesse seus ambientes de trabalho"
      currentPath="/organizacoes"
      sidebarItems={sidebarItems}
      sidebarGroups={sidebarGroups}
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Organizações" },
      ]}
      user={{
        name: "Usuário",
        email: "usuario@email.com",
      }}
      topbarActions={
        <Button
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => {
            console.log("Abrir fluxo de criação de organização");
          }}
        >
          Nova organização
        </Button>
      }
    >
      <PageHeader
        title="Organizações"
        description="Visualize, crie e administre as organizações às quais você pertence."
        actions={
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => {
              console.log("Abrir fluxo de criação de organização");
            }}
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
          icon={<Building2 className="h-8 w-8" />}
          title="Nenhuma organização encontrada"
          description="Você ainda não participa de nenhuma organização. Crie uma nova para começar a estruturar quadros, membros e permissões."
          action={
            <Button
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => {
                console.log("Abrir fluxo de criação de organização");
              }}
            >
              Criar organização
            </Button>
          }
        />
      ) : (
        <section
          aria-label="Lista de organizações"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {organizacoes.map((organizacao) => (
            <OrganizacaoCard
              key={organizacao.id}
              organizacao={organizacao}
              onOpen={(id) => {
                console.log("Abrir detalhe da organização:", id);
              }}
              onEdit={(id) => {
                console.log("Editar organização:", id);
              }}
            />
          ))}
        </section>
      )}
    </AppLayout>
  );
}