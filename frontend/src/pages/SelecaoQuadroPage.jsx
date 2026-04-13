import React from "react";
import AppLayout from "../components/layout/AppLayout";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import { KanbanSquare, Plus } from "lucide-react";

/*
Contexto:
Esta página fecha o fluxo base:
login -> seleção de organização -> seleção de quadro -> área do quadro

Erro comum:
tratar quadro como detalhe visual.
Não. Quadro é a unidade operacional central do sistema.
É aqui que o usuário entra no domínio real de listas, cartões, permissões e automações.
*/

export default function SelecaoQuadroPage() {
  // simulação inicial; substituir por dados da API filtrados pela organização ativa
  const organizacaoAtiva = {
    id: 1,
    nome: "Organização Exemplo",
  };

  const quadros = [];

  const hasData = quadros.length > 0;

  function handleSelecionarQuadro(quadroId) {
    // decisão arquitetural:
    // aqui deve definir quadro ativo em contexto/estado global
    // e redirecionar para a rota principal do quadro
    console.log("Selecionar quadro:", quadroId);
  }

  return (
    <AppLayout
      title="Quadros"
      subtitle="Selecione um quadro para continuar"
      currentPath="/quadros"
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Organizações", href: "/organizacoes" },
        { label: "Quadros" },
      ]}
      user={{
        name: "Usuário",
        email: "usuario@email.com",
      }}
    >
      <PageHeader
        title="Quadros"
        subtitle={organizacaoAtiva?.nome || "Organização não selecionada"}
        description="Escolha um quadro para acessar listas, cartões, membros, permissões e automações."
        actions={
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Novo quadro
          </Button>
        }
      />

      {!hasData ? (
        <EmptyState
          icon={<KanbanSquare className="h-8 w-8" />}
          title="Nenhum quadro encontrado"
          description="Esta organização ainda não possui quadros disponíveis. Crie um novo quadro para começar a organizar o trabalho."
          action={
            <Button
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Criar quadro
            </Button>
          }
          secondaryAction={
            <Button variant="ghost">
              Voltar para organizações
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {quadros.map((quadro) => (
            <button
              key={quadro.id}
              type="button"
              onClick={() => handleSelecionarQuadro(quadro.id)}
              className={[
                "group flex min-h-[180px] flex-col justify-between rounded-xl border",
                "border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left",
                "transition-all duration-150",
                "hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-sm)]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2",
              ].join(" ")}
              aria-label={`Selecionar quadro ${quadro.nome}`}
            >
              <div>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-primary)]">
                    <KanbanSquare className="h-5 w-5" aria-hidden="true" />
                  </div>

                  {quadro.status ? (
                    <span className="rounded-full border border-[var(--color-border)] px-2 py-1 text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
                      {quadro.status}
                    </span>
                  ) : null}
                </div>

                <h3 className="text-[var(--font-size-md)] font-semibold text-[var(--color-text)]">
                  {quadro.nome}
                </h3>

                <p className="mt-2 text-[var(--font-size-sm)] leading-6 text-[var(--color-text-muted)]">
                  {quadro.descricao || "Sem descrição disponível."}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-3">
                <div className="flex flex-col">
                  <span className="text-[var(--font-size-xs)] text-[var(--color-text-soft)]">
                    Membros
                  </span>
                  <span className="text-[var(--font-size-sm)] font-medium text-[var(--color-text)]">
                    {quadro.membrosCount || 0}
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[var(--font-size-xs)] text-[var(--color-text-soft)]">
                    Listas
                  </span>
                  <span className="text-[var(--font-size-sm)] font-medium text-[var(--color-text)]">
                    {quadro.listasCount || 0}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </AppLayout>
  );
}