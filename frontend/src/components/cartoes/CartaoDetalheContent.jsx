import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppLayout from "../layout/AppLayout";
import Button from "../ui/Button";
import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
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
import CartaoModalHeader from "./CartaoModalHeader";
import CartaoSidebar from "./CartaoSidebar";
import useCartaoModal from "./useCartaoModal";

import quadroService from "../../services/quadroService";
import listaService from "../../services/listaService";
import cartaoService from "../../services/cartaoService";
import tagService from "../../services/tagService";
import { buscarOrganizacaoPorId } from "../../services/organizacaoService";
import { extractList, extractObject } from "../../utils/apiData";
import useAuth from "../../hooks/useAuth";

import { FileText, ListTodo } from "lucide-react";

import "../../styles/components/cartao-detalhe-content.css";

function renderSimpleMarkdown(texto) {
  const t = String(texto || "").trim();
  if (!t) return null;
  return t.split("\n").map((line, idx) => (
    <p key={`${line}-${idx}`}>{line}</p>
  ));
}

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

  const handleSalvarCartao = useCallback(async (payload) => {
    if (!quadroId || !cartaoId) return;

    const tituloAtual = String(cartao?.titulo || "").trim();
    const descricaoAtual = String(cartao?.descricao || "").trim();
    const tituloNovo = String(payload.titulo || "").trim();
    const descricaoNova = String(payload.descricao || "").trim();
    if (tituloAtual === tituloNovo && descricaoAtual === descricaoNova) return;

    setSalvando(true);
    try {
      const res = await cartaoService.atualizar(quadroId, cartaoId, {
        titulo: tituloNovo,
        descricao: descricaoNova,
      });
      const atualizado = extractObject(res) || res;
      if (atualizado) {
        setCartao(atualizado);
        bumpHistorico();
      }
    } finally {
      setSalvando(false);
    }
  }, [quadroId, cartaoId, cartao?.titulo, cartao?.descricao, bumpHistorico]);

  const {
    tituloDraft,
    setTituloDraft,
    descricaoDraft,
    setDescricaoDraft,
    editandoTitulo,
    setEditandoTitulo,
    editandoDescricao,
    setEditandoDescricao,
    agendarSalvar,
  } = useCartaoModal({
    cartao,
    onSaveTituloDescricao: handleSalvarCartao,
  });

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

  const inner = (
    <div
      className={[
        "cartao-detalhe-content__inner",
        isModal ? "cartao-detalhe-content__inner--modal" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <CartaoModalHeader
        cartaoId={cartao.id}
        titulo={tituloDraft}
        onChangeTitulo={(value) => {
          setTituloDraft(value);
          agendarSalvar({ titulo: value, descricao: descricaoDraft });
        }}
        onConfirmTitulo={() =>
          handleSalvarCartao({ titulo: tituloDraft, descricao: descricaoDraft })
        }
        onCancelTitulo={() => setTituloDraft(cartao.titulo || "")}
        editandoTitulo={editandoTitulo}
        setEditandoTitulo={setEditandoTitulo}
        onClose={sairDoDetalhe}
        onExcluir={handleExcluir}
        excluindo={excluindo}
      />

      <div className="cartao-modal-layout">
        <main className="cartao-modal-layout__main">
          <section className="cartao-modal-section" aria-labelledby="cartao-desc-titulo">
            <div className="cartao-modal-section__header">
              <h2 id="cartao-desc-titulo">
                <FileText size={16} />
                <span>Descrição</span>
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditandoDescricao((v) => !v)}
              >
                {editandoDescricao ? "Visualizar" : "Editar"}
              </Button>
            </div>

            {editandoDescricao ? (
              <div className="cartao-modal-section__editor">
                <textarea
                  rows={5}
                  value={descricaoDraft}
                  onChange={(event) => setDescricaoDraft(event.target.value)}
                  placeholder="Adicione uma descrição mais detalhada..."
                />
                <div className="cartao-modal-section__editor-actions">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    loading={salvando}
                    onClick={() => {
                      handleSalvarCartao({
                        titulo: tituloDraft,
                        descricao: descricaoDraft,
                      });
                      setEditandoDescricao(false);
                    }}
                  >
                    Salvar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDescricaoDraft(cartao.descricao || "");
                      setEditandoDescricao(false);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="cartao-modal-section__markdown">
                {renderSimpleMarkdown(descricaoDraft) || (
                  <p className="cartao-modal-section__placeholder">
                    Adicione uma descrição mais detalhada...
                  </p>
                )}
              </div>
            )}
          </section>

          <section className="cartao-modal-section" aria-labelledby="cartao-checklist-titulo">
            <div className="cartao-modal-section__header">
              <h2 id="cartao-checklist-titulo">
                <ListTodo size={16} />
                <span>Checklists</span>
              </h2>
            </div>
            <CartaoChecklist quadroId={quadroId} cartaoId={cartaoId} />
          </section>

          <section className="cartao-modal-section">
            <CartaoAnexos
              quadroId={quadroId}
              cartaoId={cartaoId}
              onHistoricoMudou={bumpHistorico}
            />
          </section>

          <section className="cartao-modal-section">
            <CartaoComentarios
              quadroId={quadroId}
              cartaoId={cartaoId}
              usuarioId={usuarioChave}
              onHistoricoMudou={bumpHistorico}
            />
          </section>

          <details className="cartao-modal-history">
            <summary>Histórico</summary>
            <CartaoHistorico
              quadroId={quadroId}
              cartaoId={cartaoId}
              recarregarSignal={historicoTick}
            />
          </details>
        </main>

        <CartaoSidebar>
          <section className="cartao-modal-section cartao-modal-section--compact">
            <h3>Em</h3>
            {listas.length > 1 ? (
              <select
                id="cartao-detalhe-lista"
                value={String(cartao.listaId)}
                disabled={movendoLista}
                onChange={handleMoverLista}
              >
                {listas.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nome}
                  </option>
                ))}
              </select>
            ) : (
              <p className="cartao-modal-section__muted">{listaAtual?.nome ?? "—"}</p>
            )}
          </section>

          <section className="cartao-modal-section cartao-modal-section--compact">
            <CartaoPrazo
              prazoEm={cartao.prazoEm}
              loading={salvandoPrazo}
              onSave={handleSalvarPrazo}
            />
          </section>

          <section className="cartao-modal-section cartao-modal-section--compact">
            <CartaoPrioridade
              prioridade={cartao.prioridade}
              loading={salvandoPrioridade}
              onSave={handleSalvarPrioridade}
            />
          </section>

          <section className="cartao-modal-section cartao-modal-section--compact">
            <CartaoAtribuicoes quadroId={quadroId} cartaoId={cartaoId} />
          </section>

          <section className="cartao-modal-section cartao-modal-section--compact">
            <CartaoTags
              quadroId={quadroId}
              tagIds={cartao.tagIds}
              tags={tags}
              disabled={salvandoTags}
              onChange={handleSalvarTagIds}
              onTagsRefresh={carregarTags}
            />
          </section>

          <section className="cartao-modal-section cartao-modal-section--compact">
            <CartaoCamposPersonalizados quadroId={quadroId} cartaoId={cartaoId} />
          </section>

          <section className="cartao-modal-section cartao-modal-section--compact">
            <CartaoRelacoes quadroId={quadroId} cartaoId={cartaoId} />
          </section>
        </CartaoSidebar>
      </div>
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
