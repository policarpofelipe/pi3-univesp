import React from "react";
import AppLayout from "../components/layout/AppLayout";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import { Building2, Plus } from "lucide-react";

/*
Contexto:
Essa página é estruturalmente mais importante do que parece.

Ela define:
- ponto de entrada real do sistema (após login)
- contexto global (organização ativa)
- transição para quadros

Erro comum:
tratar como "lista simples". Não é.
Aqui começa o escopo multi-tenant (várias organizações por usuário).
*/

export default function SelecaoOrganizacaoPage() {
  // simulação (substituir por API depois)
  const organizacoes = [];

  const hasData = organizacoes.length > 0;

  return (
    <AppLayout
      title="Organizações"
      subtitle="Selecione uma organização para continuar"
      currentPath="/organizacoes"
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Organizações" }
      ]}
      user={{
        name: "Usuário",
        email: "usuario@email.com",
      }}
    >
      <PageHeader
        title="Organizações"
        description="Escolha uma organização para acessar seus quadros e recursos."
        actions={
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Nova organização
          </Button>
        }
      />

      {!hasData ? (
        <EmptyState
          icon={<Building2 className="h-8 w-8" />}
          title="Nenhuma organização encontrada"
          description="Você ainda não faz parte de nenhuma organização. Crie uma nova para começar."
          action={
            <Button
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Criar organização
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {organizacoes.map((org) => (
            <button
              key={org.id}
              className="flex flex-col items-start justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left transition hover:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              onClick={() => {
                // decisão arquitetural:
                // aqui deve definir organização ativa (context/global state)
                // e redirecionar para seleção de quadros
                console.log("Selecionar organização:", org.id);
              }}
            >
              <div>
                <h3 className="text-[var(--font-size-md)] font-semibold text-[var(--color-text)]">
                  {org.nome}
                </h3>
                <p className="mt-1 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
                  {org.descricao || "Sem descrição"}
                </p>
              </div>

              <span className="mt-4 text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
                {org.membrosCount || 0} membros
              </span>
            </button>
          ))}
        </div>
      )}
    </AppLayout>
  );
}