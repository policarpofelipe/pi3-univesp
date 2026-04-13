import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Bot } from "lucide-react";

import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import AutomacaoList from "../../components/automacoes/AutomacaoList";
import ExecucaoAutomacaoList from "../../components/automacoes/ExecucaoAutomacaoList";
import useAuth from "../../hooks/useAuth";
import quadroService from "../../services/quadroService";
import automacaoService from "../../services/automacaoService";
import { extractList, extractObject } from "../../utils/apiData";

export default function AutomacoesPage() {
  const navigate = useNavigate();
  const { quadroId } = useParams();
  const { usuario } = useAuth();

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [acaoErro, setAcaoErro] = useState("");
  const [quadro, setQuadro] = useState(null);
  const [automacoes, setAutomacoes] = useState([]);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const [resQuadro, resAutomacoes] = await Promise.all([
        quadroService.obterPorId(quadroId),
        automacaoService.listar(quadroId),
      ]);
      setQuadro(extractObject(resQuadro) || resQuadro);
      setAutomacoes(extractList(resAutomacoes));
    } catch (error) {
      setErro(
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível carregar as automações."
      );
    } finally {
      setLoading(false);
    }
  }, [quadroId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleRemover(automacao) {
    if (!window.confirm(`Remover a automação "${automacao.nome}"?`)) return;
    setAcaoErro("");
    try {
      await automacaoService.remover(quadroId, automacao.id);
      await carregar();
    } catch (error) {
      setAcaoErro(
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível remover a automação."
      );
    }
  }

  if (loading && !quadro) {
    return (
      <AppLayout
        title="Automações"
        subtitle="Carregando…"
        breadcrumbItems={[
          { label: "Início", href: "/home" },
          { label: "Quadros", href: "/quadros" },
        ]}
        user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      >
        <LoadingState title="Carregando automações" />
      </AppLayout>
    );
  }

  if (erro || !quadro) {
    return (
      <AppLayout
        title="Automações"
        subtitle="Erro"
        breadcrumbItems={[
          { label: "Início", href: "/home" },
          { label: "Quadros", href: "/quadros" },
        ]}
        user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      >
        <ErrorState
          title="Falha ao carregar automações"
          description={erro || "Quadro não encontrado."}
          action={
            <Button variant="primary" onClick={() => navigate(`/quadros/${quadroId}`)}>
              Voltar ao quadro
            </Button>
          }
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Automações"
      subtitle="Regras automáticas do quadro"
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Quadros", href: "/quadros" },
        { label: quadro?.nome || "Quadro", href: `/quadros/${quadroId}` },
        { label: "Automações" },
      ]}
      user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
    >
      <div className="space-y-4">
        <PageHeader
          title="Automações"
          description="Crie regras para executar ações automaticamente no fluxo."
          actions={
            <Button
              variant="primary"
              onClick={() => navigate(`/quadros/${quadroId}/automacoes/nova`)}
            >
              Nova automação
            </Button>
          }
        />

        {acaoErro ? (
          <p
            className="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-surface)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-danger-text)]"
            role="alert"
          >
            {acaoErro}
          </p>
        ) : null}

        {automacoes.length === 0 ? (
          <EmptyState
            icon={<Bot size={36} />}
            title="Nenhuma automação cadastrada"
            description="Crie a primeira automação para este quadro."
            action={
              <Button
                variant="primary"
                onClick={() => navigate(`/quadros/${quadroId}/automacoes/nova`)}
              >
                Criar automação
              </Button>
            }
          />
        ) : (
          <AutomacaoList
            automacoes={automacoes}
            onEditar={(automacao) =>
              navigate(`/quadros/${quadroId}/automacoes/${automacao.id}/editar`)
            }
            onRemover={handleRemover}
          />
        )}

        <ExecucaoAutomacaoList automacoes={automacoes} />
      </div>
    </AppLayout>
  );
}
