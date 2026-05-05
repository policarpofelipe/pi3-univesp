import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import VisaoForm from "../../components/visoes/VisaoForm";
import useAuth from "../../hooks/useAuth";
import quadroService from "../../services/quadroService";
import visaoService from "../../services/visaoService";
import tagService from "../../services/tagService";
import quadroMembroService from "../../services/quadroMembroService";
import { extractList, extractObject } from "../../utils/apiData";

export default function VisaoFormPage() {
  const navigate = useNavigate();
  const { quadroId, visaoId } = useParams();
  const { usuario } = useAuth();

  const modo = visaoId ? "editar" : "criar";
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [quadro, setQuadro] = useState(null);
  const [visao, setVisao] = useState(null);
  const [tags, setTags] = useState([]);
  const [membros, setMembros] = useState([]);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const [resQuadro, resTags, resMembros] = await Promise.all([
        quadroService.obterPorId(quadroId),
        tagService.listar(quadroId).catch(() => ({ data: [] })),
        quadroMembroService.listar(quadroId).catch(() => ({ data: [] })),
      ]);
      const dataQuadro = extractObject(resQuadro) || resQuadro;
      setQuadro(dataQuadro);
      setTags(extractList(resTags));
      setMembros(extractList(resMembros));

      if (visaoId) {
        const resVisoes = await visaoService.listar(quadroId);
        const lista = extractList(resVisoes);
        const encontrada =
          lista.find((item) => String(item.id) === String(visaoId)) || null;
        setVisao(encontrada);
        if (!encontrada) {
          throw new Error("Visão não encontrada.");
        }
      }
    } catch (error) {
      setErro(
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível carregar o formulário da visão."
      );
    } finally {
      setLoading(false);
    }
  }, [quadroId, visaoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const initialValues = useMemo(() => {
    if (!visao) return {};
    return {
      nome: visao.nome,
      ativa: visao.ativa,
      filtroJson: visao.filtroJson,
    };
  }, [visao]);

  async function handleSubmit(payload) {
    setSalvando(true);
    try {
      if (modo === "criar") {
        await visaoService.criar(quadroId, payload);
      } else {
        await visaoService.atualizar(quadroId, visaoId, payload);
      }
      navigate(`/quadros/${quadroId}/visoes`);
    } finally {
      setSalvando(false);
    }
  }

  if (loading) {
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
        <LoadingState title="Carregando formulário de visão" />
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
          title="Falha ao carregar visão"
          description={erro || "Quadro indisponível."}
          action={
            <Button variant="primary" onClick={() => navigate(`/quadros/${quadroId}/visoes`)}>
              Voltar para visões
            </Button>
          }
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={modo === "criar" ? "Nova visão" : "Editar visão"}
      subtitle={quadro.nome}
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Quadros", href: "/quadros" },
        { label: quadro?.nome || "Quadro", href: `/quadros/${quadroId}` },
        { label: "Visões", href: `/quadros/${quadroId}/visoes` },
        { label: modo === "criar" ? "Nova visão" : "Editar" },
      ]}
      user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
    >
      <div className="space-y-4">
        <PageHeader
          title={modo === "criar" ? "Nova visão" : "Editar visão"}
          description="Configure nome, status e filtros amigáveis da visão."
        />
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <VisaoForm
            modo={modo}
            initialValues={initialValues}
            tags={tags}
            membros={membros}
            loading={salvando}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/quadros/${quadroId}/visoes`)}
          />
        </section>
      </div>
    </AppLayout>
  );
}
