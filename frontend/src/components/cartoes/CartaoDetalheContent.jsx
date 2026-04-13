import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppLayout from "../layout/AppLayout";
import Button from "../ui/Button";
import CartaoHeader from "./CartaoHeader";
import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
import CartaoForm from "./CartaoForm";
import CartaoPrazo from "./CartaoPrazo";
import CartaoPrioridade from "./CartaoPrioridade";
import CartaoChecklist from "./CartaoChecklist";
import CartaoAnexos from "./CartaoAnexos";
import CartaoComentarios from "./CartaoComentarios";
import CartaoHistorico from "./CartaoHistorico";
import CartaoTags from "./CartaoTags";
import CartaoAtribuicoes from "./CartaoAtribuicoes";
import CartaoCamposPersonalizados from "./CartaoCamposPersonalizados";
import CartaoRelacoes from "./CartaoRelacoes";

import quadroService from "../../services/quadroService";
import listaService from "../../services/listaService";
import cartaoService from "../../services/cartaoService";
import tagService from "../../services/tagService";
import { buscarOrganizacaoPorId } from "../../services/organizacaoService";
import { extractList, extractObject } from "../../utils/apiData";
import useAuth from "../../hooks/useAuth";

import { ArrowLeft, Trash2 } from "lucide-react";

import "../../styles/components/cartao-detalhe-content.css";

/**
 * Conteúdo compartilhado entre página cheia (URL direta) e modal sobre o quadro.
 * @param {"page"|"modal"} variant
 * @param {() => void} [onRequestClose] — obrigatório em variant "modal" (fecha overlay).
 */
export default function CartaoDetalheContent({
  variant = "page",
  onRequestClose,
}) {
  const navigate = useNavigate();
  const { quadroId, cartaoId } = useParams();
  const { usuario } = useAuth();
  const usuarioChave = usuario?.id ?? usuario?.usuarioId ?? "";

  const [quadro, setQuadro] = useState(null);
  const [listas, setListas] = useState([]);
  const [cartao, setCartao] = useState(null);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [movendoLista, setMovendoLista] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [salvandoPrazo, setSalvandoPrazo] = useState(false);
  const [salvandoPrioridade, setSalvandoPrioridade] = useState(false);
  const [salvandoTags, setSalvandoTags] = useState(false);
  const [historicoTick, setHistoricoTick] = useState(0);

  const bumpHistorico = useCallback(() => {
    setHistoricoTick((n) => n + 1);
  }, []);

  const sairDoDetalhe = useCallback(() => {
    if (variant === "modal" && typeof onRequestClose === "function") {
      onRequestClose();
    } else if (quadroId) {
      navigate(`/quadros/${quadroId}`);
    } else {
      navigate("/quadros");
    }
  }, [variant, onRequestClose, navigate, quadroId]);

  const carregar = useCallback(async () => {
    if (!quadroId || !cartaoId) return;

    setLoading(true);
    setErro("");

    try {
      const [resQuadro, resListas, resCartao, resTags] = await Promise.all([
        quadroService.obterPorId(quadroId),
        listaService.listar(quadroId),
        cartaoService.obterPorId(quadroId, cartaoId),
        tagService.listar(quadroId).catch(() => ({ data: [] })),
      ]);

      let dataQuadro = extractObject(resQuadro) || resQuadro;

      if (dataQuadro?.organizacaoId && !dataQuadro.organizacao?.nome) {
        try {
          const orgRes = await buscarOrganizacaoPorId(dataQuadro.organizacaoId);
          const org = extractObject(orgRes) || orgRes;
          dataQuadro = {
            ...dataQuadro,
            organizacao: {
              id: dataQuadro.organizacaoId,
              nome: org?.nome || "",
            },
            organizacaoNome: org?.nome,
          };
        } catch {
          dataQuadro = {
            ...dataQuadro,
            organizacao: {
              id: dataQuadro.organizacaoId,
              nome: "Organização",
            },
          };
        }
      }

      setQuadro(dataQuadro);

      const rawListas = extractList(resListas);
      setListas(rawListas.sort((a, b) => (a.posicao ?? 0) - (b.posicao ?? 0)));

      const dataCartao = extractObject(resCartao) || resCartao;
      setCartao(dataCartao);
      setTags(extractList(resTags));
    } catch (error) {
      setErro(
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível carregar o cartão."
      );
      setQuadro(null);
      setListas([]);
      setCartao(null);
      setTags([]);
    } finally {
      setLoading(false);
    }
  }, [quadroId, cartaoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const listaAtual = useMemo(() => {
    if (!cartao) return null;
    return listas.find((l) => String(l.id) === String(cartao.listaId)) || null;
  }, [listas, cartao]);

  const valoresFormularioCartao = useMemo(
    () => ({
      titulo: cartao?.titulo ?? "",
      descricao: cartao?.descricao ?? "",
      listaId: cartao?.listaId ?? "",
    }),
    [cartao?.id, cartao?.titulo, cartao?.descricao, cartao?.listaId]
  );

  async function handleSalvarCartao(payload) {
    if (!quadroId || !cartaoId) return;

    setSalvando(true);
    try {
      const res = await cartaoService.atualizar(quadroId, cartaoId, {
        titulo: payload.titulo,
        descricao: payload.descricao,
      });
      const atualizado = extractObject(res) || res;
      if (atualizado) {
        setCartao(atualizado);
        bumpHistorico();
      }
    } finally {
      setSalvando(false);
    }
  }

  async function handleMoverLista(event) {
    const novaListaId = event.target.value;
    if (!cartao || String(cartao.listaId) === String(novaListaId)) return;

    setMovendoLista(true);
    try {
      const res = await cartaoService.mover(quadroId, cartaoId, {
        listaId: novaListaId,
      });
      const atualizado = extractObject(res) || res;
      if (atualizado) {
        setCartao(atualizado);
        bumpHistorico();
      }
    } catch {
      await carregar();
    } finally {
      setMovendoLista(false);
    }
  }

  async function handleExcluir() {
    if (!cartao || !window.confirm(`Excluir o cartão "${cartao.titulo}"?`)) {
      return;
    }

    setExcluindo(true);
    try {
      await cartaoService.remover(quadroId, cartaoId);
      if (variant === "modal" && typeof onRequestClose === "function") {
        onRequestClose();
      } else {
        navigate(`/quadros/${quadroId}`);
      }
    } catch {
      /* silencioso */
    } finally {
      setExcluindo(false);
    }
  }

  async function handleSalvarPrazo(iso) {
    if (!quadroId || !cartaoId) return;
    setSalvandoPrazo(true);
    try {
      const res = await cartaoService.atualizar(quadroId, cartaoId, {
        prazoEm: iso,
      });
      const atualizado = extractObject(res) || res;
      if (atualizado) {
        setCartao(atualizado);
        bumpHistorico();
      }
    } finally {
      setSalvandoPrazo(false);
    }
  }

  async function handleSalvarPrioridade(val) {
    if (!quadroId || !cartaoId) return;
    setSalvandoPrioridade(true);
    try {
      const res = await cartaoService.atualizar(quadroId, cartaoId, {
        prioridade: val,
      });
      const atualizado = extractObject(res) || res;
      if (atualizado) {
        setCartao(atualizado);
        bumpHistorico();
      }
    } finally {
      setSalvandoPrioridade(false);
    }
  }

  const carregarTags = useCallback(async () => {
    if (!quadroId) return;
    try {
      const res = await tagService.listar(quadroId);
      setTags(extractList(res));
    } catch {
      setTags([]);
    }
  }, [quadroId]);

  async function handleSalvarTagIds(newIds) {
    if (!quadroId || !cartaoId) return;
    setSalvandoTags(true);
    try {
      const res = await cartaoService.atualizar(quadroId, cartaoId, {
        tagIds: newIds,
      });
      const atualizado = extractObject(res) || res;
      if (atualizado) {
        setCartao(atualizado);
        bumpHistorico();
      }
    } finally {
      setSalvandoTags(false);
    }
  }

  const userLayout = {
    name: usuario?.nomeExibicao || usuario?.nome || "Usuário",
  };

  const isModal = variant === "modal";

  if (loading && !cartao) {
    const loadingBody = <LoadingState title="Carregando cartão" />;
    if (isModal) {
      return (
        <div className="cartao-detalhe-content cartao-detalhe-content--modal">
          {loadingBody}
        </div>
      );
    }
    return (
      <AppLayout
        title="Cartão"
        subtitle="Carregando…"
        breadcrumbItems={[
          { label: "Início", href: "/home" },
          { label: "Quadros", href: "/quadros" },
        ]}
        user={userLayout}
      >
        {loadingBody}
      </AppLayout>
    );
  }

  if (erro || !cartao || !quadro) {
    const errorBody = (
      <ErrorState
        title="Não foi possível abrir o cartão"
        description={erro || "Cartão indisponível."}
        action={
          <Button variant="primary" onClick={() => navigate("/quadros")}>
            Voltar aos quadros
          </Button>
        }
      />
    );
    if (isModal) {
      return (
        <div className="cartao-detalhe-content cartao-detalhe-content--modal">
          {errorBody}
        </div>
      );
    }
    return (
      <AppLayout
        title="Cartão"
        subtitle="Erro"
        breadcrumbItems={[
          { label: "Início", href: "/home" },
          { label: "Quadros", href: "/quadros" },
        ]}
        user={userLayout}
      >
        {errorBody}
      </AppLayout>
    );
  }

  const voltarLabel = isModal ? "Fechar" : "Voltar ao quadro";

  const inner = (
    <div
      className={[
        "cartao-detalhe-content__inner",
        isModal ? "cartao-detalhe-content__inner--modal" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <CartaoHeader
        titulo={cartao.titulo}
        nomeLista={listaAtual?.nome || ""}
        nomeQuadro={quadro.nome || ""}
        nomeOrganizacao={
          quadro.organizacao?.nome || quadro.organizacaoNome || ""
        }
        actions={
          <>
            <Button
              variant="secondary"
              leftIcon={<ArrowLeft size={16} />}
              onClick={sairDoDetalhe}
            >
              {voltarLabel}
            </Button>
            <Button
              variant="ghost"
              leftIcon={<Trash2 size={16} />}
              loading={excluindo}
              disabled={excluindo}
              onClick={handleExcluir}
            >
              Excluir
            </Button>
          </>
        }
      />

      <section
        className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-xs)]"
        aria-labelledby="cartao-detalhe-conteudo"
      >
        <h2 id="cartao-detalhe-conteudo" className="sr-only">
          Conteúdo do cartão
        </h2>

        <div className="mb-6">
          <label
            htmlFor="cartao-detalhe-lista"
            className="mb-2 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
          >
            Lista
          </label>
          {listas.length > 1 ? (
            <select
              id="cartao-detalhe-lista"
              value={String(cartao.listaId)}
              disabled={movendoLista}
              onChange={handleMoverLista}
              className="w-full max-w-md rounded-lg border border-[var(--input-border)] bg-[var(--color-surface)] px-3 py-2 text-[var(--font-size-sm)]"
            >
              {listas.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nome}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
              {listaAtual?.nome ?? "—"}
            </p>
          )}
        </div>

        <CartaoPrazo
          prazoEm={cartao.prazoEm}
          loading={salvandoPrazo}
          onSave={handleSalvarPrazo}
        />

        <CartaoPrioridade
          prioridade={cartao.prioridade}
          loading={salvandoPrioridade}
          onSave={handleSalvarPrioridade}
        />

        <CartaoTags
          quadroId={quadroId}
          tagIds={cartao.tagIds}
          tags={tags}
          disabled={salvandoTags}
          onChange={handleSalvarTagIds}
          onTagsRefresh={carregarTags}
        />

        <CartaoForm
          modo="editar"
          initialValues={valoresFormularioCartao}
          loading={salvando}
          onSubmit={handleSalvarCartao}
          submitLabel="Salvar alterações"
        />
      </section>

      <CartaoChecklist quadroId={quadroId} cartaoId={cartaoId} />
      <CartaoAtribuicoes quadroId={quadroId} cartaoId={cartaoId} />
      <CartaoCamposPersonalizados quadroId={quadroId} cartaoId={cartaoId} />
      <CartaoRelacoes quadroId={quadroId} cartaoId={cartaoId} />

      <CartaoAnexos
        quadroId={quadroId}
        cartaoId={cartaoId}
        onHistoricoMudou={bumpHistorico}
      />

      <CartaoComentarios
        quadroId={quadroId}
        cartaoId={cartaoId}
        usuarioId={usuarioChave}
        onHistoricoMudou={bumpHistorico}
      />

      <CartaoHistorico
        quadroId={quadroId}
        cartaoId={cartaoId}
        recarregarSignal={historicoTick}
      />
    </div>
  );

  if (isModal) {
    return (
      <div className="cartao-detalhe-content cartao-detalhe-content--modal">
        {inner}
      </div>
    );
  }

  return (
    <AppLayout
      title={cartao.titulo}
      subtitle={quadro.nome}
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Quadros", href: "/quadros" },
        { label: quadro.nome, href: `/quadros/${quadroId}` },
        { label: cartao.titulo },
      ]}
      user={userLayout}
    >
      <div className="cartao-detalhe-content cartao-detalhe-content--page mx-auto max-w-2xl">
        {inner}
      </div>
    </AppLayout>
  );
}
