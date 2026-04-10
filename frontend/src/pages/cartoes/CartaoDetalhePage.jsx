import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppLayout from "../../components/layout/AppLayout";
import Button from "../../components/ui/Button";
import CartaoHeader from "../../components/cartoes/CartaoHeader";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import CartaoForm from "../../components/cartoes/CartaoForm";
import CartaoComentarios from "../../components/cartoes/CartaoComentarios";

import quadroService from "../../services/quadroService";
import listaService from "../../services/listaService";
import cartaoService from "../../services/cartaoService";
import { buscarOrganizacaoPorId } from "../../services/organizacaoService";
import { extractList, extractObject } from "../../utils/apiData";
import useAuth from "../../hooks/useAuth";

import { ArrowLeft, Trash2 } from "lucide-react";

export default function CartaoDetalhePage() {
  const navigate = useNavigate();
  const { quadroId, cartaoId } = useParams();
  const { usuario } = useAuth();
  const usuarioChave = usuario?.id ?? usuario?.usuarioId ?? "";

  const [quadro, setQuadro] = useState(null);
  const [listas, setListas] = useState([]);
  const [cartao, setCartao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [movendoLista, setMovendoLista] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const carregar = useCallback(async () => {
    if (!quadroId || !cartaoId) return;

    setLoading(true);
    setErro("");

    try {
      const [resQuadro, resListas, resCartao] = await Promise.all([
        quadroService.obterPorId(quadroId),
        listaService.listar(quadroId),
        cartaoService.obterPorId(quadroId, cartaoId),
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
    } catch (error) {
      setErro(
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível carregar o cartão."
      );
      setQuadro(null);
      setListas([]);
      setCartao(null);
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
      navigate(`/quadros/${quadroId}`);
    } catch {
      /* silencioso */
    } finally {
      setExcluindo(false);
    }
  }

  function handleVoltarAoQuadro() {
    navigate(`/quadros/${quadroId}`);
  }

  if (loading && !cartao) {
    return (
      <AppLayout
        title="Cartão"
        subtitle="Carregando…"
        breadcrumbItems={[
          { label: "Início", href: "/home" },
          { label: "Quadros", href: "/quadros" },
        ]}
        user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      >
        <LoadingState title="Carregando cartão" />
      </AppLayout>
    );
  }

  if (erro || !cartao || !quadro) {
    return (
      <AppLayout
        title="Cartão"
        subtitle="Erro"
        breadcrumbItems={[
          { label: "Início", href: "/home" },
          { label: "Quadros", href: "/quadros" },
        ]}
        user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      >
        <ErrorState
          title="Não foi possível abrir o cartão"
          description={erro || "Cartão indisponível."}
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
      title={cartao.titulo}
      subtitle={quadro.nome}
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Quadros", href: "/quadros" },
        { label: quadro.nome, href: `/quadros/${quadroId}` },
        { label: cartao.titulo },
      ]}
      user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
    >
      <div className="mx-auto max-w-2xl">
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
                onClick={handleVoltarAoQuadro}
              >
                Voltar ao quadro
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
          <h2
            id="cartao-detalhe-conteudo"
            className="sr-only"
          >
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
                className="w-full max-w-md rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
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

          <CartaoForm
            modo="editar"
            initialValues={valoresFormularioCartao}
            loading={salvando}
            onSubmit={handleSalvarCartao}
            submitLabel="Salvar alterações"
          />
        </section>

        <CartaoComentarios
          quadroId={quadroId}
          cartaoId={cartaoId}
          usuarioId={usuarioChave}
        />
      </div>
    </AppLayout>
  );
}
