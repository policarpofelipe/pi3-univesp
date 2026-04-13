import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ShieldCheck, Trash2 } from "lucide-react";

import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import ListaPermissoesForm from "../../components/listas/ListaPermissoesForm";
import useAuth from "../../hooks/useAuth";
import quadroService from "../../services/quadroService";
import listaService from "../../services/listaService";
import quadroPapelService from "../../services/quadroPapelService";
import listaPermissaoService from "../../services/listaPermissaoService";
import { extractList, extractObject } from "../../utils/apiData";

export default function ListaPermissoesPage() {
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
  const [papeis, setPapeis] = useState([]);
  const [permissoes, setPermissoes] = useState([]);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const [resQuadro, resLista, resPapeis, resPermissoes] = await Promise.all([
        quadroService.obterPorId(quadroId),
        listaService.obterPorId(quadroId, listaId),
        quadroPapelService.listar(quadroId),
        listaPermissaoService.listar(quadroId, listaId),
      ]);
      setQuadro(extractObject(resQuadro) || resQuadro);
      setLista(extractObject(resLista) || resLista);
      setPapeis(extractList(resPapeis));
      setPermissoes(extractList(resPermissoes));
    } catch (error) {
      setErro(
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível carregar as permissões da lista."
      );
    } finally {
      setLoading(false);
    }
  }, [quadroId, listaId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const papeisComPermissao = useMemo(() => {
    const byId = new Map(papeis.map((papel) => [Number(papel.id), papel]));
    return permissoes.map((item) => ({
      ...item,
      papelNome:
        item.papelNome || byId.get(Number(item.papelId))?.nome || "Papel",
    }));
  }, [papeis, permissoes]);

  async function handleSalvarPermissao(payload) {
    setSalvando(true);
    setAcaoErro("");
    setSuccessMessage("");
    try {
      const response = await listaPermissaoService.definir(quadroId, listaId, payload);
      setPermissoes(extractList(response));
      setSuccessMessage(response?.message || "Permissão salva com sucesso.");
    } catch (error) {
      setAcaoErro(
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível salvar a permissão."
      );
      throw error;
    } finally {
      setSalvando(false);
    }
  }

  async function handleRemoverPermissao(papelId) {
    if (!window.confirm("Remover permissão deste papel?")) return;
    setAcaoErro("");
    setSuccessMessage("");
    try {
      const response = await listaPermissaoService.remover(quadroId, listaId, papelId);
      setSuccessMessage(response?.message || "Permissão removida com sucesso.");
      await carregar();
    } catch (error) {
      setAcaoErro(
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível remover a permissão."
      );
    }
  }

  if (loading && !lista) {
    return (
      <AppLayout
        title="Permissões da lista"
        subtitle="Carregando…"
        breadcrumbItems={[
          { label: "Início", href: "/home" },
          { label: "Quadros", href: "/quadros" },
        ]}
        user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      >
        <LoadingState title="Carregando permissões" />
      </AppLayout>
    );
  }

  if (erro || !lista) {
    return (
      <AppLayout
        title="Permissões da lista"
        subtitle="Erro"
        breadcrumbItems={[
          { label: "Início", href: "/home" },
          { label: "Quadros", href: "/quadros" },
        ]}
        user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      >
        <ErrorState
          title="Falha ao carregar permissões"
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
      title="Permissões da lista"
      subtitle="Acesso por papel nesta lista"
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Quadros", href: "/quadros" },
        { label: quadro?.nome || "Quadro", href: `/quadros/${quadroId}` },
        {
          label: lista?.nome || "Lista",
          href: `/quadros/${quadroId}/listas/${listaId}/configuracoes`,
        },
        { label: "Permissões" },
      ]}
      user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
    >
      <div className="space-y-4">
        <PageHeader
          title={`Permissões: ${lista.nome}`}
          description="Defina o acesso por papel para visualizar, editar e enviar cartões para esta lista."
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
            Nova permissão
          </h2>
          <ListaPermissoesForm
            papeis={papeis}
            loading={salvando}
            onSubmit={handleSalvarPermissao}
          />
        </section>

        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h2 className="mb-3 text-[var(--font-size-heading-4)] font-semibold text-[var(--color-text)]">
            Permissões cadastradas
          </h2>

          {papeisComPermissao.length === 0 ? (
            <EmptyState
              icon={<ShieldCheck size={36} />}
              title="Nenhuma permissão cadastrada"
              description="Cadastre a primeira permissão para esta lista."
            />
          ) : (
            <div className="space-y-2">
              {papeisComPermissao.map((item) => (
                <article
                  key={`${item.listaId}-${item.papelId}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] p-3"
                >
                  <div>
                    <strong className="block text-[var(--font-size-sm)] text-[var(--color-text)]">
                      {item.papelNome}
                    </strong>
                    <span className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
                      Ver: {item.podeVer ? "sim" : "não"} | Editar:{" "}
                      {item.podeEditar ? "sim" : "não"} | Enviar para:{" "}
                      {item.podeEnviarPara ? "sim" : "não"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    leftIcon={<Trash2 size={16} />}
                    onClick={() => handleRemoverPermissao(item.papelId)}
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
