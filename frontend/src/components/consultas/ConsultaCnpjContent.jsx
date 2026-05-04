import { useCallback, useId, useState } from "react";
import { useParams } from "react-router-dom";

import Button from "../ui/Button";
import { consultarCnpj } from "../../services/consultasService";
import cartaoService from "../../services/cartaoService";
import listaService from "../../services/listaService";
import { extractList } from "../../utils/apiData";
import {
  montarDescricaoCartaoCnpj,
  tituloCartaoCnpj,
} from "../../utils/consultaCartaoTexto";
import { emitQuadroListasCartoesTagsAtualizados } from "../../utils/quadroSyncEvents";
import {
  formatarCnpj,
  formatarCnpjDigitando,
  limparCnpj,
  validarCnpjBasico,
} from "../../utils/documentos";

import { Copy, RefreshCw, SquarePlus } from "lucide-react";

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

/** Formulário e resultado da consulta CNPJ (usado na página e no modal). */
export default function ConsultaCnpjContent({ onFecharAposCartaoCriado }) {
  const { quadroId } = useParams();
  const fieldId = useId();
  const errorId = useId();
  const hintId = `${fieldId}-hint`;
  const [erroCampo, setErroCampo] = useState("");
  const inputDescribedBy = [hintId, erroCampo ? errorId : null]
    .filter(Boolean)
    .join(" ");

  const [cnpjInput, setCnpjInput] = useState("");
  const [erroConsulta, setErroConsulta] = useState("");
  const [consultando, setConsultando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [criandoCartao, setCriandoCartao] = useState(false);
  const [erroCartao, setErroCartao] = useState("");
  const [msgCartao, setMsgCartao] = useState("");

  function handleCnpjChange(event) {
    setCnpjInput(formatarCnpjDigitando(event.target.value));
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
          data?.message || "Não foi possível consultar o CNPJ no momento."
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
      const titulo = tituloCartaoCnpj(resultado);
      const descricao = montarDescricaoCartaoCnpj(resultado);
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
    setCnpjInput("");
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
              <dd>
                {resultado.data.cnpjFormatado || formatarCnpj(resultado.data.cnpj)}
              </dd>
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
              disabled={consultando || criandoCartao}
            >
              {copiado ? "Copiado" : "Copiar dados"}
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
