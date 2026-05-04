import { useCallback, useEffect, useId, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Copy, RefreshCw } from "lucide-react";

import AppLayout from "../../components/layout/AppLayout";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import useAuth from "../../hooks/useAuth";
import quadroService from "../../services/quadroService";
import { consultarCnpj } from "../../services/consultasService";
import { extractObject } from "../../utils/apiData";
import {
  formatarCnpj,
  formatarCnpjDigitando,
  limparCnpj,
  validarCnpjBasico,
} from "../../utils/documentos";

import "../../styles/pages/consultas.css";

function montarTextoCopia(payload) {
  if (!payload?.success || !payload.data) return "";
  const d = payload.data;
  const e = d.endereco || {};
  const sec =
    Array.isArray(d.atividadesSecundarias) && d.atividadesSecundarias.length
      ? d.atividadesSecundarias.join("\n- ")
      : "";
  return [
    `Razão social: ${d.razaoSocial || "—"}`,
    `Nome fantasia: ${d.nomeFantasia || "—"}`,
    `CNPJ: ${d.cnpjFormatado || formatarCnpj(d.cnpj)}`,
    `Situação: ${d.situacao || "—"}`,
    `Data de abertura: ${d.dataAbertura || "—"}`,
    `Natureza jurídica: ${d.naturezaJuridica || "—"}`,
    `Porte: ${d.porte || "—"}`,
    `CNAE principal: ${d.cnaePrincipal || "—"}`,
    sec ? `Atividades secundárias:\n- ${sec}` : null,
    `Endereço: ${e.logradouro || ""} ${e.numero || ""} ${e.complemento || ""} — ${e.bairro || ""} — ${e.municipio || ""}/${e.uf || ""} — CEP ${e.cep || "—"}`,
    `Telefone: ${d.telefone || "—"}`,
    `E-mail: ${d.email || "—"}`,
    `Fonte da consulta: ${payload.fonte || "—"}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export default function ConsultaCnpjPage() {
  const navigate = useNavigate();
  const { quadroId } = useParams();
  const { usuario } = useAuth();
  const fieldId = useId();
  const errorId = useId();
  const hintId = `${fieldId}-hint`;
  const inputDescribedBy = [hintId, erroCampo ? errorId : null]
    .filter(Boolean)
    .join(" ");

  const [quadro, setQuadro] = useState(null);
  const [quadroErro, setQuadroErro] = useState("");
  const [carregandoQuadro, setCarregandoQuadro] = useState(true);

  const [cnpjInput, setCnpjInput] = useState("");
  const [erroCampo, setErroCampo] = useState("");
  const [erroConsulta, setErroConsulta] = useState("");
  const [consultando, setConsultando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [copiado, setCopiado] = useState(false);

  const carregarQuadro = useCallback(async () => {
    if (!quadroId) return;
    setCarregandoQuadro(true);
    setQuadroErro("");
    try {
      const res = await quadroService.obterPorId(quadroId);
      setQuadro(extractObject(res) || res);
    } catch (err) {
      setQuadroErro(
        err?.response?.data?.message ||
          err?.message ||
          "Não foi possível carregar o quadro."
      );
      setQuadro(null);
    } finally {
      setCarregandoQuadro(false);
    }
  }, [quadroId]);

  useEffect(() => {
    carregarQuadro();
  }, [carregarQuadro]);

  function handleCnpjChange(event) {
    setCnpjInput(formatarCnpjDigitando(event.target.value));
    setErroCampo("");
    setErroConsulta("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErroCampo("");
    setErroConsulta("");
    setResultado(null);
    setCopiado(false);

    const digits = limparCnpj(cnpjInput);
    if (!validarCnpjBasico(digits)) {
      setErroCampo("Informe um CNPJ com 14 dígitos.");
      return;
    }

    setConsultando(true);
    try {
      const data = await consultarCnpj(digits);
      if (data?.success) {
        setResultado(data);
      } else {
        setErroConsulta(
          data?.message ||
            "Não foi possível consultar o CNPJ no momento."
        );
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "O serviço de consulta está indisponível no momento. Tente novamente mais tarde.";
      if (err?.response?.status === 404) {
        setErroConsulta("Não encontramos dados para este CNPJ.");
      } else {
        setErroConsulta(msg);
      }
    } finally {
      setConsultando(false);
    }
  }

  async function handleCopiar() {
    const texto = montarTextoCopia(resultado);
    if (!texto) return;
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setErroConsulta("Não foi possível copiar. Selecione o texto manualmente.");
    }
  }

  function handleNovaConsulta() {
    setCnpjInput("");
    setResultado(null);
    setErroCampo("");
    setErroConsulta("");
    setCopiado(false);
  }

  function voltarConfig() {
    navigate(`/quadros/${quadroId}/configuracoes`);
  }

  if (carregandoQuadro) {
    return (
      <AppLayout
        title="Consultar CNPJ"
        subtitle="Carregando…"
        breadcrumbItems={[
          { label: "Início", href: "/home" },
          { label: "Quadros", href: "/quadros" },
          { label: "…" },
        ]}
        user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      >
        <LoadingState title="Carregando quadro" />
      </AppLayout>
    );
  }

  if (quadroErro || !quadro) {
    return (
      <AppLayout
        title="Consultar CNPJ"
        subtitle="Erro"
        breadcrumbItems={[
          { label: "Início", href: "/home" },
          { label: "Quadros", href: "/quadros" },
        ]}
        user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
      >
        <ErrorState
          title="Não foi possível acessar esta página"
          description={quadroErro || "Quadro não encontrado."}
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
      title="Consultar CNPJ"
      subtitle="Dados públicos de empresas brasileiras"
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Quadros", href: "/quadros" },
        { label: quadro.nome, href: `/quadros/${quadroId}` },
        { label: "Configurações", href: `/quadros/${quadroId}/configuracoes` },
        { label: "Consultar CNPJ" },
      ]}
      user={{ name: usuario?.nomeExibicao || usuario?.nome || "Usuário" }}
    >
      <div className="consultas-page">
        <div className="consultas-page__back">
          <Button
            type="button"
            variant="secondary"
            leftIcon={<ArrowLeft size={16} aria-hidden="true" />}
            onClick={voltarConfig}
          >
            Voltar para Gerenciar quadro
          </Button>
        </div>

        <PageHeader
          title="Consultar CNPJ"
          description="Informe um CNPJ para buscar dados públicos da empresa."
        />

        <p className="consultas-page__intro text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
          Esta consulta usa serviços externos para buscar dados cadastrais públicos
          de empresas brasileiras. Os dados não são salvos automaticamente no sistema.
        </p>

        <section
          className="consultas-page__card"
          aria-busy={consultando ? "true" : "false"}
        >
          <h2 className="consultas-page__card-title">Busca</h2>
          <form onSubmit={handleSubmit} noValidate>
            <label className="consultas-page__field-label" htmlFor={fieldId}>
              CNPJ
            </label>
            <input
              id={fieldId}
              name="cnpj"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="00.000.000/0000-00"
              className="consultas-page__input"
              value={cnpjInput}
              onChange={handleCnpjChange}
              disabled={consultando}
              aria-invalid={Boolean(erroCampo)}
              aria-describedby={inputDescribedBy}
            />
            <p id={hintId} className="consultas-page__hint">
              Você pode digitar com ou sem pontuação. Apenas números são enviados à
              consulta.
            </p>
            {erroCampo ? (
              <p id={errorId} className="consultas-page__alert mt-3" role="alert">
                {erroCampo}
              </p>
            ) : null}

            <div className="consultas-page__actions">
              <Button
                type="submit"
                variant="primary"
                disabled={consultando}
                loading={consultando}
              >
                {consultando ? "Consultando…" : "Consultar CNPJ"}
              </Button>
            </div>
          </form>
        </section>

        {erroConsulta ? (
          <p className="consultas-page__alert mb-5" role="alert">
            {erroConsulta}
          </p>
        ) : null}

        {resultado?.success && resultado.data ? (
          <section
            className="consultas-page__card"
            aria-labelledby="consulta-cnpj-resultado-titulo"
          >
            <h2
              id="consulta-cnpj-resultado-titulo"
              className="consultas-page__card-title"
            >
              Resultado
            </h2>
            <p className="consultas-page__hint mb-4">
              Fonte da consulta: <strong>{resultado.fonte}</strong>
            </p>

            <dl className="consultas-page__grid">
              <div className="consultas-page__datum">
                <dt>Razão social</dt>
                <dd>{resultado.data.razaoSocial || "—"}</dd>
              </div>
              <div className="consultas-page__datum">
                <dt>Nome fantasia</dt>
                <dd>{resultado.data.nomeFantasia || "—"}</dd>
              </div>
              <div className="consultas-page__datum">
                <dt>CNPJ</dt>
                <dd>{resultado.data.cnpjFormatado || formatarCnpj(resultado.data.cnpj)}</dd>
              </div>
              <div className="consultas-page__datum">
                <dt>Situação cadastral</dt>
                <dd>{resultado.data.situacao || "—"}</dd>
              </div>
              <div className="consultas-page__datum">
                <dt>Data de abertura</dt>
                <dd>{resultado.data.dataAbertura || "—"}</dd>
              </div>
              <div className="consultas-page__datum">
                <dt>Natureza jurídica</dt>
                <dd>{resultado.data.naturezaJuridica || "—"}</dd>
              </div>
              <div className="consultas-page__datum">
                <dt>Porte</dt>
                <dd>{resultado.data.porte || "—"}</dd>
              </div>
              <div className="consultas-page__datum">
                <dt>Atividade principal (CNAE)</dt>
                <dd>{resultado.data.cnaePrincipal || "—"}</dd>
              </div>
              <div className="consultas-page__datum">
                <dt>Telefone</dt>
                <dd>{resultado.data.telefone || "—"}</dd>
              </div>
              <div className="consultas-page__datum">
                <dt>E-mail</dt>
                <dd>{resultado.data.email || "—"}</dd>
              </div>
            </dl>

            {resultado.data.endereco ? (
              <div className="mt-4">
                <h3 className="consultas-page__field-label">Endereço</h3>
                <dl className="consultas-page__grid">
                  <div className="consultas-page__datum">
                    <dt>Logradouro</dt>
                    <dd>
                      {[
                        resultado.data.endereco.logradouro,
                        resultado.data.endereco.numero,
                        resultado.data.endereco.complemento,
                      ]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </dd>
                  </div>
                  <div className="consultas-page__datum">
                    <dt>Bairro</dt>
                    <dd>{resultado.data.endereco.bairro || "—"}</dd>
                  </div>
                  <div className="consultas-page__datum">
                    <dt>Município</dt>
                    <dd>{resultado.data.endereco.municipio || "—"}</dd>
                  </div>
                  <div className="consultas-page__datum">
                    <dt>UF</dt>
                    <dd>{resultado.data.endereco.uf || "—"}</dd>
                  </div>
                  <div className="consultas-page__datum">
                    <dt>CEP</dt>
                    <dd>{resultado.data.endereco.cep || "—"}</dd>
                  </div>
                </dl>
              </div>
            ) : null}

            {Array.isArray(resultado.data.atividadesSecundarias) &&
            resultado.data.atividadesSecundarias.length ? (
              <div className="mt-4">
                <h3 className="consultas-page__field-label">Atividades secundárias</h3>
                <ul className="consultas-page__list">
                  {resultado.data.atividadesSecundarias.map((item, idx) => (
                    <li key={`${idx}-${String(item).slice(0, 24)}`}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="consultas-page__actions">
              <Button
                type="button"
                variant="secondary"
                leftIcon={<Copy size={16} aria-hidden="true" />}
                onClick={handleCopiar}
                disabled={consultando}
              >
                {copiado ? "Copiado" : "Copiar dados"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                leftIcon={<RefreshCw size={16} aria-hidden="true" />}
                onClick={handleNovaConsulta}
                disabled={consultando}
              >
                Nova consulta
              </Button>
            </div>
          </section>
        ) : null}
      </div>
    </AppLayout>
  );
}
