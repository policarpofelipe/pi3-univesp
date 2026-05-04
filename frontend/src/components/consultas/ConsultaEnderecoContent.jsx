import { useId, useState } from "react";

import Button from "../ui/Button";
import { consultarCep } from "../../services/consultasService";
import {
  formatarCep,
  formatarCepDigitando,
  limparCep,
  validarCepBasico,
} from "../../utils/documentos";

import { Copy, RefreshCw } from "lucide-react";

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

/** Formulário e resultado da consulta de CEP (página e modal). */
export default function ConsultaEnderecoContent() {
  const fieldId = useId();
  const errorId = useId();
  const hintId = `${fieldId}-hint`;
  const [erroCampo, setErroCampo] = useState("");
  const inputDescribedBy = [hintId, erroCampo ? errorId : null]
    .filter(Boolean)
    .join(" ");

  const [cepInput, setCepInput] = useState("");
  const [erroConsulta, setErroConsulta] = useState("");
  const [consultando, setConsultando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [copiado, setCopiado] = useState(false);

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
          data?.message || "Não foi possível consultar o CEP informado."
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
      setErroConsulta(
        "Não foi possível copiar. Tente selecionar o texto manualmente."
      );
    }
  }

  function handleNovaConsulta() {
    setCepInput("");
    setResultado(null);
    setErroCampo("");
    setErroConsulta("");
    setCopiado(false);
  }

  return (
    <>
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
              <dd>
                {resultado.data.cepFormatado || formatarCep(resultado.data.cep)}
              </dd>
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
    </>
  );
}
