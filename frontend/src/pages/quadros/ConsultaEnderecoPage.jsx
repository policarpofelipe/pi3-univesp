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
import { consultarCep } from "../../services/consultasService";
import { extractObject } from "../../utils/apiData";
import {
  formatarCep,
  formatarCepDigitando,
  limparCep,
  validarCepBasico,
} from "../../utils/documentos";

import "../../styles/pages/consultas.css";

function montarTextoCopiaEndereco(payload) {
  if (!payload?.success || !payload.data) return "";
  const d = payload.data;
  return [
    `CEP: ${d.cepFormatado || formatarCep(d.cep)}`,
    `Logradouro: ${d.logradouro || "—"}`,
    `Complemento: ${d.complemento || "—"}`,
    `Bairro: ${d.bairro || "—"}`,
    `Cidade: ${d.cidade || "—"}`,
    `UF: ${d.uf || "—"}`,
    `IBGE: ${d.ibge || "—"}`,
    `DDD: ${d.ddd || "—"}`,
    `Fonte: ${payload.fonte || "—"}`,
  ].join("\n");
}

export default function ConsultaEnderecoPage() {
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

  const [cepInput, setCepInput] = useState("");
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

  function handleCepChange(event) {
    setCepInput(formatarCepDigitando(event.target.value));
    setErroCampo("");
    setErroConsulta("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErroCampo("");
    setErroConsulta("");
    setResultado(null);
    setCopiado(false);

    const digits = limparCep(cepInput);
    if (!validarCepBasico(digits)) {
      setErroCampo("Informe um CEP com 8 dígitos.");
      return;
    }

    setConsultando(true);
    try {
      const data = await consultarCep(digits);
      if (data?.success) {
        setResultado(data);
      } else {
        setErroConsulta(
          data?.message ||
            "Não foi possível consultar o CEP informado."
        );
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "O serviço de consulta de endereço está indisponível no momento. Tente novamente mais tarde.";
      if (err?.response?.status === 404) {
        setErroConsulta("Não encontramos endereço para este CEP.");
      } else {
        setErroConsulta(msg);
      }
    } finally {
      setConsultando(false);
    }
  }

  async function handleCopiar() {
    const texto = montarTextoCopiaEndereco(resultado);
    if (!texto) return;
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setErroConsulta("Não foi possível copiar. Tente selecionar o texto manualmente.");
    }
  }

  function handleNovaConsulta() {
    setCepInput("");
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
        title="Consultar endereço"
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
        title="Consultar endereço"
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
      title="Consultar endereço"
      subtitle="Endereço por CEP"
      breadcrumbItems={[
        { label: "Início", href: "/home" },
        { label: "Quadros", href: "/quadros" },
        { label: quadro.nome, href: `/quadros/${quadroId}` },
        { label: "Configurações", href: `/quadros/${quadroId}/configuracoes` },
        { label: "Consultar endereço" },
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
          title="Consultar endereço"
          description="Informe um CEP para buscar dados de endereço."
        />

        <p className="consultas-page__intro text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
          Esta consulta usa serviço externo gratuito para buscar endereço pelo CEP. Os
          dados não são salvos automaticamente no sistema.
        </p>

        <section
          className="consultas-page__card"
          aria-busy={consultando ? "true" : "false"}
        >
          <h2 className="consultas-page__card-title">Busca</h2>
          <form onSubmit={handleSubmit} noValidate>
            <label className="consultas-page__field-label" htmlFor={fieldId}>
              CEP
            </label>
            <input
              id={fieldId}
              name="cep"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="00000-000"
              className="consultas-page__input"
              value={cepInput}
              onChange={handleCepChange}
              disabled={consultando}
              aria-invalid={Boolean(erroCampo)}
              aria-describedby={inputDescribedBy}
            />
            <p id={hintId} className="consultas-page__hint">
              Aceita com ou sem hífen. Apenas números são enviados à consulta.
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
                {consultando ? "Consultando…" : "Consultar CEP"}
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
            aria-labelledby="consulta-cep-resultado-titulo"
          >
            <h2
              id="consulta-cep-resultado-titulo"
              className="consultas-page__card-title"
            >
              Resultado
            </h2>
            <p className="consultas-page__hint mb-4">
              Fonte da consulta: <strong>{resultado.fonte}</strong>
            </p>

            <dl className="consultas-page__grid">
              <div className="consultas-page__datum">
                <dt>CEP</dt>
                <dd>{resultado.data.cepFormatado || formatarCep(resultado.data.cep)}</dd>
              </div>
              <div className="consultas-page__datum">
                <dt>Logradouro</dt>
                <dd>{resultado.data.logradouro || "—"}</dd>
              </div>
              <div className="consultas-page__datum">
                <dt>Complemento</dt>
                <dd>{resultado.data.complemento || "—"}</dd>
              </div>
              <div className="consultas-page__datum">
                <dt>Bairro</dt>
                <dd>{resultado.data.bairro || "—"}</dd>
              </div>
              <div className="consultas-page__datum">
                <dt>Cidade</dt>
                <dd>{resultado.data.cidade || "—"}</dd>
              </div>
              <div className="consultas-page__datum">
                <dt>UF</dt>
                <dd>{resultado.data.uf || "—"}</dd>
              </div>
              <div className="consultas-page__datum">
                <dt>Código IBGE</dt>
                <dd>{resultado.data.ibge || "—"}</dd>
              </div>
              <div className="consultas-page__datum">
                <dt>DDD</dt>
                <dd>{resultado.data.ddd || "—"}</dd>
              </div>
            </dl>

            <div className="consultas-page__actions">
              <Button
                type="button"
                variant="secondary"
                leftIcon={<Copy size={16} aria-hidden="true" />}
                onClick={handleCopiar}
                disabled={consultando}
              >
                {copiado ? "Copiado" : "Copiar endereço"}
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
