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
import { buscarOrganizacaoPorId } from "../../services/organizacaoService";
import { extractList, extractObject } from "../../utils/apiData";
import useAuth from "../../hooks/useAuth";

import {
  Building2,
  ListTodo,
  CheckSquare,
  Plus,
  Tag,
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
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    if (!quadroId) return;

    setLoading(true);
    setErro("");

    try {
      const [resQuadro, resMembros] = await Promise.all([
        quadroService.obterPorId(quadroId),
        quadroMembroService.listar(quadroId).catch(() => ({ data: [] })),
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
    } catch (error) {
      setErro(
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível carregar o quadro."
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

  const listas = quadro?.listas && Array.isArray(quadro.listas) ? quadro.listas : [];
  const atividades = quadro?.atividades && Array.isArray(quadro.atividades)
    ? quadro.atividades
    : [];

  const totalCartoes = useMemo(() => {
    return listas.reduce((acc, lista) => acc + (lista.totalCartoes || 0), 0);
  }, [listas]);

  function handleNovoCartao() {
    /* módulo de cartões */
  }

  function handleNovaLista() {
    /* módulo de listas */
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
                description="Quando o módulo de listas estiver ativo, você poderá criar e gerenciar colunas aqui."
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
                {listas.map((lista) => (
                  <article
                    key={lista.id}
                    className="quadro-detalhe-page__lista-card"
                  >
                    <div className="quadro-detalhe-page__lista-header">
                      <h4 className="quadro-detalhe-page__lista-title">
                        {lista.nome}
                      </h4>

                      <span className="quadro-detalhe-page__lista-total">
                        {lista.totalCartoes ?? 0} cartões
                      </span>
                    </div>

                    <div className="quadro-detalhe-page__lista-meta">
                      <span className="quadro-detalhe-page__lista-meta-item">
                        <Tag size={14} aria-hidden="true" />
                        <span>
                          {lista.limiteWip
                            ? `Limite WIP: ${lista.limiteWip}`
                            : "Sem limite WIP"}
                        </span>
                      </span>
                    </div>

                    <div className="quadro-detalhe-page__lista-footer">
                      <Button variant="ghost">Ver detalhes</Button>
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
    </AppLayout>
  );
}
