import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import AppLayout from "../../components/layout/AppLayout";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";

import quadroService from "../../services/quadroService";
import quadroMembroService from "../../services/quadroMembroService";
import listaService from "../../services/listaService";
import cartaoService from "../../services/cartaoService";
import tagService from "../../services/tagService";
import automacaoService from "../../services/automacaoService";
import { buscarOrganizacaoPorId } from "../../services/organizacaoService";
import ListaModal from "../../components/listas/ListaModal";
import CartaoModal from "../../components/cartoes/CartaoModal";
import QuadroManagementDrawer from "../../components/quadros/QuadroManagementDrawer";
import BoardQuickFilters from "../../components/quadros/board/BoardQuickFilters";
import QuadroBoardCanvas from "../../components/quadros/board/QuadroBoardCanvas";
import { extractList, extractObject } from "../../utils/apiData";
import {
  aplicarFiltrosRapidos,
  filtrosEstaoAtivos,
} from "../../utils/boardFilterUtils";
import useAuth from "../../hooks/useAuth";

import {
  ListTodo,
  Settings,
} from "lucide-react";

import "../../styles/pages/quadro-detalhe.css";
import "../../styles/pages/board-quadro.css";

function normalizarMembro(m) {
  const papeis = [];
  if (Array.isArray(m.papeis) && m.papeis.length) {
    m.papeis.forEach((p) =>
      papeis.push(typeof p === "string" ? p : p?.nome)
    );
  } else if (m.papel) {
    papeis.push(m.papel);
  }

  return {
    id: m.id,
    usuarioId: m.usuarioId ?? m.usuario_id ?? null,
    nome: m.nome,
    papeis: papeis.filter(Boolean),
  };
}

function pathnameEhDetalheCartaoNoQuadro(pathname) {
  return /\/quadros\/[^/]+\/cartoes\/[^/]+$/.test(pathname || "");
}

function pathnameEhSomenteQuadro(pathname) {
  const p = String(pathname || "").replace(/\/+$/, "");
  return /^\/quadros\/[^/]+$/.test(p) && !p.includes("/cartoes/");
}

export default function QuadroDetalhePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { quadroId } = useParams();
  const { usuario } = useAuth();
  const pathnameAnteriorRef = useRef(location.pathname);

  const [quadro, setQuadro] = useState(null);
  const [membros, setMembros] = useState([]);
  const [listas, setListas] = useState([]);
  const [cartoes, setCartoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [listaModal, setListaModal] = useState(null);
  const [listaSalvando, setListaSalvando] = useState(false);
  const [cartaoModal, setCartaoModal] = useState(null);
  const [cartaoSalvando, setCartaoSalvando] = useState(false);
  const [movendoCartaoId, setMovendoCartaoId] = useState(null);
  const [tags, setTags] = useState([]);
  const [automacoes, setAutomacoes] = useState([]);
  const [automacoesLoading, setAutomacoesLoading] = useState(false);
  const [automacoesErro, setAutomacoesErro] = useState("");
  const [automacaoSalvando, setAutomacaoSalvando] = useState(false);
  const [removendoTagId, setRemovendoTagId] = useState(null);
  const [criandoTag, setCriandoTag] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSection, setDrawerSection] = useState("geral");
  const [filters, setFilters] = useState({
    busca: "",
    tagId: "",
    prioridade: "",
    prazo: "",
    situacao: "",
    membroId: "",
  });

  const carregar = useCallback(async () => {
    if (!quadroId) return;

    setLoading(true);
    setErro("");

    try {
      const [resQuadro, resMembros, resListas, resCartoes, resTags, resAutomacoes] =
        await Promise.all([
          quadroService.obterPorId(quadroId),
          quadroMembroService.listar(quadroId).catch(() => ({ data: [] })),
          listaService.listar(quadroId).catch(() => ({ data: [] })),
          cartaoService.listar(quadroId).catch(() => ({ data: [] })),
          tagService.listar(quadroId).catch(() => ({ data: [] })),
          automacaoService.listar(quadroId).catch(() => ({ data: [] })),
        ]);

      let data = extractObject(resQuadro) || resQuadro;

      if (data?.organizacaoId && !data.organizacao?.nome) {
        try {
          const orgRes = await buscarOrganizacaoPorId(data.organizacaoId);
          const org = extractObject(orgRes) || orgRes;
          data = {
            ...data,
            organizacao: { id: data.organizacaoId, nome: org?.nome || "" },
            organizacaoNome: org?.nome,
          };
        } catch {
          data = {
            ...data,
            organizacao: { id: data.organizacaoId, nome: "Organização" },
          };
        }
      }

      setQuadro(data);

      const listaMembros = extractList(resMembros);
      setMembros(listaMembros.map(normalizarMembro));

      const rawListas = extractList(resListas);
      setListas(
        rawListas.sort((a, b) => (a.posicao ?? 0) - (b.posicao ?? 0))
      );

      setCartoes(extractList(resCartoes));
      setTags(extractList(resTags));
      setAutomacoes(extractList(resAutomacoes));
      setAutomacoesErro("");
    } catch (error) {
      setErro(
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível carregar o quadro."
      );
      setQuadro(null);
      setMembros([]);
      setListas([]);
      setCartoes([]);
      setTags([]);
      setAutomacoes([]);
      setAutomacoesErro("");
    } finally {
      setLoading(false);
    }
  }, [quadroId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const atividades = quadro?.atividades && Array.isArray(quadro.atividades)
    ? quadro.atividades
    : [];

  const totalCartoes = useMemo(() => {
    return listas.reduce((acc, lista) => acc + (lista.totalCartoes || 0), 0);
  }, [listas]);

  const cartoesVisiveis = useMemo(
    () => aplicarFiltrosRapidos(cartoes, filters),
    [cartoes, filters]
  );

  const filtrosAtivos = filtrosEstaoAtivos(filters);

  const membrosPorUsuarioId = useMemo(() => {
    const m = new Map();
    for (const mem of membros) {
      const uid = mem.usuarioId ?? mem.id;
      if (uid != null) m.set(Number(uid), { nome: mem.nome });
    }
    return m;
  }, [membros]);

  const carregarListas = useCallback(async () => {
    if (!quadroId) return;
    try {
      const res = await listaService.listar(quadroId);
      const raw = extractList(res);
      setListas(raw.sort((a, b) => (a.posicao ?? 0) - (b.posicao ?? 0)));
    } catch {
      setListas([]);
    }
  }, [quadroId]);

  const carregarCartoes = useCallback(async () => {
    if (!quadroId) return;
    try {
      const res = await cartaoService.listar(quadroId);
      setCartoes(extractList(res));
    } catch {
      setCartoes([]);
    }
  }, [quadroId]);

  const carregarTags = useCallback(async () => {
    if (!quadroId) return;
    try {
      const res = await tagService.listar(quadroId);
      setTags(extractList(res));
    } catch {
      setTags([]);
    }
  }, [quadroId]);

  const carregarAutomacoes = useCallback(async () => {
    if (!quadroId) return;
    setAutomacoesLoading(true);
    setAutomacoesErro("");
    try {
      const res = await automacaoService.listar(quadroId);
      setAutomacoes(extractList(res));
    } catch (error) {
      setAutomacoesErro(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          "Não foi possível carregar as automações."
      );
      setAutomacoes([]);
    } finally {
      setAutomacoesLoading(false);
    }
  }, [quadroId]);

  useEffect(() => {
    const anterior = pathnameAnteriorRef.current;
    const atual = location.pathname;
    pathnameAnteriorRef.current = atual;

    if (
      pathnameEhDetalheCartaoNoQuadro(anterior) &&
      pathnameEhSomenteQuadro(atual) &&
      String(quadroId) === (atual.match(/^\/quadros\/([^/]+)/)?.[1] ?? "")
    ) {
      void carregarCartoes();
      void carregarTags();
    }
  }, [location.pathname, quadroId, carregarCartoes, carregarTags]);

  useEffect(() => {
    function handleCartoesTagsAtualizados(event) {
      const idEvento = String(event?.detail?.quadroId || "");
      if (!idEvento || idEvento !== String(quadroId)) return;
      void carregarCartoes();
      void carregarTags();
      void carregarListas();
    }
    window.addEventListener("quadro:cartoes-tags-atualizados", handleCartoesTagsAtualizados);
    return () =>
      window.removeEventListener(
        "quadro:cartoes-tags-atualizados",
        handleCartoesTagsAtualizados
      );
  }, [quadroId, carregarCartoes, carregarTags, carregarListas]);

  async function atualizarListasETotais() {
    await carregarListas();
    await carregarCartoes();
  }

  async function handleCriarTagQuadro(payload) {
    setCriandoTag(true);
    try {
      await tagService.criar(quadroId, payload);
      await carregarTags();
      await carregarCartoes();
    } catch (err) {
      throw err;
    } finally {
      setCriandoTag(false);
    }
  }

  async function handleRemoverTagQuadro(tag) {
    if (!window.confirm(`Remover a tag "${tag.nome}" dos cartões?`)) return;
    setRemovendoTagId(tag.id);
    try {
      await tagService.remover(quadroId, tag.id);
      await carregarTags();
      await carregarCartoes();
    } finally {
      setRemovendoTagId(null);
    }
  }

  async function handleCriarAutomacao(payload) {
    setAutomacaoSalvando(true);
    setAutomacoesErro("");
    try {
      await automacaoService.criar(quadroId, payload);
      await carregarAutomacoes();
    } catch (error) {
      setAutomacoesErro(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          "Não foi possível criar a automação."
      );
      throw error;
    } finally {
      setAutomacaoSalvando(false);
    }
  }

  async function handleAtualizarAutomacao(automacaoId, payload) {
    setAutomacaoSalvando(true);
    setAutomacoesErro("");
    try {
      await automacaoService.atualizar(quadroId, automacaoId, payload);
      await carregarAutomacoes();
    } catch (error) {
      setAutomacoesErro(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          "Não foi possível atualizar a automação."
      );
      throw error;
    } finally {
      setAutomacaoSalvando(false);
    }
  }

  async function handleRemoverAutomacao(automacao) {
    if (!window.confirm(`Remover a automação "${automacao.nome}"?`)) return;
    setAutomacoesErro("");
    try {
      await automacaoService.remover(quadroId, automacao.id);
      await carregarAutomacoes();
    } catch (error) {
      setAutomacoesErro(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          "Não foi possível remover a automação."
      );
    }
  }

  async function handleSalvarCartao(payload) {
    if (!cartaoModal) return;

    setCartaoSalvando(true);
    try {
      if (cartaoModal.mode === "criar") {
        await cartaoService.criar(quadroId, {
          titulo: payload.titulo,
          descricao: payload.descricao || "",
          listaId: payload.listaId,
        });
      } else if (cartaoModal.cartao?.id) {
        await cartaoService.atualizar(quadroId, cartaoModal.cartao.id, {
          titulo: payload.titulo,
          descricao: payload.descricao,
        });
      } else {
        throw new Error("Estado do cartão inválido.");
      }
      setCartaoModal(null);
      await atualizarListasETotais();
    } finally {
      setCartaoSalvando(false);
    }
  }

  async function handleExcluirCartao(cartao) {
    if (
      !window.confirm(`Arquivar o cartão "${cartao.titulo}"? Ele sairá do quadro.`)
    ) {
      return;
    }
    try {
      await cartaoService.remover(quadroId, cartao.id);
      await atualizarListasETotais();
    } catch {
      /* backend pode retornar erro */
    }
  }

  async function handleMoverCartaoLista(cartao, novaListaId) {
    if (String(cartao.listaId) === String(novaListaId)) return;
    setMovendoCartaoId(cartao.id);
    try {
      await cartaoService.mover(quadroId, cartao.id, {
        listaId: novaListaId,
      });
      await atualizarListasETotais();
    } catch {
      await atualizarListasETotais();
    } finally {
      setMovendoCartaoId(null);
    }
  }

  function handleNovoCartao() {
    if (!listas.length) {
      window.alert(
        "Crie pelo menos uma lista antes de adicionar cartões a este quadro."
      );
      return;
    }
    setCartaoModal({ mode: "criar" });
  }

  function handleNovaLista() {
    setListaModal({ mode: "criar", lista: null });
  }

  const handleCriacaoRapidaCartao = useCallback(
    async ({ titulo, listaId }) => {
      try {
        await cartaoService.criar(quadroId, {
          titulo,
          descricao: "",
          listaId,
        });
        await carregarListas();
        await carregarCartoes();
      } catch (err) {
        window.alert(
          err?.response?.data?.message ||
            err?.message ||
            "Não foi possível criar o cartão."
        );
      }
    },
    [quadroId, carregarListas, carregarCartoes]
  );

  async function aplicarOrdem(novaOrdem) {
    const ids = novaOrdem.map((l) => l.id);
    try {
      const res = await listaService.reordenar(quadroId, ids);
      const atualizadas = extractList(res);
      if (atualizadas.length) {
        setListas(
          atualizadas.sort((a, b) => (a.posicao ?? 0) - (b.posicao ?? 0))
        );
      } else {
        await carregarListas();
      }
    } catch {
      await carregarListas();
    }
  }

  function moverLista(index, delta) {
    const next = [...listas];
    const to = index + delta;
    if (to < 0 || to >= next.length) return;
    const [item] = next.splice(index, 1);
    next.splice(to, 0, item);
    aplicarOrdem(next);
  }

  async function handleSalvarLista(payload) {
    setListaSalvando(true);
    try {
      if (listaModal?.mode === "criar") {
        await listaService.criar(quadroId, payload);
      } else if (listaModal?.lista?.id) {
        await listaService.atualizar(quadroId, listaModal.lista.id, payload);
      }
      setListaModal(null);
      await carregarListas();
    } catch (err) {
      throw err;
    } finally {
      setListaSalvando(false);
    }
  }

  async function handleExcluirLista(lista) {
    if (!window.confirm(`Excluir a lista "${lista.nome}"?`)) return;
    try {
      await listaService.remover(quadroId, lista.id);
      await atualizarListasETotais();
    } catch {
      /* silencioso: backend pode retornar erro */
    }
  }

  function openDrawer(section = "geral") {
    setDrawerSection(section);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
  }

  function goConfiguracoesCompleto() {
    closeDrawer();
    navigate(`/quadros/${quadroId}/configuracoes`);
  }

  function goMembros() {
    closeDrawer();
    navigate(`/quadros/${quadroId}/membros`);
  }

  function goPapeis() {
    closeDrawer();
    navigate(`/quadros/${quadroId}/papeis`);
  }

  function goVisoes() {
    closeDrawer();
    navigate(`/quadros/${quadroId}/visoes`);
  }

  function goCamposPersonalizados() {
    closeDrawer();
    navigate(`/quadros/${quadroId}/campos-personalizados`);
  }

  function goAutomacoes() {
    closeDrawer();
    navigate(`/quadros/${quadroId}/automacoes`);
  }

  const orgNome =
    quadro?.organizacao?.nome || quadro?.organizacaoNome || "";

  const listaMenusColuna = useMemo(
    () =>
      listas.map((lista, index) => ({
        onEditar: () => setListaModal({ mode: "editar", lista }),
        onExcluir: () => handleExcluirLista(lista),
        onMoverEsquerda: () => moverLista(index, -1),
        onMoverDireita: () => moverLista(index, 1),
        podeMoverEsquerda: index > 0,
        podeMoverDireita: index < listas.length - 1,
      })),
    [listas]
  );

  if (loading && !quadro) {
    return (
      <AppLayout
        title="Quadro"
        subtitle="Carregando…"
        breadcrumbItems={[
          { label: "Início", href: "/home" },
          { label: "Quadros", href: "/quadros" },
        ]}
        user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      >
        <LoadingState title="Carregando quadro" />
      </AppLayout>
    );
  }

  if (erro || !quadro) {
    return (
      <AppLayout
        title="Quadro"
        subtitle="Erro"
        breadcrumbItems={[
          { label: "Início", href: "/home" },
          { label: "Quadros", href: "/quadros" },
        ]}
        user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      >
        <ErrorState
          title="Não foi possível abrir o quadro"
          description={erro || "Quadro indisponível."}
          action={
            <Button variant="primary" onClick={() => navigate("/quadros")}>
              Voltar aos quadros
            </Button>
          }
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={quadro.nome}
      subtitle={quadro.descricao || orgNome || "Quadro"}
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Quadros", href: "/quadros" },
        { label: quadro.nome },
      ]}
      user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      contentClassName="app-layout__content--quadro-kanban"
    >
      <div className="quadro-detalhe-page">
        {listas.length > 0 ? (
          <BoardQuickFilters
            filters={filters}
            onChange={setFilters}
            tags={tags}
            membros={membros}
            actions={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<Settings size={16} aria-hidden="true" />}
                onClick={() => openDrawer("geral")}
                aria-expanded={drawerOpen && drawerSection === "geral"}
              >
                Gerenciar quadro
              </Button>
            }
          />
        ) : null}

        <section
          className="quadro-detalhe-page__canvas"
          aria-label="Listas e cartões do quadro"
        >
          {listas.length === 0 ? (
            <div className="quadro-detalhe-page__canvas-empty">
              <EmptyState
                icon={<ListTodo size={36} aria-hidden="true" />}
                title="Nenhuma lista criada"
                description="Este quadro ainda não possui listas."
              />
            </div>
          ) : (
            <QuadroBoardCanvas
              quadroId={quadroId}
              listas={listas}
              cartoes={cartoesVisiveis}
              tags={tags}
              membrosPorUsuarioId={membrosPorUsuarioId}
              dragDisabled={filtrosAtivos}
              onCartoesUpdated={atualizarListasETotais}
              onEditCartao={(cc) =>
                setCartaoModal({ mode: "editar", cartao: cc })
              }
              onArquivarCartao={handleExcluirCartao}
              onMoverCartaoLista={handleMoverCartaoLista}
              movendoCartaoId={movendoCartaoId}
              onCriacaoRapida={handleCriacaoRapidaCartao}
              listaColumnMenuPropsByIndex={listaMenusColuna}
            />
          )}
        </section>
      </div>

      <QuadroManagementDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        defaultSection={drawerSection}
        quadro={quadro}
        membros={membros}
        tags={tags}
        listas={listas}
        automacoes={automacoes}
        automacoesLoading={automacoesLoading}
        automacoesErro={automacoesErro}
        automacaoSalvando={automacaoSalvando}
        atividades={atividades}
        removendoTagId={removendoTagId}
        criandoTag={criandoTag}
        onCriarTag={handleCriarTagQuadro}
        onRemoverTag={handleRemoverTagQuadro}
        onCriarAutomacao={handleCriarAutomacao}
        onAtualizarAutomacao={handleAtualizarAutomacao}
        onRemoverAutomacao={handleRemoverAutomacao}
        onNavigateConfiguracoes={goConfiguracoesCompleto}
        onNavigateMembros={goMembros}
        onNavigateVisoes={goVisoes}
        onNavigateCamposPersonalizados={goCamposPersonalizados}
        onNavigateAutomacoes={goAutomacoes}
        onNavigatePapeis={goPapeis}
        onNovoCartao={handleNovoCartao}
        onNovaLista={handleNovaLista}
      />

      <CartaoModal
        open={Boolean(cartaoModal)}
        modo={cartaoModal?.mode === "criar" ? "criar" : "editar"}
        listas={listas}
        listaIdFixo={cartaoModal?.listaIdFixo || ""}
        cartaoEmEdicao={cartaoModal?.cartao ?? null}
        loading={cartaoSalvando}
        onClose={() => setCartaoModal(null)}
        onSubmit={handleSalvarCartao}
      />

      <ListaModal
        open={Boolean(listaModal)}
        modo={listaModal?.mode === "criar" ? "criar" : "editar"}
        listaEmEdicao={listaModal?.lista ?? null}
        loading={listaSalvando}
        onClose={() => setListaModal(null)}
        onSubmit={handleSalvarLista}
      />
    </AppLayout>
  );
}
