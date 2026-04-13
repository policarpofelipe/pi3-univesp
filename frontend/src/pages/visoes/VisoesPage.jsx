import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Eye } from "lucide-react";

import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import VisaoTabs from "../../components/visoes/VisaoTabs";
import VisaoListaResultados from "../../components/visoes/VisaoListaResultados";
import useAuth from "../../hooks/useAuth";
import quadroService from "../../services/quadroService";
import visaoService from "../../services/visaoService";
import { extractList, extractObject } from "../../utils/apiData";

export default function VisoesPage() {
  const navigate = useNavigate();
  const { quadroId } = useParams();
  const { usuario } = useAuth();

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [quadro, setQuadro] = useState(null);
  const [visoes, setVisoes] = useState([]);
  const [activeVisaoId, setActiveVisaoId] = useState(null);
  const [acaoErro, setAcaoErro] = useState("");

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const [resQuadro, resVisoes] = await Promise.all([
        quadroService.obterPorId(quadroId),
        visaoService.listar(quadroId),
      ]);
      const dataQuadro = extractObject(resQuadro) || resQuadro;
      const lista = extractList(resVisoes);
      setQuadro(dataQuadro);
      setVisoes(lista);
      setActiveVisaoId((prev) => prev || lista[0]?.id || null);
    } catch (error) {
      setErro(
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível carregar as visões."
      );
    } finally {
      setLoading(false);
    }
  }, [quadroId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleRemover(visao) {
    if (!window.confirm(`Remover a visão "${visao.nome}"?`)) return;
    setAcaoErro("");
    try {
      await visaoService.remover(quadroId, visao.id);
      await carregar();
    } catch (error) {
      setAcaoErro(
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível remover a visão."
      );
    }
  }

  if (loading && !quadro) {
    return (
      <AppLayout
        title="Visões"
        subtitle="Carregando…"
        breadcrumbItems={[
          { label: "Início", href: "/home" },
          { label: "Quadros", href: "/quadros" },
        ]}
        user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      >
        <LoadingState title="Carregando visões" />
      </AppLayout>
    );
  }

  if (erro || !quadro) {
    return (
      <AppLayout
        title="Visões"
        subtitle="Erro"
        breadcrumbItems={[
          { label: "Início", href: "/home" },
          { label: "Quadros", href: "/quadros" },
        ]}
        user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      >
        <ErrorState
          title="Falha ao carregar visões"
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
      title="Visões do quadro"
      subtitle="Gerencie visualizações salvas"
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Quadros", href: "/quadros" },
        { label: quadro?.nome || "Quadro", href: `/quadros/${quadroId}` },
        { label: "Visões" },
      ]}
      user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
    >
      <div className="space-y-4">
        <PageHeader
          title="Visões"
          description="Salve filtros para acelerar sua navegação no quadro."
          actions={
            <Button
              variant="primary"
              onClick={() => navigate(`/quadros/${quadroId}/visoes/nova`)}
            >
              Nova visão
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

        {visoes.length === 0 ? (
          <EmptyState
            icon={<Eye size={36} />}
            title="Nenhuma visão cadastrada"
            description="Crie a primeira visão personalizada deste quadro."
            action={
              <Button
                variant="primary"
                onClick={() => navigate(`/quadros/${quadroId}/visoes/nova`)}
              >
                Criar visão
              </Button>
            }
          />
        ) : (
          <>
            <VisaoTabs
              visoes={visoes}
              activeId={activeVisaoId}
              onSelect={(visao) => setActiveVisaoId(visao.id)}
              onCreate={() => navigate(`/quadros/${quadroId}/visoes/nova`)}
            />
            <VisaoListaResultados
              visoes={visoes}
              activeId={activeVisaoId}
              onEditar={(visao) =>
                navigate(`/quadros/${quadroId}/visoes/${visao.id}/editar`)
              }
              onRemover={handleRemover}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}
