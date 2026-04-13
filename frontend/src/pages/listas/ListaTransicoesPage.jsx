import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRightLeft, Trash2 } from "lucide-react";

import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import ListaTransicoesForm from "../../components/listas/ListaTransicoesForm";
import useAuth from "../../hooks/useAuth";
import quadroService from "../../services/quadroService";
import listaService from "../../services/listaService";
import quadroPapelService from "../../services/quadroPapelService";
import listaTransicaoService from "../../services/listaTransicaoService";
import { extractList, extractObject } from "../../utils/apiData";

export default function ListaTransicoesPage() {
  const navigate = useNavigate();
  const { quadroId, listaId } = useParams();
  const { usuario } = useAuth();

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [acaoErro, setAcaoErro] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [quadro, setQuadro] = useState(null);
  const [lista, setLista] = useState(null);
  const [listas, setListas] = useState([]);
  const [papeis, setPapeis] = useState([]);
  const [regras, setRegras] = useState([]);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const [resQuadro, resLista, resListas, resPapeis, resRegras] = await Promise.all([
        quadroService.obterPorId(quadroId),
        listaService.obterPorId(quadroId, listaId),
        listaService.listar(quadroId),
        quadroPapelService.listar(quadroId),
        listaTransicaoService.listar(quadroId, listaId),
      ]);
      setQuadro(extractObject(resQuadro) || resQuadro);
      setLista(extractObject(resLista) || resLista);
      setListas(extractList(resListas));
      setPapeis(extractList(resPapeis));
      setRegras(extractList(resRegras));
    } catch (error) {
      setErro(
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível carregar as transições da lista."
      );
    } finally {
      setLoading(false);
    }
  }, [quadroId, listaId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const listasDestino = useMemo(
    () => listas.filter((item) => Number(item.id) !== Number(listaId)),
    [listas, listaId]
  );

  async function handleCriarRegra(payload) {
    setSalvando(true);
    setAcaoErro("");
    setSuccessMessage("");
    try {
      const response = await listaTransicaoService.criar(quadroId, listaId, payload);
      setRegras(extractList(response));
      setSuccessMessage(response?.message || "Regra criada com sucesso.");
    } catch (error) {
      setAcaoErro(
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível criar a regra de transição."
      );
      throw error;
    } finally {
      setSalvando(false);
    }
  }

  async function handleRemoverRegra(regraId) {
    if (!window.confirm("Remover esta regra de transição?")) return;
    setAcaoErro("");
    setSuccessMessage("");
    try {
      const response = await listaTransicaoService.remover(quadroId, listaId, regraId);
      setSuccessMessage(response?.message || "Regra removida com sucesso.");
      await carregar();
    } catch (error) {
      setAcaoErro(
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível remover a regra de transição."
      );
    }
  }

  if (loading && !lista) {
    return (
      <AppLayout
        title="Transições da lista"
        subtitle="Carregando…"
        breadcrumbItems={[
          { label: "Início", href: "/home" },
          { label: "Quadros", href: "/quadros" },
        ]}
        user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      >
        <LoadingState title="Carregando transições" />
      </AppLayout>
    );
  }

  if (erro || !lista) {
    return (
      <AppLayout
        title="Transições da lista"
        subtitle="Erro"
        breadcrumbItems={[
          { label: "Início", href: "/home" },
          { label: "Quadros", href: "/quadros" },
        ]}
        user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      >
        <ErrorState
          title="Falha ao carregar transições"
          description={erro || "Lista não encontrada."}
          action={
            <Button
              variant="primary"
              onClick={() =>
                navigate(`/quadros/${quadroId}/listas/${listaId}/configuracoes`)
              }
            >
              Voltar às configurações
            </Button>
          }
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Transições da lista"
      subtitle="Regras de saída para outras listas"
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Quadros", href: "/quadros" },
        { label: quadro?.nome || "Quadro", href: `/quadros/${quadroId}` },
        {
          label: lista?.nome || "Lista",
          href: `/quadros/${quadroId}/listas/${listaId}/configuracoes`,
        },
        { label: "Transições" },
      ]}
      user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
    >
      <div className="space-y-4">
        <PageHeader
          title={`Transições: ${lista.nome}`}
          description="Defina regras de destino para os cartões que saem desta lista."
          actions={
            <Button
              variant="secondary"
              onClick={() =>
                navigate(`/quadros/${quadroId}/listas/${listaId}/configuracoes`)
              }
            >
              Voltar às configurações
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

        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h2 className="mb-3 text-[var(--font-size-heading-4)] font-semibold text-[var(--color-text)]">
            Nova regra de transição
          </h2>
          <ListaTransicoesForm
            listasDestino={listasDestino}
            papeis={papeis}
            loading={salvando}
            onSubmit={handleCriarRegra}
          />
        </section>

        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h2 className="mb-3 text-[var(--font-size-heading-4)] font-semibold text-[var(--color-text)]">
            Regras cadastradas
          </h2>

          {regras.length === 0 ? (
            <EmptyState
              icon={<ArrowRightLeft size={36} />}
              title="Nenhuma regra cadastrada"
              description="Sem regras, o sistema considera transição livre por padrão."
            />
          ) : (
            <div className="space-y-2">
              {regras.map((regra) => (
                <article
                  key={regra.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] p-3"
                >
                  <div>
                    <strong className="block text-[var(--font-size-sm)] text-[var(--color-text)]">
                      Destino: {regra.listaDestinoNome || regra.listaDestinoId}
                    </strong>
                    <span className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
                      Papel: {regra.papelNome || "Todos os papéis"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    leftIcon={<Trash2 size={16} />}
                    onClick={() => handleRemoverRegra(regra.id)}
                  >
                    Remover
                  </Button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
