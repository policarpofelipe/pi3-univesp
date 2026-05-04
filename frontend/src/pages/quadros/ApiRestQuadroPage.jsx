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
      setListas(extractList(listasRes));

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
  const curlResumo = `curl -X GET "${dominioExemplo}/api/quadros/${quadroId}/resumo" \\\n+  -H "Authorization: Bearer SEU_TOKEN_AQUI"`;
  const endpointListas = `GET /api/quadros/${quadroId}/listas`;
  const curlListas = `curl -X GET "${dominioExemplo}/api/quadros/${quadroId}/listas" \\\n+  -H "Authorization: Bearer SEU_TOKEN_AQUI"`;
  const endpointCriarCartao = `POST /api/quadros/${quadroId}/cartoes`;
  const bodyCriarCartao = codeJson({
    listaId: idListaExemplo,
    titulo: "Contato recebido pelo formulário",
    descricao:
      "Nome: Ana\nTelefone: (11) 99999-9999\nMensagem: Gostaria de um orçamento.",
    prioridade: "media",
  });
  const curlCriarCartao = `curl -X POST "${dominioExemplo}/api/quadros/${quadroId}/cartoes" \\\n+  -H "Authorization: Bearer SEU_TOKEN_AQUI" \\\n+  -H "Content-Type: application/json" \\\n+  -d '${bodyCriarCartao}'`;

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
