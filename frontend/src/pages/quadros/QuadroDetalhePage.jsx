import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import QuadroHeader from "../../components/quadros/QuadroHeader";

import quadroService from "../../services/quadroService";
import quadroMembroService from "../../services/quadroMembroService";
import listaService from "../../services/listaService";
import cartaoService from "../../services/cartaoService";
import { buscarOrganizacaoPorId } from "../../services/organizacaoService";
import ListaForm from "../../components/listas/ListaForm";
import ListaHeader from "../../components/listas/ListaHeader";
import ReordenacaoListas from "../../components/listas/ReordenacaoListas";
import CartaoForm from "../../components/cartoes/CartaoForm";
import CartaoCard from "../../components/cartoes/CartaoCard";
import CriacaoRapidaCartao from "../../components/cartoes/CriacaoRapidaCartao";
import { extractList, extractObject } from "../../utils/apiData";
import useAuth from "../../hooks/useAuth";

import {
  Building2,
  ListTodo,
  CheckSquare,
  Plus,
  ArrowRight,
  Clock3,
  Users,
} from "lucide-react";

import "../../styles/pages/quadro-detalhe.css";

function formatarData(data) {
  if (!data) return "Não informado";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(data));
  } catch {
    return data;
  }
}

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
    nome: m.nome,
    papeis: papeis.filter(Boolean),
  };
}

export default function QuadroDetalhePage() {
  const navigate = useNavigate();
  const { quadroId } = useParams();
  const { usuario } = useAuth();

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

  const carregar = useCallback(async () => {
    if (!quadroId) return;

    setLoading(true);
    setErro("");

    try {
      const [resQuadro, resMembros, resListas, resCartoes] = await Promise.all([
        quadroService.obterPorId(quadroId),
        quadroMembroService.listar(quadroId).catch(() => ({ data: [] })),
        listaService.listar(quadroId).catch(() => ({ data: [] })),
        cartaoService.listar(quadroId).catch(() => ({ data: [] })),
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

  const cartoesPorLista = useMemo(() => {
    const map = new Map();
    for (const l of listas) {
      const key = String(l.id);
      const arr = cartoes
        .filter((c) => String(c.listaId) === key)
        .sort((a, b) => (a.posicao ?? 0) - (b.posicao ?? 0));
      map.set(key, arr);
    }
    return map;
  }, [listas, cartoes]);

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

  async function atualizarListasETotais() {
    await carregarListas();
    await carregarCartoes();
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
    if (!window.confirm(`Excluir o cartão "${cartao.titulo}"?`)) return;
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

  function handleNovaLista() {
    setListaModal({ mode: "criar", lista: null });
  }

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

  function handleConfigurarQuadro() {
    navigate(`/quadros/${quadroId}/configuracoes`);
  }

  function handleAbrirMembros() {
    navigate(`/quadros/${quadroId}/membros`);
  }

  function handleAbrirPapeis() {
    navigate(`/quadros/${quadroId}/papeis`);
  }

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
      subtitle="Detalhes e visão geral do quadro"
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Quadros", href: "/quadros" },
        { label: quadro.nome },
      ]}
      user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      topbarActions={
        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={handleNovoCartao}
        >
          Novo cartão
        </Button>
      }
    >
      <div className="quadro-detalhe-page">
        <PageHeader
          title={quadro.nome}
          description={quadro.descricao || "Sem descrição cadastrada."}
          actions={
            <>
              <Button
                variant="secondary"
                onClick={handleConfigurarQuadro}
              >
                Configurar
              </Button>
              <Button
                variant="primary"
                leftIcon={<Plus size={16} />}
                onClick={handleNovoCartao}
              >
                Novo cartão
              </Button>
            </>
          }
        />

        <div className="mt-6">
          <QuadroHeader
            quadro={quadro}
            onConfigurar={handleConfigurarQuadro}
            onMembros={handleAbrirMembros}
            onPapeis={handleAbrirPapeis}
          />
        </div>

        <section
          className="quadro-detalhe-page__stats"
          aria-label="Indicadores do quadro"
        >
          <article className="quadro-detalhe-page__stat-card">
            <div className="quadro-detalhe-page__stat-icon" aria-hidden="true">
              <ListTodo size={20} />
            </div>
            <div className="quadro-detalhe-page__stat-body">
              <p className="quadro-detalhe-page__stat-label">Listas</p>
              <strong className="quadro-detalhe-page__stat-value">
                {listas.length}
              </strong>
            </div>
          </article>

          <article className="quadro-detalhe-page__stat-card">
            <div className="quadro-detalhe-page__stat-icon" aria-hidden="true">
              <CheckSquare size={20} />
            </div>
            <div className="quadro-detalhe-page__stat-body">
              <p className="quadro-detalhe-page__stat-label">Cartões</p>
              <strong className="quadro-detalhe-page__stat-value">
                {totalCartoes}
              </strong>
            </div>
          </article>

          <article className="quadro-detalhe-page__stat-card">
            <div className="quadro-detalhe-page__stat-icon" aria-hidden="true">
              <Users size={20} />
            </div>
            <div className="quadro-detalhe-page__stat-body">
              <p className="quadro-detalhe-page__stat-label">Membros</p>
              <strong className="quadro-detalhe-page__stat-value">
                {membros.length}
              </strong>
            </div>
          </article>
        </section>

        <p className="quadro-detalhe-page__hero-meta-item mt-4 flex items-center gap-2 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
          <Building2 size={16} aria-hidden="true" />
          <span>
            {quadro.organizacao?.nome || quadro.organizacaoNome || "Organização"}
          </span>
          <span className="text-[var(--color-text-soft)]">·</span>
          <span>Atualizado em {formatarData(quadro.atualizadoEm)}</span>
        </p>

        <section
          className="quadro-detalhe-page__content-grid mt-8"
          aria-label="Detalhamento do quadro"
        >
          <div className="quadro-detalhe-page__panel quadro-detalhe-page__panel--main">
            <div className="quadro-detalhe-page__panel-header">
              <div>
                <h3 className="quadro-detalhe-page__panel-title">
                  Listas do quadro
                </h3>
                <p className="quadro-detalhe-page__panel-description">
                  Estrutura das listas e distribuição dos cartões.
                </p>
              </div>

              <Button
                variant="secondary"
                leftIcon={<Plus size={16} />}
                onClick={handleNovaLista}
              >
                Nova lista
              </Button>
            </div>

            {listas.length === 0 ? (
              <EmptyState
                icon={<ListTodo size={36} />}
                title="Nenhuma lista criada"
                description="Crie colunas para organizar o fluxo de cartões neste quadro."
                action={
                  <Button
                    variant="primary"
                    leftIcon={<Plus size={16} />}
                    onClick={handleNovaLista}
                  >
                    Nova lista
                  </Button>
                }
              />
            ) : (
              <div className="quadro-detalhe-page__listas">
                {listas.map((lista, index) => (
                  <article
                    key={lista.id}
                    className="quadro-detalhe-page__lista-card"
                  >
                    <ListaHeader
                      nome={lista.nome}
                      totalCartoes={lista.totalCartoes}
                      limiteWip={lista.limiteWip}
                      actions={
                        <>
                          <ReordenacaoListas
                            index={index}
                            total={listas.length}
                            onMoveUp={() => moverLista(index, -1)}
                            onMoveDown={() => moverLista(index, 1)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setListaModal({ mode: "editar", lista })
                            }
                          >
                            Editar
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExcluirLista(lista)}
                          >
                            Excluir
                          </Button>
                        </>
                      }
                    />

                    {lista.descricao ? (
                      <p className="mb-3 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
                        {lista.descricao}
                      </p>
                    ) : null}

                    <div className="flex flex-col gap-2">
                      <CriacaoRapidaCartao
                        listaId={lista.id}
                        onCriar={handleCriacaoRapidaCartao}
                      />
                      {(cartoesPorLista.get(String(lista.id)) || []).map(
                        (c) => (
                          <CartaoCard
                            key={c.id}
                            cartao={c}
                            listas={listas}
                            movendo={movendoCartaoId === c.id}
                            onEdit={(cc) =>
                              setCartaoModal({ mode: "editar", cartao: cc })
                            }
                            onDelete={handleExcluirCartao}
                            onMoverLista={handleMoverCartaoLista}
                          />
                        )
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside className="quadro-detalhe-page__panel quadro-detalhe-page__panel--side">
            <section className="quadro-detalhe-page__section">
              <div className="quadro-detalhe-page__section-header">
                <h3 className="quadro-detalhe-page__section-title">
                  Membros do quadro
                </h3>

                <Button variant="ghost" onClick={handleAbrirMembros}>
                  Ver todos
                </Button>
              </div>

              {membros.length === 0 ? (
                <p className="text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
                  Nenhum membro listado.
                </p>
              ) : (
                <ul className="quadro-detalhe-page__membros">
                  {membros.slice(0, 6).map((membro) => (
                    <li
                      key={membro.id}
                      className="quadro-detalhe-page__membro-item"
                    >
                      <div
                        className="quadro-detalhe-page__membro-avatar"
                        aria-hidden="true"
                      >
                        {(membro.nome || "?").slice(0, 1).toUpperCase()}
                      </div>

                      <div className="quadro-detalhe-page__membro-body">
                        <strong className="quadro-detalhe-page__membro-nome">
                          {membro.nome}
                        </strong>
                        <span className="quadro-detalhe-page__membro-papel">
                          {membro.papeis.length
                            ? membro.papeis.join(", ")
                            : "Sem papel"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="quadro-detalhe-page__section">
              <div className="quadro-detalhe-page__section-header">
                <h3 className="quadro-detalhe-page__section-title">
                  Papéis do quadro
                </h3>

                <Button variant="ghost" onClick={handleAbrirPapeis}>
                  Gerenciar
                </Button>
              </div>

              <p className="quadro-detalhe-page__section-text">
                Os papéis controlam permissões de visualização, edição, listas,
                cartões e membros.
              </p>
            </section>

            <section className="quadro-detalhe-page__section">
              <h3 className="quadro-detalhe-page__section-title">
                Atividade recente
              </h3>

              {atividades.length === 0 ? (
                <p className="text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
                  Sem eventos recentes.
                </p>
              ) : (
                <ol className="quadro-detalhe-page__atividades">
                  {atividades.map((atividade) => (
                    <li
                      key={atividade.id}
                      className="quadro-detalhe-page__atividade-item"
                    >
                      <span
                        className="quadro-detalhe-page__atividade-icon"
                        aria-hidden="true"
                      >
                        <ArrowRight size={14} />
                      </span>

                      <div className="quadro-detalhe-page__atividade-body">
                        <p className="quadro-detalhe-page__atividade-texto">
                          {atividade.descricao}
                        </p>
                        <p className="quadro-detalhe-page__atividade-data">
                          <Clock3 size={13} aria-hidden="true" />
                          <span>{atividade.data}</span>
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </aside>
        </section>
      </div>

      {cartaoModal ? (
        <div
          className="fixed inset-0 z-[1300] flex items-center justify-center bg-[var(--color-scrim)] p-4"
          role="presentation"
          onClick={() => !cartaoSalvando && setCartaoModal(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cartao-modal-titulo"
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="cartao-modal-titulo"
              className="text-[var(--font-size-heading-3)] font-semibold text-[var(--color-text)]"
            >
              {cartaoModal.mode === "criar" ? "Novo cartão" : "Editar cartão"}
            </h2>
            <div className="mt-4">
              <CartaoForm
                modo={cartaoModal.mode === "criar" ? "criar" : "editar"}
                listas={listas}
                listaIdFixo={cartaoModal.listaIdFixo || ""}
                initialValues={
                  cartaoModal.cartao
                    ? {
                        titulo: cartaoModal.cartao.titulo,
                        descricao: cartaoModal.cartao.descricao,
                        listaId: cartaoModal.cartao.listaId,
                      }
                    : {}
                }
                loading={cartaoSalvando}
                onCancel={() => !cartaoSalvando && setCartaoModal(null)}
                onSubmit={handleSalvarCartao}
              />
            </div>
          </div>
        </div>
      ) : null}

      {listaModal ? (
        <div
          className="fixed inset-0 z-[1300] flex items-center justify-center bg-[var(--color-scrim)] p-4"
          role="presentation"
          onClick={() => !listaSalvando && setListaModal(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lista-modal-titulo"
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="lista-modal-titulo"
              className="text-[var(--font-size-heading-3)] font-semibold text-[var(--color-text)]"
            >
              {listaModal.mode === "criar" ? "Nova lista" : "Editar lista"}
            </h2>
            <div className="mt-4">
              <ListaForm
                modo={listaModal.mode === "criar" ? "criar" : "editar"}
                initialValues={
                  listaModal.lista
                    ? {
                        nome: listaModal.lista.nome,
                        descricao: listaModal.lista.descricao,
                        limiteWip: listaModal.lista.limiteWip,
                      }
                    : {}
                }
                loading={listaSalvando}
                onCancel={() => !listaSalvando && setListaModal(null)}
                onSubmit={handleSalvarLista}
              />
            </div>
          </div>
        </div>
      ) : null}
    </AppLayout>
  );
}
