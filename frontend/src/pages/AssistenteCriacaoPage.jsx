import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import Select from "../components/ui/Select";
import useAuth from "../hooks/useAuth";

import { criarOrganizacao } from "../services/organizacaoService";
import quadroService from "../services/quadroService";
import listaService from "../services/listaService";
import cartaoService from "../services/cartaoService";
import { extractObject } from "../utils/apiData";

import "../styles/pages/assistente-criacao.css";

const ETAPAS = [
  { id: 1, label: "Organização" },
  { id: 2, label: "Quadro" },
  { id: 3, label: "Listas" },
  { id: 4, label: "Cartões" },
  { id: 5, label: "Concluir" },
];

const LISTAS_PADRAO = ["A fazer", "Em andamento", "Revisar", "Concluído"];

function slugifyNome(nome) {
  const base = String(nome || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || "organizacao";
}

function novoIdLinha() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `linha-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function mensagemApi(error, fallback) {
  const d = error?.response?.data;
  if (typeof d?.message === "string" && d.message.trim()) return d.message.trim();
  if (Array.isArray(d?.errors) && d.errors.length)
    return d.errors.map(String).join(" ");
  if (typeof error?.message === "string" && error.message.trim())
    return error.message.trim();
  return fallback;
}

export default function AssistenteCriacaoPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [etapaAtual, setEtapaAtual] = useState(1);
  const [organizacaoCriada, setOrganizacaoCriada] = useState(null);
  const [quadroCriado, setQuadroCriado] = useState(null);
  const [listasCriadas, setListasCriadas] = useState([]);
  const [cartoesCriados, setCartoesCriados] = useState([]);

  const [orgNome, setOrgNome] = useState("");
  const [orgDesc, setOrgDesc] = useState("");
  const [quadroNome, setQuadroNome] = useState("");
  const [quadroDesc, setQuadroDesc] = useState("");
  const [listaRows, setListaRows] = useState([]);

  const [cartTitulo, setCartTitulo] = useState("");
  const [cartListaId, setCartListaId] = useState("");
  const [cartDesc, setCartDesc] = useState("");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const currentUser = useMemo(() => {
    const nome =
      usuario?.nome || usuario?.name || usuario?.email || "Usuário";
    return { name: nome };
  }, [usuario]);

  const resetWizard = useCallback(() => {
    setEtapaAtual(1);
    setOrganizacaoCriada(null);
    setQuadroCriado(null);
    setListasCriadas([]);
    setCartoesCriados([]);
    setOrgNome("");
    setOrgDesc("");
    setQuadroNome("");
    setQuadroDesc("");
    setListaRows([]);
    setCartTitulo("");
    setCartListaId("");
    setCartDesc("");
    setErro("");
    setLoading(false);
  }, []);

  useEffect(() => {
    if (etapaAtual !== 3 || listasCriadas.length > 0) return;
    if (listaRows.length > 0) return;
    setListaRows(
      LISTAS_PADRAO.map((nome) => ({ id: novoIdLinha(), nome }))
    );
  }, [etapaAtual, listasCriadas.length, listaRows.length]);

  useEffect(() => {
    if (etapaAtual !== 4 || listasCriadas.length === 0) return;
    if (cartListaId) return;
    const aFazer = listasCriadas.find(
      (l) => String(l.nome || "").toLowerCase() === "a fazer"
    );
    setCartListaId(String((aFazer || listasCriadas[0]).id));
  }, [etapaAtual, listasCriadas, cartListaId]);

  async function handleSalvarOrganizacao() {
    setErro("");
    const nome = orgNome.trim();
    if (!nome) {
      setErro("Informe o nome da organização.");
      return;
    }
    if (nome.length < 2) {
      setErro("O nome da organização deve ter pelo menos 2 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const slug = slugifyNome(nome);
      const res = await criarOrganizacao({
        nome,
        slug,
        ativo: true,
        descricao: orgDesc.trim() || undefined,
      });
      const org = extractObject(res) ?? res?.data;
      const id = org?.id;
      if (!id) {
        throw new Error(
          mensagemApi({ message: res?.message }, "Não foi possível criar a organização.")
        );
      }
      setOrganizacaoCriada({
        id: Number(id),
        nome: org?.nome || nome,
        descricao: org?.descricao ?? (orgDesc.trim() || null),
      });
      setEtapaAtual(2);
    } catch (e) {
      setErro(
        mensagemApi(e, "Não foi possível criar a organização. Tente novamente.")
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSalvarQuadro() {
    setErro("");
    if (!organizacaoCriada?.id) {
      setErro("Crie uma organização antes de continuar.");
      return;
    }
    const nome = quadroNome.trim();
    if (!nome) {
      setErro("Informe o nome do quadro.");
      return;
    }

    setLoading(true);
    try {
      const res = await quadroService.criar({
        nome,
        descricao: quadroDesc.trim() || undefined,
        organizacaoId: organizacaoCriada.id,
      });
      const q = extractObject(res) ?? res?.data;
      const id = q?.id;
      if (!id) {
        throw new Error(
          mensagemApi({ message: res?.message }, "Não foi possível criar o quadro.")
        );
      }
      setQuadroCriado({
        id: Number(id),
        nome: q?.nome || nome,
      });
      setEtapaAtual(3);
    } catch (e) {
      setErro(mensagemApi(e, "Não foi possível criar o quadro. Tente novamente."));
    } finally {
      setLoading(false);
    }
  }

  async function handleSalvarListas() {
    setErro("");
    if (listasCriadas.length > 0) {
      setEtapaAtual(4);
      return;
    }
    if (!quadroCriado?.id) {
      setErro("Crie um quadro antes de continuar.");
      return;
    }
    const nomes = listaRows
      .map((r) => String(r.nome || "").trim())
      .filter(Boolean);
    if (nomes.length === 0) {
      setErro("Crie pelo menos uma lista para continuar.");
      return;
    }

    setLoading(true);
    try {
      const criadas = [];
      for (const nome of nomes) {
        const res = await listaService.criar(quadroCriado.id, { nome });
        const lista = extractObject(res) ?? res?.data;
        if (!lista?.id) {
          throw new Error(
            mensagemApi({ message: res?.message }, "Erro ao criar uma das listas.")
          );
        }
        criadas.push({
          id: Number(lista.id),
          nome: lista.nome || nome,
        });
      }
      setListasCriadas(criadas);
      setEtapaAtual(4);
    } catch (e) {
      setErro(mensagemApi(e, "Não foi possível criar as listas. Tente novamente."));
    } finally {
      setLoading(false);
    }
  }

  async function handleAdicionarCartao() {
    setErro("");
    const titulo = cartTitulo.trim();
    if (!titulo) {
      setErro("Informe o título do cartão.");
      return;
    }
    const listaId = Number(cartListaId);
    if (!listaId || !quadroCriado?.id) {
      setErro("Selecione a lista onde o cartão ficará.");
      return;
    }

    setLoading(true);
    try {
      const res = await cartaoService.criar(quadroCriado.id, {
        titulo,
        listaId,
        descricao: cartDesc.trim() || undefined,
      });
      const c = extractObject(res) ?? res?.data;
      if (!c?.id) {
        throw new Error(
          mensagemApi({ message: res?.message }, "Não foi possível criar o cartão.")
        );
      }
      const listaNome =
        listasCriadas.find((l) => l.id === listaId)?.nome || "Lista";
      setCartoesCriados((prev) => [
        ...prev,
        {
          id: Number(c.id),
          titulo: c.titulo || titulo,
          listaId,
          listaNome,
        },
      ]);
      setCartTitulo("");
      setCartDesc("");
    } catch (e) {
      setErro(mensagemApi(e, "Não foi possível criar o cartão. Tente novamente."));
    } finally {
      setLoading(false);
    }
  }

  function handleVoltar() {
    setErro("");
    setEtapaAtual((e) => Math.max(1, e - 1));
  }

  function handleContinuarSemRecreate() {
    setErro("");
    if (etapaAtual === 1 && organizacaoCriada) setEtapaAtual(2);
    else if (etapaAtual === 2 && quadroCriado) setEtapaAtual(3);
    else if (etapaAtual === 3 && listasCriadas.length > 0) setEtapaAtual(4);
  }

  function handleAdicionarLinhaLista() {
    setListaRows((rows) => [...rows, { id: novoIdLinha(), nome: "" }]);
  }

  function handleRemoverLinhaLista(id) {
    setListaRows((rows) => {
      if (rows.length <= 1) return rows;
      return rows.filter((r) => r.id !== id);
    });
  }

  function handleListaNomeChange(id, nome) {
    setListaRows((rows) =>
      rows.map((r) => (r.id === id ? { ...r, nome } : r))
    );
  }

  function handleMoverLista(id, dir) {
    setListaRows((rows) => {
      const i = rows.findIndex((r) => r.id === id);
      if (i < 0) return rows;
      const j = i + dir;
      if (j < 0 || j >= rows.length) return rows;
      const next = [...rows];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function handleIrHome() {
    resetWizard();
    navigate("/home");
  }

  function handleCancelarInicio() {
    resetWizard();
    navigate("/home");
  }

  const progresso = (
    <nav className="assistente-wizard__progress" aria-label="Progresso do assistente">
      <ol className="assistente-wizard__progress-list">
        {ETAPAS.map((s) => {
          const feito = etapaAtual > s.id;
          const atual = etapaAtual === s.id;
          return (
            <li
              key={s.id}
              className={`assistente-wizard__progress-item${
                atual ? " assistente-wizard__progress-item--current" : ""
              }${feito ? " assistente-wizard__progress-item--done" : ""}`}
              aria-current={atual ? "step" : undefined}
            >
              <span className="assistente-wizard__progress-num" aria-hidden="true">
                {s.id}
              </span>
              <span className="assistente-wizard__progress-label">{s.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );

  return (
    <AppLayout
      title="Assistente de Criação"
      subtitle="Vamos criar seu primeiro fluxo passo a passo."
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Assistente de Criação" },
      ]}
      user={currentUser}
      notificationCount={0}
    >
      <div className="assistente-wizard">
        <PageHeader
          title="Assistente de Criação"
          description="Vamos criar seu primeiro fluxo passo a passo."
        />

        {progresso}

        {erro ? (
          <div className="assistente-wizard__alert" role="alert">
            {erro}
          </div>
        ) : null}

        <div className="assistente-wizard__card">
          {etapaAtual === 1 && (
            <>
              <h2 className="assistente-wizard__step-title">Criar Organização</h2>
              <p className="assistente-wizard__lead">
                Primeiro, crie o espaço principal onde seus quadros ficarão agrupados.
              </p>
              <p className="assistente-wizard__hint">
                A Organização é o espaço principal do seu trabalho. Ela agrupa os
                quadros relacionados ao mesmo assunto.
              </p>
              <p className="assistente-wizard__example">
                Exemplo: Vestibular, Casa, Trabalho ou Vida pessoal.
              </p>

              {organizacaoCriada ? (
                <>
                  <p className="assistente-wizard__context">
                    Organização criada:{" "}
                    <strong>{organizacaoCriada.nome}</strong>
                  </p>
                  <div className="assistente-wizard__actions">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleContinuarSemRecreate}
                    >
                      Continuar para quadro
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="assistente-wizard__field">
                    <label className="assistente-wizard__label" htmlFor="assistente-org-nome">
                      Nome da organização <span aria-hidden="true">*</span>
                    </label>
                    <Input
                      id="assistente-org-nome"
                      name="orgNome"
                      value={orgNome}
                      onChange={(e) => setOrgNome(e.target.value)}
                      autoComplete="organization"
                      required
                      maxLength={120}
                      disabled={loading}
                    />
                  </div>
                  <div className="assistente-wizard__field">
                    <label className="assistente-wizard__label" htmlFor="assistente-org-desc">
                      Descrição <span className="assistente-wizard__optional">(opcional)</span>
                    </label>
                    <Textarea
                      id="assistente-org-desc"
                      name="orgDesc"
                      value={orgDesc}
                      onChange={(e) => setOrgDesc(e.target.value)}
                      rows={3}
                      maxLength={500}
                      disabled={loading}
                    />
                  </div>
                  <div className="assistente-wizard__actions">
                    <Button
                      type="button"
                      variant="primary"
                      loading={loading}
                      onClick={handleSalvarOrganizacao}
                    >
                      Salvar e continuar
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={loading}
                      onClick={handleCancelarInicio}
                    >
                      Cancelar
                    </Button>
                  </div>
                </>
              )}
            </>
          )}

          {etapaAtual === 2 && (
            <>
              <h2 className="assistente-wizard__step-title">Criar Quadro</h2>
              <p className="assistente-wizard__lead">
                Agora crie uma área de trabalho dentro dessa organização.
              </p>
              <p className="assistente-wizard__hint">
                O Quadro é uma área de trabalho dentro da Organização. Ele organiza um
                tema, projeto ou processo específico.
              </p>
              {!organizacaoCriada ? (
                <div className="assistente-wizard__alert assistente-wizard__alert--row" role="alert">
                  <span>Conclua a etapa de organização antes de criar um quadro.</span>
                  <Button type="button" variant="secondary" onClick={() => setEtapaAtual(1)}>
                    Ir para organização
                  </Button>
                </div>
              ) : (
                <p className="assistente-wizard__context">
                  Organização criada:{" "}
                  <strong>{organizacaoCriada.nome}</strong>
                </p>
              )}
              <p className="assistente-wizard__example">
                Se a Organização for “Vestibular”, um Quadro pode ser “Matemática”.
              </p>

              {!organizacaoCriada ? null : quadroCriado ? (
                <div className="assistente-wizard__actions">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleContinuarSemRecreate}
                  >
                    Continuar para listas
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleVoltar}>
                    Voltar
                  </Button>
                </div>
              ) : (
                <>
                  <div className="assistente-wizard__field">
                    <label className="assistente-wizard__label" htmlFor="assistente-quadro-nome">
                      Nome do quadro <span aria-hidden="true">*</span>
                    </label>
                    <Input
                      id="assistente-quadro-nome"
                      name="quadroNome"
                      value={quadroNome}
                      onChange={(e) => setQuadroNome(e.target.value)}
                      required
                      maxLength={120}
                      disabled={loading}
                    />
                  </div>
                  <div className="assistente-wizard__field">
                    <label className="assistente-wizard__label" htmlFor="assistente-quadro-desc">
                      Descrição <span className="assistente-wizard__optional">(opcional)</span>
                    </label>
                    <Textarea
                      id="assistente-quadro-desc"
                      name="quadroDesc"
                      value={quadroDesc}
                      onChange={(e) => setQuadroDesc(e.target.value)}
                      rows={3}
                      disabled={loading}
                    />
                  </div>
                  <div className="assistente-wizard__actions">
                    <Button
                      type="button"
                      variant="primary"
                      loading={loading}
                      onClick={handleSalvarQuadro}
                    >
                      Salvar e continuar
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={loading}
                      onClick={handleVoltar}
                    >
                      Voltar
                    </Button>
                  </div>
                </>
              )}
            </>
          )}

          {etapaAtual === 3 && (
            <>
              <h2 className="assistente-wizard__step-title">Criar Listas</h2>
              <p className="assistente-wizard__lead">
                Agora defina as etapas pelas quais suas tarefas vão passar.
              </p>
              <p className="assistente-wizard__hint">
                As Listas são as etapas do trabalho dentro do Quadro. Elas mostram em
                que fase cada tarefa está.
              </p>
              {!quadroCriado ? (
                <div className="assistente-wizard__alert assistente-wizard__alert--row" role="alert">
                  <span>Conclua a etapa de quadro antes de criar listas.</span>
                  <Button type="button" variant="secondary" onClick={() => setEtapaAtual(2)}>
                    Ir para quadro
                  </Button>
                </div>
              ) : organizacaoCriada ? (
                <p className="assistente-wizard__context">
                  Organização: <strong>{organizacaoCriada.nome}</strong>
                  <br />
                  Quadro: <strong>{quadroCriado.nome}</strong>
                </p>
              ) : null}

              {!quadroCriado ? null : listasCriadas.length > 0 ? (
                <>
                  <p className="assistente-wizard__hint">
                    Listas já criadas neste assistente:
                  </p>
                  <ul className="assistente-wizard__bullets">
                    {listasCriadas.map((l) => (
                      <li key={l.id}>{l.nome}</li>
                    ))}
                  </ul>
                  <div className="assistente-wizard__actions">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleContinuarSemRecreate}
                    >
                      Continuar para cartões
                    </Button>
                    <Button type="button" variant="secondary" onClick={handleVoltar}>
                      Voltar
                    </Button>
                  </div>
                </>
              ) : !quadroCriado ? null : (
                <>
                  <fieldset className="assistente-wizard__fieldset">
                    <legend className="assistente-wizard__legend">Nomes das listas</legend>
                    {listaRows.map((row, idx) => (
                      <div key={row.id} className="assistente-wizard__lista-row">
                        <div className="assistente-wizard__lista-row-main">
                          <label className="assistente-wizard__sr-only" htmlFor={`lista-${row.id}`}>
                            Nome da lista {idx + 1}
                          </label>
                          <Input
                            id={`lista-${row.id}`}
                            value={row.nome}
                            onChange={(e) =>
                              handleListaNomeChange(row.id, e.target.value)
                            }
                            disabled={loading}
                            placeholder={`Lista ${idx + 1}`}
                          />
                        </div>
                        <div className="assistente-wizard__lista-row-actions">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            disabled={loading || idx === 0}
                            onClick={() => handleMoverLista(row.id, -1)}
                            aria-label={`Mover lista ${idx + 1} para cima`}
                          >
                            ↑
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            disabled={loading || idx >= listaRows.length - 1}
                            onClick={() => handleMoverLista(row.id, 1)}
                            aria-label={`Mover lista ${idx + 1} para baixo`}
                          >
                            ↓
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            disabled={loading || listaRows.length <= 1}
                            onClick={() => handleRemoverLinhaLista(row.id)}
                            aria-label={`Remover lista ${idx + 1}`}
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    ))}
                  </fieldset>
                  <div className="assistente-wizard__actions assistente-wizard__actions--wrap">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={loading}
                      onClick={handleAdicionarLinhaLista}
                    >
                      Adicionar lista
                    </Button>
                  </div>
                  <div className="assistente-wizard__actions">
                    <Button
                      type="button"
                      variant="primary"
                      loading={loading}
                      onClick={handleSalvarListas}
                    >
                      Criar listas e continuar
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={loading}
                      onClick={handleVoltar}
                    >
                      Voltar
                    </Button>
                  </div>
                </>
              )}
            </>
          )}

          {etapaAtual === 4 && (
            <>
              <h2 className="assistente-wizard__step-title">Criar Cartões</h2>
              <p className="assistente-wizard__lead">
                Agora adicione algumas tarefas iniciais. Você também pode pular esta etapa.
              </p>
              <p className="assistente-wizard__hint">
                Os Cartões são as tarefas, conteúdos ou demandas que você deseja
                acompanhar.
              </p>
              {listasCriadas.length === 0 ? (
                <div className="assistente-wizard__alert assistente-wizard__alert--row" role="alert">
                  <span>Crie as listas antes de adicionar cartões.</span>
                  <Button type="button" variant="secondary" onClick={() => setEtapaAtual(3)}>
                    Ir para listas
                  </Button>
                </div>
              ) : null}
              {organizacaoCriada && quadroCriado ? (
                <p className="assistente-wizard__context">
                  Organização: <strong>{organizacaoCriada.nome}</strong>
                  <br />
                  Quadro: <strong>{quadroCriado.nome}</strong>
                  {listasCriadas.length > 0 ? (
                    <>
                      <br />
                      Listas:{" "}
                      <strong>{listasCriadas.map((l) => l.nome).join(", ")}</strong>
                    </>
                  ) : null}
                </p>
              ) : null}
              {listasCriadas.length > 0 ? (
                <p className="assistente-wizard__example">
                  Exemplos: Funções, Comprar materiais, Retornar cliente, Pagar contas.
                </p>
              ) : null}

              {listasCriadas.length > 0 && cartoesCriados.length > 0 ? (
                <ul className="assistente-wizard__bullets">
                  {cartoesCriados.map((c) => (
                    <li key={c.id}>
                      {c.titulo}{" "}
                      <span className="assistente-wizard__muted">({c.listaNome})</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {listasCriadas.length === 0 ? null : (
                <>
                  <div className="assistente-wizard__field">
                    <label className="assistente-wizard__label" htmlFor="assistente-cart-titulo">
                      Título do cartão <span aria-hidden="true">*</span>
                    </label>
                    <Input
                      id="assistente-cart-titulo"
                      value={cartTitulo}
                      onChange={(e) => setCartTitulo(e.target.value)}
                      disabled={loading}
                      maxLength={200}
                    />
                  </div>
                  <div className="assistente-wizard__field">
                    <label className="assistente-wizard__label" htmlFor="assistente-cart-lista">
                      Lista <span aria-hidden="true">*</span>
                    </label>
                    <Select
                      id="assistente-cart-lista"
                      value={cartListaId}
                      onChange={(e) => setCartListaId(e.target.value)}
                      disabled={loading || listasCriadas.length === 0}
                    >
                      {listasCriadas.map((l) => (
                        <option key={l.id} value={String(l.id)}>
                          {l.nome}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="assistente-wizard__field">
                    <label className="assistente-wizard__label" htmlFor="assistente-cart-desc">
                      Descrição{" "}
                      <span className="assistente-wizard__optional">(opcional)</span>
                    </label>
                    <Textarea
                      id="assistente-cart-desc"
                      value={cartDesc}
                      onChange={(e) => setCartDesc(e.target.value)}
                      rows={2}
                      disabled={loading}
                    />
                  </div>

                  <div className="assistente-wizard__actions assistente-wizard__actions--wrap">
                    <Button
                      type="button"
                      variant="secondary"
                      loading={loading}
                      onClick={handleAdicionarCartao}
                      disabled={loading || !cartTitulo.trim()}
                    >
                      Adicionar cartão
                    </Button>
                  </div>

                  <div className="assistente-wizard__actions">
                    <Button
                      type="button"
                      variant="primary"
                      disabled={loading}
                      onClick={() => {
                        setErro("");
                        setEtapaAtual(5);
                      }}
                    >
                      Finalizar assistente
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={loading}
                      onClick={() => {
                        setErro("");
                        setEtapaAtual(5);
                      }}
                    >
                      Pular por enquanto
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={loading}
                      onClick={handleVoltar}
                    >
                      Voltar
                    </Button>
                  </div>
                </>
              )}
            </>
          )}

          {etapaAtual === 5 && !quadroCriado && (
            <>
              <h2 className="assistente-wizard__step-title">Fluxo incompleto</h2>
              <p className="assistente-wizard__hint">
                Conclua as etapas anteriores para ver o resumo e abrir o quadro.
              </p>
              <div className="assistente-wizard__actions">
                <Button type="button" variant="primary" onClick={() => setEtapaAtual(1)}>
                  Voltar ao início do assistente
                </Button>
                <Button type="button" variant="secondary" onClick={handleIrHome}>
                  Voltar para Home
                </Button>
              </div>
            </>
          )}

          {etapaAtual === 5 && quadroCriado && (
            <>
              <h2 className="assistente-wizard__step-title">Tudo pronto</h2>
              <p className="assistente-wizard__lead">
                Seu fluxo inicial foi criado com sucesso. Abra o quadro para continuar
                organizando suas tarefas.
              </p>

              <div className="assistente-wizard__resumo">
                <p>
                  <strong>Organização:</strong> {organizacaoCriada?.nome || "—"}
                </p>
                <p>
                  <strong>Quadro:</strong> {quadroCriado.nome}
                </p>
                <div>
                  <strong>Listas criadas:</strong>
                  <ul className="assistente-wizard__bullets">
                    {listasCriadas.map((l) => (
                      <li key={l.id}>{l.nome}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Cartões criados:</strong>
                  {cartoesCriados.length === 0 ? (
                    <p className="assistente-wizard__muted">
                      Nenhum cartão criado ainda. Você poderá criar cartões diretamente no
                      quadro.
                    </p>
                  ) : (
                    <ul className="assistente-wizard__bullets">
                      {cartoesCriados.map((c) => (
                        <li key={c.id}>{c.titulo}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="assistente-wizard__actions">
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => navigate(`/quadros/${quadroCriado.id}`)}
                >
                  Abrir quadro
                </Button>
                <Button type="button" variant="secondary" onClick={handleIrHome}>
                  Voltar para Home
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
