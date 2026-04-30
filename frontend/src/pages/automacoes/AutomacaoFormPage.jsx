import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import AutomacaoForm from "../../components/automacoes/AutomacaoForm";
import useAuth from "../../hooks/useAuth";
import quadroService from "../../services/quadroService";
import listaService from "../../services/listaService";
import automacaoService from "../../services/automacaoService";
import tagService from "../../services/tagService";
import { extractList, extractObject } from "../../utils/apiData";

export default function AutomacaoFormPage() {
  const navigate = useNavigate();
  const { quadroId, automacaoId } = useParams();
  const { usuario } = useAuth();

  const modo = automacaoId ? "editar" : "criar";
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [quadro, setQuadro] = useState(null);
  const [listas, setListas] = useState([]);
  const [automacao, setAutomacao] = useState(null);
  const [tags, setTags] = useState([]);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const [resQuadro, resListas, resTags] = await Promise.all([
        quadroService.obterPorId(quadroId),
        listaService.listar(quadroId).catch(() => ({ data: [] })),
        tagService.listar(quadroId).catch(() => ({ data: [] })),
      ]);
      setQuadro(extractObject(resQuadro) || resQuadro);
      setListas(extractList(resListas));
      setTags(extractList(resTags));

      if (automacaoId) {
        const resAutomacoes = await automacaoService.listar(quadroId);
        const lista = extractList(resAutomacoes);
        const encontrada =
          lista.find((item) => String(item.id) === String(automacaoId)) || null;
        setAutomacao(encontrada);
        if (!encontrada) {
          throw new Error("Automação não encontrada.");
        }
      }
    } catch (error) {
      setErro(
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível carregar o formulário de automação."
      );
    } finally {
      setLoading(false);
    }
  }, [quadroId, automacaoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const initialValues = useMemo(() => {
    if (!automacao) return {};
    return {
      nome: automacao.nome,
      descricao: automacao.descricao,
      gatilho: automacao.gatilho,
      ativo: automacao.ativo,
      executaUmaVezPorCartao: automacao.executaUmaVezPorCartao,
      listaOrigemId: automacao.listaOrigemId,
      listaDestinoId: automacao.listaDestinoId,
      condicoesJson: automacao.condicoesJson,
    };
  }, [automacao]);

  async function handleSubmit(payload) {
    setSalvando(true);
    try {
      if (modo === "criar") {
        await automacaoService.criar(quadroId, payload);
      } else {
        await automacaoService.atualizar(quadroId, automacaoId, payload);
      }
      navigate(`/quadros/${quadroId}/automacoes`);
    } finally {
      setSalvando(false);
    }
  }

  if (loading) {
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
        <LoadingState title="Carregando formulário de automação" />
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
          title="Falha ao carregar automação"
          description={erro || "Quadro indisponível."}
          action={
            <Button variant="primary" onClick={() => navigate(`/quadros/${quadroId}/automacoes`)}>
              Voltar para automações
            </Button>
          }
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={modo === "criar" ? "Nova automação" : "Editar automação"}
      subtitle={quadro.nome}
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Quadros", href: "/quadros" },
        { label: quadro?.nome || "Quadro", href: `/quadros/${quadroId}` },
        { label: "Automações", href: `/quadros/${quadroId}/automacoes` },
        { label: modo === "criar" ? "Nova automação" : "Editar" },
      ]}
      user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
    >
      <div className="space-y-4">
        <PageHeader
          title={modo === "criar" ? "Nova automação" : "Editar automação"}
          description="Defina gatilho, condições e destino da automação."
        />
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <AutomacaoForm
            modo={modo}
            initialValues={initialValues}
            listas={listas}
            tags={tags}
            loading={salvando}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/quadros/${quadroId}/automacoes`)}
          />
        </section>
      </div>
    </AppLayout>
  );
}
