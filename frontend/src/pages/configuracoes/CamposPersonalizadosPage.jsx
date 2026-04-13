import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";

import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import CampoPersonalizadoForm from "../../components/camposPersonalizados/CampoPersonalizadoForm";
import CampoPersonalizadoList from "../../components/camposPersonalizados/CampoPersonalizadoList";
import useAuth from "../../hooks/useAuth";
import quadroService from "../../services/quadroService";
import campoPersonalizadoService from "../../services/campoPersonalizadoService";
import { extractList, extractObject } from "../../utils/apiData";

export default function CamposPersonalizadosPage() {
  const navigate = useNavigate();
  const { quadroId } = useParams();
  const { usuario } = useAuth();

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [acaoErro, setAcaoErro] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [quadro, setQuadro] = useState(null);
  const [campos, setCampos] = useState([]);
  const [modal, setModal] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const [resQuadro, resCampos] = await Promise.all([
        quadroService.obterPorId(quadroId),
        campoPersonalizadoService.listar(quadroId),
      ]);
      setQuadro(extractObject(resQuadro) || resQuadro);
      setCampos(extractList(resCampos));
    } catch (error) {
      setErro(
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível carregar os campos personalizados."
      );
    } finally {
      setLoading(false);
    }
  }, [quadroId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleSalvar(payload) {
    setSalvando(true);
    setAcaoErro("");
    setSuccessMessage("");
    try {
      if (modal?.mode === "criar") {
        const response = await campoPersonalizadoService.criar(quadroId, payload);
        setSuccessMessage(response?.message || "Campo criado com sucesso.");
      } else if (modal?.mode === "editar" && modal.campo?.id) {
        const response = await campoPersonalizadoService.atualizar(
          quadroId,
          modal.campo.id,
          payload
        );
        setSuccessMessage(response?.message || "Campo atualizado com sucesso.");
      }
      setModal(null);
      await carregar();
    } catch (error) {
      setAcaoErro(
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível salvar o campo."
      );
      throw error;
    } finally {
      setSalvando(false);
    }
  }

  async function handleRemover(campo) {
    if (!window.confirm(`Remover o campo "${campo.nome}"?`)) return;
    setAcaoErro("");
    setSuccessMessage("");
    try {
      const response = await campoPersonalizadoService.remover(quadroId, campo.id);
      setSuccessMessage(response?.message || "Campo removido com sucesso.");
      await carregar();
    } catch (error) {
      setAcaoErro(
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível remover o campo."
      );
    }
  }

  if (loading && !quadro) {
    return (
      <AppLayout
        title="Campos personalizados"
        subtitle="Carregando…"
        breadcrumbItems={[
          { label: "Início", href: "/home" },
          { label: "Quadros", href: "/quadros" },
        ]}
        user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      >
        <LoadingState title="Carregando campos personalizados" />
      </AppLayout>
    );
  }

  if (erro || !quadro) {
    return (
      <AppLayout
        title="Campos personalizados"
        subtitle="Erro"
        breadcrumbItems={[
          { label: "Início", href: "/home" },
          { label: "Quadros", href: "/quadros" },
        ]}
        user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      >
        <ErrorState
          title="Falha ao carregar campos"
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
      title="Campos personalizados"
      subtitle="Estruture metadados dos cartões"
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Quadros", href: "/quadros" },
        { label: quadro?.nome || "Quadro", href: `/quadros/${quadroId}` },
        { label: "Campos personalizados" },
      ]}
      user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
    >
      <div className="space-y-4">
        <PageHeader
          title="Campos personalizados"
          description="Crie campos adicionais para enriquecer os dados dos cartões."
          actions={
            <Button variant="primary" onClick={() => setModal({ mode: "criar", campo: null })}>
              Novo campo
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
        {successMessage ? (
          <p
            className="rounded-lg border border-[var(--color-success-border)] bg-[var(--color-success-surface)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-success-text)]"
            role="status"
          >
            {successMessage}
          </p>
        ) : null}

        {campos.length === 0 ? (
          <EmptyState
            icon={<SlidersHorizontal size={36} />}
            title="Nenhum campo cadastrado"
            description="Crie o primeiro campo personalizado para este quadro."
            action={
              <Button variant="primary" onClick={() => setModal({ mode: "criar", campo: null })}>
                Criar campo
              </Button>
            }
          />
        ) : (
          <CampoPersonalizadoList
            campos={campos}
            onEditar={(campo) => setModal({ mode: "editar", campo })}
            onRemover={handleRemover}
          />
        )}
      </div>

      {modal ? (
        <div
          className="fixed inset-0 z-[1300] flex items-center justify-center bg-[var(--color-scrim)] p-4"
          role="presentation"
          onClick={() => !salvando && setModal(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="campo-modal-titulo"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)]"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              id="campo-modal-titulo"
              className="text-[var(--font-size-heading-3)] font-semibold text-[var(--color-text)]"
            >
              {modal.mode === "criar" ? "Novo campo personalizado" : "Editar campo"}
            </h2>
            <div className="mt-4">
              <CampoPersonalizadoForm
                modo={modal.mode}
                initialValues={modal.campo || {}}
                loading={salvando}
                onSubmit={handleSalvar}
                onCancel={() => !salvando && setModal(null)}
              />
            </div>
          </div>
        </div>
      ) : null}
    </AppLayout>
  );
}
