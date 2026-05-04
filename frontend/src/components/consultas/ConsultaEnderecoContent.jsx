import { useCallback, useId, useState } from "react";
import { useParams } from "react-router-dom";

import Button from "../ui/Button";
import { consultarCep } from "../../services/consultasService";
import cartaoService from "../../services/cartaoService";
import listaService from "../../services/listaService";
import { extractList } from "../../utils/apiData";
import {
  montarDescricaoCartaoCep,
  tituloCartaoCep,
} from "../../utils/consultaCartaoTexto";
import { emitQuadroListasCartoesTagsAtualizados } from "../../utils/quadroSyncEvents";
import {
  formatarCep,
  formatarCepDigitando,
  limparCep,
  validarCepBasico,
} from "../../utils/documentos";

import { Copy, RefreshCw, SquarePlus } from "lucide-react";

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
export default function ConsultaEnderecoContent({ onFecharAposCartaoCriado }) {
  const { quadroId } = useParams();
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
  const [criandoCartao, setCriandoCartao] = useState(false);
  const [erroCartao, setErroCartao] = useState("");
  const [msgCartao, setMsgCartao] = useState("");

  function handleCepChange(event) {
    setCepInput(formatarCepDigitando(event.target.value));
    setErroCampo("");
    setErroConsulta("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErroCampo("");
    setErroConsulta("");
    setErroCartao("");
    setMsgCartao("");
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

  const handleCriarCartao = useCallback(async () => {
    if (!quadroId || !resultado?.success) return;
    setErroCartao("");
    setMsgCartao("");
    setCriandoCartao(true);
    try {
      const resListas = await listaService.listar(quadroId);
      const listas = extractList(resListas).sort(
        (a, b) => (a.posicao ?? 0) - (b.posicao ?? 0)
      );
      if (!listas.length) {
        setErroCartao(
          "Este quadro ainda não tem listas. Crie uma lista no quadro antes de adicionar o cartão."
        );
        return;
      }
      const primeiraLista = listas[0];
      const titulo = tituloCartaoCep(resultado);
      const descricao = montarDescricaoCartaoCep(resultado);
      await cartaoService.criar(quadroId, {
        listaId: primeiraLista.id,
        titulo,
        descricao,
      });
      setMsgCartao(
        `Cartão criado na lista “${primeiraLista.nome || "primeira lista"}”.`
      );
    } catch (err) {
      setErroCartao(
        err?.response?.data?.message ||
          err?.message ||
          "Não foi possível criar o cartão. Tente novamente."
      );
    } finally {
      setCriandoCartao(false);
    }
  }, [quadroId, resultado]);

  function handleConfirmarCartaoCriado() {
    if (quadroId) emitQuadroListasCartoesTagsAtualizados(quadroId);
    setMsgCartao("");
    onFecharAposCartaoCriado?.();
  }

  function handleNovaConsulta() {
    setCepInput("");
    setResultado(null);
    setErroCampo("");
    setErroConsulta("");
    setErroCartao("");
    setMsgCartao("");
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
              disabled={consultando || criandoCartao}
            >
              {copiado ? "Copiado" : "Copiar endereço"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              leftIcon={<SquarePlus size={16} aria-hidden="true" />}
              onClick={handleCriarCartao}
              disabled={consultando || criandoCartao}
              loading={criandoCartao}
            >
              Criar Cartão com esses dados
            </Button>
            <Button
              type="button"
              variant="ghost"
              leftIcon={<RefreshCw size={16} aria-hidden="true" />}
              onClick={handleNovaConsulta}
              disabled={consultando || criandoCartao}
            >
              Nova consulta
            </Button>
          </div>
          {erroCartao ? (
            <p className="consultas-page__alert mt-3" role="alert">
              {erroCartao}
            </p>
          ) : null}
          {msgCartao ? (
            <div
              className="consultas-page__sucesso-cartao mt-3"
              role="status"
              aria-live="polite"
            >
              <p className="consultas-page__sucesso-cartao-texto">{msgCartao}</p>
              <Button type="button" variant="primary" onClick={handleConfirmarCartaoCriado}>
                Ok
              </Button>
            </div>
          ) : null}
        </section>
      ) : null}
    </>
  );
}
