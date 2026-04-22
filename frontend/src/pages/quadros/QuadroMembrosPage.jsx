import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import QuadroMembrosTable from "../../components/quadros/QuadroMembrosTable";

import quadroService from "../../services/quadroService";
import quadroMembroService from "../../services/quadroMembroService";
import quadroPapelService from "../../services/quadroPapelService";
import { buscarOrganizacaoPorId } from "../../services/organizacaoService";
import { extractList, extractObject } from "../../utils/apiData";
import useAuth from "../../hooks/useAuth";

import {
  Users,
  UserPlus,
  Search,
} from "lucide-react";

import "../../styles/pages/quadro-membros.css";

export default function QuadroMembrosPage() {
  const navigate = useNavigate();
  const { quadroId } = useParams();
  const { usuario } = useAuth();

  const [quadro, setQuadro] = useState(null);
  const [membros, setMembros] = useState([]);
  const [papeis, setPapeis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [modalConvite, setModalConvite] = useState(false);
  const [emailConvite, setEmailConvite] = useState("");
  const [papelConvite, setPapelConvite] = useState("");
  const [convidando, setConvidando] = useState(false);
  const [acaoErro, setAcaoErro] = useState("");

  const carregar = useCallback(async () => {
    if (!quadroId) return;

    setLoading(true);
    setErro("");

    try {
      const [resQuadro, resMembros, resPapeis] = await Promise.all([
        quadroService.obterPorId(quadroId),
        quadroMembroService.listar(quadroId),
        quadroPapelService.listar(quadroId).catch(() => ({ data: [] })),
      ]);

      let data = extractObject(resQuadro) || resQuadro;

      if (data?.organizacaoId && !data.organizacao?.nome) {
        try {
          const orgRes = await buscarOrganizacaoPorId(data.organizacaoId);
          const org = extractObject(orgRes) || orgRes;
          data = {
            ...data,
            organizacao: { id: data.organizacaoId, nome: org?.nome || "" },
          };
        } catch {
          data = {
            ...data,
            organizacao: { id: data.organizacaoId, nome: "Organização" },
          };
        }
      }

      setQuadro(data);
      setMembros(extractList(resMembros));
      setPapeis(extractList(resPapeis));
    } catch (error) {
      setErro(
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível carregar os membros."
      );
      setQuadro(null);
      setMembros([]);
    } finally {
      setLoading(false);
    }
  }, [quadroId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    if (papeis.length && !papelConvite) {
      const padrao = papeis.find((p) => p.nome === "Colaborador") || papeis[0];
      setPapelConvite(padrao?.nome || "");
    }
  }, [papeis, papelConvite]);

  const membrosFiltrados = useMemo(() => {
    return membros.filter((membro) => {
      const termo = busca.trim().toLowerCase();
      const papelStr =
        membro.papel ||
        (Array.isArray(membro.papeis)
          ? membro.papeis.map((p) => p?.nome || p).join(" ")
          : "");

      const correspondeBusca =
        !termo ||
        String(membro.nome || "")
          .toLowerCase()
          .includes(termo) ||
        String(membro.email || "")
          .toLowerCase()
          .includes(termo) ||
        String(papelStr).toLowerCase().includes(termo);

      const status = membro.status || "ativo";
      const correspondeStatus =
        filtroStatus === "todos" || status === filtroStatus;

      return correspondeBusca && correspondeStatus;
    });
  }, [busca, filtroStatus, membros]);

  const totalAtivos = membrosFiltrados.filter(
    (m) => (m.status || "ativo") === "ativo"
  ).length;
  const totalPendentes = membrosFiltrados.filter(
    (m) => m.status === "pendente"
  ).length;

  async function handleAlterarPapel(membroId, novoPapelNome) {
    setAcaoErro("");
    try {
      await quadroMembroService.atualizarPapel(quadroId, membroId, {
        papel: novoPapelNome,
      });
      await carregar();
    } catch (e) {
      setAcaoErro(
        e?.response?.data?.message ||
          e?.message ||
          "Não foi possível atualizar o papel."
      );
    }
  }

  async function handleRemover(membroId) {
    if (!window.confirm("Remover este membro do quadro?")) return;
    setAcaoErro("");
    try {
      await quadroMembroService.remover(quadroId, membroId);
      await carregar();
    } catch (e) {
      setAcaoErro(
        e?.response?.data?.message ||
          e?.message ||
          "Não foi possível remover o membro."
      );
    }
  }

  async function handleReenviarConvite(membroId) {
    setAcaoErro("");
    try {
      await quadroMembroService.reenviarConvite(quadroId, membroId);
      await carregar();
    } catch (e) {
      setAcaoErro(
        e?.response?.data?.message ||
          e?.message ||
          "Não foi possível reenviar o convite."
      );
    }
  }

  async function handleEnviarConvite(event) {
    event.preventDefault();
    setAcaoErro("");
    setConvidando(true);
    try {
      await quadroMembroService.convidar(quadroId, {
        email: emailConvite.trim(),
        papel: papelConvite || "Colaborador",
      });
      setModalConvite(false);
      setEmailConvite("");
      await carregar();
    } catch (e) {
      setAcaoErro(
        e?.response?.data?.message ||
          e?.message ||
          "Não foi possível enviar o convite."
      );
    } finally {
      setConvidando(false);
    }
  }

  function handleAbrirQuadro() {
    navigate(`/quadros/${quadroId}`);
  }

  if (loading && !quadro) {
    return (
      <AppLayout
        title="Membros do quadro"
        subtitle="Carregando…"
        breadcrumbItems={[
          { label: "Início", href: "/home" },
          { label: "Quadros", href: "/quadros" },
        ]}
        user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      >
        <LoadingState title="Carregando membros" />
      </AppLayout>
    );
  }

  if (erro || !quadro) {
    return (
      <AppLayout
        title="Membros do quadro"
        subtitle="Erro"
        breadcrumbItems={[
          { label: "Início", href: "/home" },
          { label: "Quadros", href: "/quadros" },
        ]}
        user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      >
        <ErrorState
          title="Não foi possível carregar"
          description={erro || "Quadro indisponível."}
          action={
            <Button variant="primary" onClick={() => navigate("/quadros")}>
              Voltar
            </Button>
          }
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Membros do quadro"
      subtitle="Gerencie acesso, papéis e participação no quadro"
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Quadros", href: "/quadros" },
        { label: quadro.nome, href: `/quadros/${quadro.id}` },
        { label: "Membros" },
      ]}
      user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
    >
      <div className="quadro-membros-page">
        <PageHeader
          title="Membros do quadro"
          description={`Controle quem participa do quadro "${quadro.nome}".`}
          actions={
            <>
              <Button variant="secondary" onClick={handleAbrirQuadro}>
                Ver quadro
              </Button>

              <Button
                variant="primary"
                leftIcon={<UserPlus size={16} />}
                onClick={() => setModalConvite(true)}
              >
                Convidar membro
              </Button>
            </>
          }
        />

        {acaoErro ? (
          <p className="quadro-membros-page__feedback quadro-membros-page__feedback--error" role="alert">
            {acaoErro}
          </p>
        ) : null}

        <section
          className="quadro-membros-page__hero"
          aria-labelledby="quadro-membros-hero-title"
        >
          <div className="quadro-membros-page__hero-content">
            <div className="quadro-membros-page__hero-badge">
              <Users size={14} aria-hidden="true" />
              <span>Participação e acesso</span>
            </div>

            <h2
              id="quadro-membros-hero-title"
              className="quadro-membros-page__hero-title"
            >
              Estruture a colaboração com vínculos e papéis claros.
            </h2>

            <p className="quadro-membros-page__hero-description">
              Organização:{" "}
              <strong>{quadro.organizacao?.nome || "—"}</strong>.
            </p>
          </div>
        </section>

        <section
          className="quadro-membros-page__toolbar"
          aria-label="Ferramentas de busca e filtro"
        >
          <div className="quadro-membros-page__toolbar-group quadro-membros-page__toolbar-group--search">
            <label htmlFor="quadro-membros-busca" className="sr-only">
              Buscar membros
            </label>

            <div className="quadro-membros-page__search">
              <span
                className="quadro-membros-page__search-icon"
                aria-hidden="true"
              >
                <Search size={16} />
              </span>

              <input
                id="quadro-membros-busca"
                type="search"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar por nome, e-mail ou papel"
                className="quadro-membros-page__search-input"
              />
            </div>
          </div>

          <div className="quadro-membros-page__toolbar-group">
            <label htmlFor="quadro-membros-status" className="sr-only">
              Filtrar por status
            </label>

            <select
              id="quadro-membros-status"
              value={filtroStatus}
              onChange={(event) => setFiltroStatus(event.target.value)}
              className="quadro-membros-page__filter-select"
            >
              <option value="todos">Todos os status</option>
              <option value="ativo">Somente ativos</option>
              <option value="pendente">Somente pendentes</option>
            </select>
          </div>
        </section>

        <section
          className="quadro-membros-page__summary"
          aria-label="Resumo de membros do quadro"
        >
          <article className="quadro-membros-page__summary-card">
            <p className="quadro-membros-page__summary-label">Total exibido</p>
            <strong className="quadro-membros-page__summary-value">
              {membrosFiltrados.length}
            </strong>
          </article>

          <article className="quadro-membros-page__summary-card">
            <p className="quadro-membros-page__summary-label">Ativos</p>
            <strong className="quadro-membros-page__summary-value">
              {totalAtivos}
            </strong>
          </article>

          <article className="quadro-membros-page__summary-card">
            <p className="quadro-membros-page__summary-label">Pendentes</p>
            <strong className="quadro-membros-page__summary-value">
              {totalPendentes}
            </strong>
          </article>
        </section>

        {membrosFiltrados.length === 0 ? (
          <section className="quadro-membros-page__empty">
            <EmptyState
              icon={<Users size={40} />}
              title="Nenhum membro encontrado"
              description="Ajuste os filtros ou convide novos participantes."
              action={
                <Button
                  variant="primary"
                  leftIcon={<UserPlus size={16} />}
                  onClick={() => setModalConvite(true)}
                >
                  Convidar membro
                </Button>
              }
            />
          </section>
        ) : (
          <QuadroMembrosTable
            membros={membrosFiltrados}
            papeisDisponiveis={papeis}
            onAlterarPapel={handleAlterarPapel}
            onRemover={handleRemover}
            onReenviarConvite={handleReenviarConvite}
          />
        )}
      </div>

      {modalConvite ? (
        <div
          className="quadro-membros-page__modal-overlay"
          role="presentation"
          onClick={() => !convidando && setModalConvite(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="convite-titulo"
            className="quadro-membros-page__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="convite-titulo" className="quadro-membros-page__modal-title">
              Convidar membro
            </h2>
            <form className="quadro-membros-page__modal-form" onSubmit={handleEnviarConvite}>
              <div className="quadro-membros-page__modal-field">
                <label
                  htmlFor="convite-email"
                  className="quadro-membros-page__modal-label"
                >
                  E-mail
                </label>
                <input
                  id="convite-email"
                  type="email"
                  required
                  value={emailConvite}
                  onChange={(e) => setEmailConvite(e.target.value)}
                  className="quadro-membros-page__modal-input"
                  placeholder="nome@exemplo.com"
                />
              </div>
              <div className="quadro-membros-page__modal-field">
                <label
                  htmlFor="convite-papel"
                  className="quadro-membros-page__modal-label"
                >
                  Papel inicial
                </label>
                <select
                  id="convite-papel"
                  value={papelConvite}
                  onChange={(e) => setPapelConvite(e.target.value)}
                  className="quadro-membros-page__modal-select"
                >
                  {papeis.map((p) => (
                    <option key={p.id || p.nome} value={p.nome}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="quadro-membros-page__modal-actions">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => !convidando && setModalConvite(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" loading={convidando}>
                  Enviar convite
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AppLayout>
  );
}
