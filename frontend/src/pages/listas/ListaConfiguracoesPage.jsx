import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Settings, ShieldCheck, ArrowRightLeft } from "lucide-react";

import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import useAuth from "../../hooks/useAuth";
import quadroService from "../../services/quadroService";
import listaService from "../../services/listaService";
import { extractObject } from "../../utils/apiData";

export default function ListaConfiguracoesPage() {
  const navigate = useNavigate();
  const { quadroId, listaId } = useParams();
  const { usuario } = useAuth();

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [quadro, setQuadro] = useState(null);
  const [lista, setLista] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const [resQuadro, resLista] = await Promise.all([
        quadroService.obterPorId(quadroId),
        listaService.obterPorId(quadroId, listaId),
      ]);
      setQuadro(extractObject(resQuadro) || resQuadro);
      setLista(extractObject(resLista) || resLista);
    } catch (error) {
      setErro(
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível carregar as configurações da lista."
      );
    } finally {
      setLoading(false);
    }
  }, [quadroId, listaId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  if (loading && !lista) {
    return (
      <AppLayout
        title="Configurações da lista"
        subtitle="Carregando…"
        breadcrumbItems={[
          { label: "Início", href: "/home" },
          { label: "Quadros", href: "/quadros" },
        ]}
        user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      >
        <LoadingState title="Carregando configurações da lista" />
      </AppLayout>
    );
  }

  if (erro || !lista) {
    return (
      <AppLayout
        title="Configurações da lista"
        subtitle="Erro"
        breadcrumbItems={[
          { label: "Início", href: "/home" },
          { label: "Quadros", href: "/quadros" },
        ]}
        user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      >
        <ErrorState
          title="Falha ao carregar lista"
          description={erro || "Lista não encontrada."}
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
      title="Configurações da lista"
      subtitle="Permissões e transições desta lista"
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Quadros", href: "/quadros" },
        { label: quadro?.nome || "Quadro", href: `/quadros/${quadroId}` },
        { label: lista?.nome || "Lista" },
      ]}
      user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
    >
      <div className="space-y-4">
        <PageHeader
          title={lista.nome}
          description="Centralize regras de acesso por papel e transições permitidas de saída desta lista."
          actions={
            <Button variant="secondary" onClick={() => navigate(`/quadros/${quadroId}`)}>
              Ver quadro
            </Button>
          }
        />

        <section className="grid gap-3 md:grid-cols-2">
          <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <h2 className="mb-2 flex items-center gap-2 text-[var(--font-size-heading-4)] font-semibold text-[var(--color-text)]">
              <ShieldCheck size={18} />
              Permissões por papel
            </h2>
            <p className="mb-3 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
              Defina quais papéis podem ver, editar e enviar cartões para esta lista.
            </p>
            <Button
              variant="primary"
              onClick={() =>
                navigate(`/quadros/${quadroId}/listas/${listaId}/permissoes`)
              }
            >
              Abrir permissões
            </Button>
          </article>

          <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <h2 className="mb-2 flex items-center gap-2 text-[var(--font-size-heading-4)] font-semibold text-[var(--color-text)]">
              <ArrowRightLeft size={18} />
              Regras de transição
            </h2>
            <p className="mb-3 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
              Controle para quais listas esta lista pode enviar cartões e quais papéis podem executar.
            </p>
            <Button
              variant="primary"
              onClick={() =>
                navigate(`/quadros/${quadroId}/listas/${listaId}/transicoes`)
              }
            >
              Abrir transições
            </Button>
          </article>
        </section>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
          <span className="inline-flex items-center gap-2">
            <Settings size={14} />
            Ajustes avançados de lista serão adicionados nas próximas etapas.
          </span>
        </div>
      </div>
    </AppLayout>
  );
}
