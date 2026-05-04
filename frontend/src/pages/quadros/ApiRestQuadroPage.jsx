import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Braces, Copy } from "lucide-react";

import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import useAuth from "../../hooks/useAuth";
import quadroService from "../../services/quadroService";
import listaService from "../../services/listaService";
import cartaoService from "../../services/cartaoService";
import { extractList, extractObject } from "../../utils/apiData";

import "../../styles/pages/api-rest-quadro.css";

function CopySnippetButton({ label, textToCopy, onCopied }) {
  const [status, setStatus] = useState("");

  const handleCopy = useCallback(async () => {
    if (!textToCopy) return;
    if (!navigator?.clipboard?.writeText) {
      setStatus("Não foi possível copiar automaticamente.");
      onCopied?.();
      return;
    }
    try {
      await navigator.clipboard.writeText(textToCopy);
      setStatus("Copiado.");
      onCopied?.();
    } catch {
      setStatus("Não foi possível copiar automaticamente.");
      onCopied?.();
    }
  }, [onCopied, textToCopy]);

  useEffect(() => {
    if (!status) return undefined;
    const timeoutId = setTimeout(() => setStatus(""), 2200);
    return () => clearTimeout(timeoutId);
  }, [status]);

  return (
    <div className="api-rest-quadro-page__copy-wrap">
      <Button
        type="button"
        size="sm"
        variant="secondary"
        leftIcon={<Copy size={14} aria-hidden="true" />}
        onClick={handleCopy}
      >
        {label}
      </Button>
      <span className="api-rest-quadro-page__copy-status" aria-live="polite">
        {status}
      </span>
    </div>
  );
}

function codeJson(value) {
  return JSON.stringify(value, null, 2);
}

export default function ApiRestQuadroPage() {
  const navigate = useNavigate();
  const { quadroId } = useParams();
  const { usuario } = useAuth();

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [quadro, setQuadro] = useState(null);
  const [listas, setListas] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [erroResumo, setErroResumo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState("");
  const [sucessoEnvio, setSucessoEnvio] = useState("");
  const [cartaoCriado, setCartaoCriado] = useState(null);
  const [mostrarToken, setMostrarToken] = useState(false);
  const [copiouToken, setCopiouToken] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    mensagem: "",
    listaId: "",
    prioridade: "media",
  });

  const carregarDados = useCallback(async () => {
    if (!quadroId) return;
    setLoading(true);
    setErro("");
    setErroResumo("");
    try {
      const [quadroRes, listasRes] = await Promise.all([
        quadroService.obterPorId(quadroId),
        listaService.listar(quadroId),
      ]);
      setQuadro(extractObject(quadroRes) || quadroRes);
      const listasExtraidas = extractList(listasRes);
      setListas(listasExtraidas);
      setFormData((prev) => ({
        ...prev,
        listaId: prev.listaId || String(listasExtraidas[0]?.id || ""),
      }));

      try {
        const resumoRes = await quadroService.obterResumo(quadroId);
        setResumo(extractObject(resumoRes) || resumoRes);
      } catch (summaryError) {
        setResumo(null);
        setErroResumo(
          summaryError?.response?.data?.message ||
            summaryError?.message ||
            "Não foi possível carregar o resumo do quadro."
        );
      }
    } catch (error) {
      setErro(
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível carregar os dados do quadro."
      );
    } finally {
      setLoading(false);
    }
  }, [quadroId]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const dominioExemplo = typeof window !== "undefined" ? window.location.origin : "https://SEU_DOMINIO";
  const tokenAtual = typeof window !== "undefined" ? window.localStorage.getItem("sgt_token") || "" : "";
  const tokenMascarado =
    tokenAtual.length > 14
      ? `${tokenAtual.slice(0, 8)}...${tokenAtual.slice(-6)}`
      : tokenAtual || "Token não encontrado nesta sessão.";
  const primeiraLista = listas[0] || null;
  const idListaExemplo = primeiraLista?.id || "ID_DA_LISTA";

  const endpointLogin = "POST /api/auth/login";
  const loginBody = useMemo(
    () =>
      codeJson({
        email: "usuario@email.com",
        senha: "sua-senha",
      }),
    []
  );
  const authHeader = "Authorization: Bearer SEU_TOKEN_AQUI";
  const endpointResumo = `GET /api/quadros/${quadroId}/resumo`;
  const curlResumo = `curl -X GET "${dominioExemplo}/api/quadros/${quadroId}/resumo" \\\n  -H "Authorization: Bearer SEU_TOKEN_AQUI"`;
  const endpointListas = `GET /api/quadros/${quadroId}/listas`;
  const curlListas = `curl -X GET "${dominioExemplo}/api/quadros/${quadroId}/listas" \\\n  -H "Authorization: Bearer SEU_TOKEN_AQUI"`;
  const endpointCriarCartao = `POST /api/quadros/${quadroId}/cartoes`;
  const bodyCriarCartao = codeJson({
    listaId: idListaExemplo,
    titulo: "Contato recebido pelo formulário",
    descricao:
      "Nome: Ana\nTelefone: (11) 99999-9999\nMensagem: Gostaria de um orçamento.",
    prioridade: "media",
  });
  const curlCriarCartao = `curl -X POST "${dominioExemplo}/api/quadros/${quadroId}/cartoes" \\\n  -H "Authorization: Bearer SEU_TOKEN_AQUI" \\\n  -H "Content-Type: application/json" \\\n  -d '${bodyCriarCartao}'`;

  const simulacaoPayload = useMemo(() => {
    const nome = formData.nome.trim();
    const telefone = formData.telefone.trim();
    const email = formData.email.trim();
    const mensagem = formData.mensagem.trim();
    return {
      listaId: formData.listaId ? Number(formData.listaId) : "ID_DA_LISTA",
      titulo: `Contato recebido pelo formulário - ${nome || "Sem nome"}`,
      descricao: `Nome: ${nome || "Não informado"}\nTelefone: ${telefone || "Não informado"}\nE-mail: ${email || "Não informado"}\nMensagem: ${mensagem || "Não informado"}\n\nOrigem: Simulação de formulário externo pela tela API REST do Quadro.`,
      prioridade: formData.prioridade || "media",
    };
  }, [formData]);

  const handleChangeField = useCallback((event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }, []);

  const limparFormulario = useCallback(() => {
    setFormData({
      nome: "",
      telefone: "",
      email: "",
      mensagem: "",
      listaId: String(listas[0]?.id || ""),
      prioridade: "media",
    });
    setFormErrors({});
    setErroEnvio("");
    setSucessoEnvio("");
    setCartaoCriado(null);
  }, [listas]);

  const handleMostrarToken = useCallback(async () => {
    if (!tokenAtual) {
      setCopiouToken("Token não disponível nesta sessão.");
      return;
    }
    if (!navigator?.clipboard?.writeText) {
      setCopiouToken("Não foi possível copiar automaticamente.");
      return;
    }
    try {
      await navigator.clipboard.writeText(tokenAtual);
      setCopiouToken("Token copiado.");
    } catch {
      setCopiouToken("Não foi possível copiar automaticamente.");
    }
  }, [tokenAtual]);

  const handleSubmitSimulacao = useCallback(
    async (event) => {
      event.preventDefault();
      const nextErrors = {};
      if (!formData.nome.trim()) nextErrors.nome = "Informe o nome.";
      if (!formData.mensagem.trim()) nextErrors.mensagem = "Informe a mensagem.";
      if (!formData.listaId) nextErrors.listaId = "Selecione a lista de destino.";
      if (!listas.length) nextErrors.listaId = "Crie pelo menos uma lista neste quadro.";

      if (Object.keys(nextErrors).length) {
        setFormErrors(nextErrors);
        setErroEnvio("Não foi possível criar o cartão. Verifique os campos e tente novamente.");
        setSucessoEnvio("");
        return;
      }

      setErroEnvio("");
      setSucessoEnvio("");
      setEnviando(true);

      try {
        const payload = {
          listaId: Number(formData.listaId),
          titulo: simulacaoPayload.titulo,
          descricao: simulacaoPayload.descricao,
          prioridade: formData.prioridade || "media",
        };
        const response = await cartaoService.criar(quadroId, payload);
        const novoCartao = extractObject(response) || response?.data || response;
        setCartaoCriado(novoCartao);
        setSucessoEnvio("Cartão criado com sucesso via API.");
      } catch {
        setErroEnvio("Não foi possível criar o cartão. Verifique os campos e tente novamente.");
      } finally {
        setEnviando(false);
      }
    },
    [formData, listas.length, quadroId, simulacaoPayload]
  );

  if (loading) {
    return (
      <AppLayout
        title="API REST do Quadro"
        subtitle="Carregando..."
        breadcrumbItems={[
          { label: "Início", href: "/home" },
          { label: "Quadros", href: "/quadros" },
          { label: "..." },
        ]}
        user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      >
        <LoadingState title="Carregando documentação prática da API" />
      </AppLayout>
    );
  }

  if (erro || !quadro) {
    return (
      <AppLayout
        title="API REST do Quadro"
        subtitle="Erro"
        breadcrumbItems={[
          { label: "Início", href: "/home" },
          { label: "Quadros", href: "/quadros" },
        ]}
        user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      >
        <ErrorState
          title="Não foi possível abrir a página de API"
          description={erro || "Quadro não encontrado."}
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
      title="API REST do Quadro"
      subtitle="Documentação prática e demonstrável"
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Quadros", href: "/quadros" },
        { label: quadro.nome || `Quadro ${quadroId}`, href: `/quadros/${quadroId}` },
        { label: "API REST do Quadro" },
      ]}
      user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
    >
      <div className="api-rest-quadro-page">
        <div className="api-rest-quadro-page__back">
          <Button
            type="button"
            variant="secondary"
            leftIcon={<ArrowLeft size={16} aria-hidden="true" />}
            onClick={() => navigate(`/quadros/${quadroId}/configuracoes`)}
          >
            Voltar para Gerenciar Quadro
          </Button>
        </div>

        <PageHeader
          title="API REST do Quadro"
          description="Use estes exemplos para consultar dados deste quadro ou criar cartões a partir de sistemas externos."
        />

        <section className="api-rest-quadro-page__section">
          <p className="api-rest-quadro-page__intro">
            Esta tela mostra exemplos de uso da API REST do sistema. Com ela, outro
            sistema pode consultar informações deste quadro ou criar cartões
            automaticamente.
          </p>
          <p className="api-rest-quadro-page__intro">
            Exemplo de uso: um formulário externo pode enviar uma resposta para a API
            e essa resposta virar um cartão dentro deste quadro.
          </p>
        </section>

        <section className="api-rest-quadro-page__section api-rest-quadro-page__card">
          <h2>Dados do quadro</h2>
          <p><strong>ID do quadro:</strong> {quadroId}</p>
          <p><strong>Nome:</strong> {quadro.nome || "Não informado"}</p>
          <p><strong>Endpoint base:</strong> {`GET /api/quadros/${quadroId}`}</p>
          <CopySnippetButton label="Copiar ID do quadro" textToCopy={String(quadroId)} />
        </section>

        <section className="api-rest-quadro-page__section api-rest-quadro-page__card">
          <h2>1. Autenticação</h2>
          <p>
            Para usar endpoints protegidos, faça login e use o token no cabeçalho
            Authorization.
          </p>
          <pre><code>{endpointLogin}</code></pre>
          <pre><code>{loginBody}</code></pre>
          <pre><code>{authHeader}</code></pre>
          <div className="api-rest-quadro-page__actions">
            <CopySnippetButton label="Copiar endpoint de login" textToCopy={endpointLogin} />
            <CopySnippetButton label="Copiar body de login" textToCopy={loginBody} />
            <CopySnippetButton label="Copiar cabeçalho Authorization" textToCopy={authHeader} />
          </div>
          <details className="api-rest-quadro-page__details">
            <summary>Token da sessão atual (opcional)</summary>
            <p className="api-rest-quadro-page__muted">
              O token não precisa ser copiado para usar este simulador. O sistema usa
              automaticamente sua sessão atual.
            </p>
            <p className="api-rest-quadro-page__warning">
              Atenção: este token permite acessar a API com sua conta. Não compartilhe
              publicamente.
            </p>
            <div className="api-rest-quadro-page__actions">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setMostrarToken((prev) => !prev)}
              >
                {mostrarToken ? "Ocultar token da sessão atual" : "Mostrar token da sessão atual"}
              </Button>
              {mostrarToken ? (
                <Button type="button" variant="secondary" size="sm" onClick={handleMostrarToken}>
                  Copiar token
                </Button>
              ) : null}
            </div>
            {mostrarToken ? <pre><code>{tokenMascarado}</code></pre> : null}
            <p className="api-rest-quadro-page__muted" aria-live="polite">{copiouToken}</p>
          </details>
        </section>

        <section className="api-rest-quadro-page__section api-rest-quadro-page__card">
          <h2>2. Consultar resumo do quadro</h2>
          <p>
            Retorna totais do quadro, listas, cartões por lista, cartões por prioridade
            e cartões vencidos.
          </p>
          <pre><code>{endpointResumo}</code></pre>
          <pre><code>{authHeader}</code></pre>
          <pre><code>{curlResumo}</code></pre>
          <div className="api-rest-quadro-page__actions">
            <CopySnippetButton label="Copiar endpoint" textToCopy={endpointResumo} />
            <CopySnippetButton label="Copiar exemplo curl" textToCopy={curlResumo} />
          </div>
        </section>

        <section className="api-rest-quadro-page__section api-rest-quadro-page__card">
          <h2>3. Listar listas do quadro</h2>
          <p>
            Use este endpoint para descobrir em qual lista um cartão deve ser criado.
          </p>
          <pre><code>{endpointListas}</code></pre>
          <pre><code>{authHeader}</code></pre>
          <pre><code>{curlListas}</code></pre>
          <div className="api-rest-quadro-page__actions">
            <CopySnippetButton label="Copiar endpoint" textToCopy={endpointListas} />
            <CopySnippetButton label="Copiar exemplo curl" textToCopy={curlListas} />
          </div>
          {listas.length ? (
            <div>
              <h3>Listas disponíveis</h3>
              <ul className="api-rest-quadro-page__list">
                {listas.map((lista) => (
                  <li key={lista.id}>
                    {lista.nome || "Sem nome"} - ID {lista.id}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="api-rest-quadro-page__muted">
              Consulte este endpoint para obter os IDs das listas disponíveis.
            </p>
          )}
        </section>

        <section className="api-rest-quadro-page__section api-rest-quadro-page__card">
          <h2>4. Criar cartão via API</h2>
          <p>
            Um formulário externo pode enviar dados para este endpoint e criar um cartão
            automaticamente no quadro.
          </p>
          <pre><code>{endpointCriarCartao}</code></pre>
          <pre><code>{`${authHeader}\nContent-Type: application/json`}</code></pre>
          <pre><code>{bodyCriarCartao}</code></pre>
          <pre><code>{curlCriarCartao}</code></pre>
          <div className="api-rest-quadro-page__actions">
            <CopySnippetButton label="Copiar endpoint" textToCopy={endpointCriarCartao} />
            <CopySnippetButton label="Copiar body JSON" textToCopy={bodyCriarCartao} />
            <CopySnippetButton label="Copiar exemplo curl" textToCopy={curlCriarCartao} />
          </div>
          {!primeiraLista ? (
            <p className="api-rest-quadro-page__muted">
              O exemplo usa <code>ID_DA_LISTA</code> porque este quadro ainda não tem
              listas.
            </p>
          ) : null}
        </section>

        <section className="api-rest-quadro-page__section api-rest-quadro-page__card">
          <h2>Simular formulário externo</h2>
          <p>
            Use este formulário para simular um sistema externo enviando dados para a
            API. Ao enviar, será criado um cartão real neste quadro.
          </p>
          <p className="api-rest-quadro-page__muted">
            Este teste usa sua sessão atual e suas permissões no sistema.
          </p>

          {!listas.length ? (
            <p role="alert" className="api-rest-quadro-page__error">
              Crie pelo menos uma lista no quadro antes de testar a criação de cartões via API.
            </p>
          ) : null}

          <form className="api-rest-quadro-page__form" onSubmit={handleSubmitSimulacao}>
            <div className="api-rest-quadro-page__field">
              <label htmlFor="sim-form-nome">Nome *</label>
              <input
                id="sim-form-nome"
                name="nome"
                type="text"
                value={formData.nome}
                onChange={handleChangeField}
                placeholder="Ex.: Ana Silva"
                required
                aria-invalid={Boolean(formErrors.nome)}
                aria-describedby={formErrors.nome ? "sim-form-nome-error" : undefined}
              />
              {formErrors.nome ? (
                <span id="sim-form-nome-error" role="alert" className="api-rest-quadro-page__field-error">
                  {formErrors.nome}
                </span>
              ) : null}
            </div>

            <div className="api-rest-quadro-page__grid">
              <div className="api-rest-quadro-page__field">
                <label htmlFor="sim-form-telefone">Telefone</label>
                <input
                  id="sim-form-telefone"
                  name="telefone"
                  type="text"
                  value={formData.telefone}
                  onChange={handleChangeField}
                  placeholder="Ex.: (11) 99999-9999"
                />
              </div>
              <div className="api-rest-quadro-page__field">
                <label htmlFor="sim-form-email">E-mail</label>
                <input
                  id="sim-form-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChangeField}
                  placeholder="Ex.: ana@email.com"
                />
              </div>
            </div>

            <div className="api-rest-quadro-page__field">
              <label htmlFor="sim-form-mensagem">Mensagem *</label>
              <textarea
                id="sim-form-mensagem"
                name="mensagem"
                value={formData.mensagem}
                onChange={handleChangeField}
                placeholder="Descreva a solicitação recebida pelo formulário"
                rows={4}
                required
                aria-invalid={Boolean(formErrors.mensagem)}
                aria-describedby={formErrors.mensagem ? "sim-form-mensagem-error" : undefined}
              />
              {formErrors.mensagem ? (
                <span id="sim-form-mensagem-error" role="alert" className="api-rest-quadro-page__field-error">
                  {formErrors.mensagem}
                </span>
              ) : null}
            </div>

            <div className="api-rest-quadro-page__grid">
              <div className="api-rest-quadro-page__field">
                <label htmlFor="sim-form-lista">Lista de destino *</label>
                <select
                  id="sim-form-lista"
                  name="listaId"
                  value={formData.listaId}
                  onChange={handleChangeField}
                  required
                  disabled={!listas.length}
                  aria-invalid={Boolean(formErrors.listaId)}
                  aria-describedby={formErrors.listaId ? "sim-form-lista-error" : undefined}
                >
                  <option value="">Selecione uma lista</option>
                  {listas.map((lista) => (
                    <option key={lista.id} value={lista.id}>
                      {lista.nome} (ID {lista.id})
                    </option>
                  ))}
                </select>
                {formErrors.listaId ? (
                  <span id="sim-form-lista-error" role="alert" className="api-rest-quadro-page__field-error">
                    {formErrors.listaId}
                  </span>
                ) : null}
              </div>
              <div className="api-rest-quadro-page__field">
                <label htmlFor="sim-form-prioridade">Prioridade</label>
                <select
                  id="sim-form-prioridade"
                  name="prioridade"
                  value={formData.prioridade}
                  onChange={handleChangeField}
                >
                  <option value="baixa">baixa</option>
                  <option value="media">media</option>
                  <option value="alta">alta</option>
                  <option value="urgente">urgente</option>
                </select>
              </div>
            </div>

            <div className="api-rest-quadro-page__actions">
              <Button
                type="submit"
                variant="primary"
                disabled={enviando || !listas.length}
                loading={enviando}
              >
                {enviando ? "Enviando para a API..." : "Enviar para API e criar cartão"}
              </Button>
              <Button type="button" variant="secondary" onClick={limparFormulario} disabled={enviando}>
                Criar outro cartão de teste
              </Button>
              <Button type="button" variant="ghost" onClick={limparFormulario} disabled={enviando}>
                Limpar formulário
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate(`/quadros/${quadroId}`)}>
                Abrir quadro
              </Button>
            </div>

            {erroEnvio ? (
              <p role="alert" className="api-rest-quadro-page__error">
                {erroEnvio}
              </p>
            ) : null}
            <p className="api-rest-quadro-page__success" aria-live="polite">
              {sucessoEnvio}
              {cartaoCriado?.id ? ` ID: ${cartaoCriado.id}.` : ""}
              {cartaoCriado?.titulo ? ` Título: ${cartaoCriado.titulo}.` : ""}
            </p>
          </form>

          <div className="api-rest-quadro-page__section api-rest-quadro-page__card api-rest-quadro-page__card--inner">
            <h3>Exemplo da requisição usada no simulador</h3>
            <p className="api-rest-quadro-page__muted">Endpoint usado: {endpointCriarCartao}</p>
            <pre><code>{codeJson(simulacaoPayload)}</code></pre>
            <CopySnippetButton label="Copiar exemplo JSON" textToCopy={codeJson(simulacaoPayload)} />
          </div>
        </section>

        <section className="api-rest-quadro-page__section api-rest-quadro-page__card">
          <h2>Resumo atual deste quadro</h2>
          {erroResumo ? (
            <p role="alert" className="api-rest-quadro-page__error">
              Não foi possível carregar o resumo do quadro. {erroResumo}
            </p>
          ) : resumo ? (
            <>
              <p><strong>Total de listas:</strong> {resumo.totalListas ?? 0}</p>
              <p><strong>Total de cartões:</strong> {resumo.totalCartoes ?? 0}</p>
              <p><strong>Cartões vencidos:</strong> {resumo.cartoesVencidos ?? 0}</p>
              <h3>Cartões por prioridade</h3>
              <pre><code>{codeJson(resumo.cartoesPorPrioridade || {})}</code></pre>
              <h3>Cartões por lista</h3>
              <pre><code>{codeJson(resumo.cartoesPorLista || [])}</code></pre>
            </>
          ) : (
            <p className="api-rest-quadro-page__muted">Resumo indisponível no momento.</p>
          )}
        </section>

        <section className="api-rest-quadro-page__section api-rest-quadro-page__card">
          <h2>Observações de segurança</h2>
          <p>
            Os endpoints exigem autenticação. Não compartilhe seu token publicamente.
            Para integrações reais, use credenciais controladas e revise as permissões
            do usuário responsável pela integração.
          </p>
        </section>
      </div>
    </AppLayout>
  );
}
