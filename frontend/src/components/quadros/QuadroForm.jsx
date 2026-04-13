import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Button from "../ui/Button";
import { listarOrganizacoes } from "../../services/organizacaoService";
import { extractList } from "../../utils/apiData";
import "../../styles/components/quadro-form.css";

const DEFAULT_VALUES = {
  nome: "",
  descricao: "",
  visibilidade: "privado",
  arquivado: false,
};

function normalize(values = {}) {
  return {
    nome: values.nome ?? "",
    descricao: values.descricao ?? "",
    visibilidade: values.visibilidade ?? "privado",
    arquivado: Boolean(values.arquivado ?? values.arquivadoEm),
    organizacaoId:
      values.organizacaoId != null ? String(values.organizacaoId) : "",
  };
}

function validate(values, modo) {
  const errors = {};

  if (!values.nome.trim()) {
    errors.nome = "O nome do quadro é obrigatório.";
  } else if (values.nome.trim().length < 2) {
    errors.nome = "O nome deve ter pelo menos 2 caracteres.";
  }

  if (modo === "criar" && !String(values.organizacaoId || "").trim()) {
    errors.organizacaoId = "A organização é obrigatória para criar um quadro.";
  }

  if (values.descricao && values.descricao.length > 2000) {
    errors.descricao = "A descrição deve ter no máximo 2000 caracteres.";
  }

  return errors;
}

const DESCRICAO_MAX = 2000;

function organizacoesPermitemCriarQuadro(lista) {
  return lista.filter(
    (o) =>
      !o.meuStatusNaOrganizacao ||
      String(o.meuStatusNaOrganizacao) === "ativo"
  );
}

export default function QuadroForm({
  modo = "editar",
  initialValues = DEFAULT_VALUES,
  organizacaoId = "",
  organizacaoNome = "",
  loading = false,
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel = "Cancelar",
  showArquivado = true,
  formId = "",
  autoFocusNome = true,
}) {
  const nomeInputRef = useRef(null);
  const organizacaoContextoFixo = Boolean(
    String(organizacaoId ?? "").trim()
  );
  const precisaEscolherOrganizacao =
    modo === "criar" && !organizacaoContextoFixo;

  const mergedInitial = useMemo(
    () =>
      normalize({
        ...initialValues,
        organizacaoId: initialValues.organizacaoId || organizacaoId,
      }),
    [initialValues, organizacaoId]
  );

  const [values, setValues] = useState(mergedInitial);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [orgsRaw, setOrgsRaw] = useState([]);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [orgsError, setOrgsError] = useState("");

  const organizacoesCriacao = useMemo(
    () => organizacoesPermitemCriarQuadro(orgsRaw),
    [orgsRaw]
  );

  useEffect(() => {
    setValues(mergedInitial);
    setErrors({});
    setSubmitError("");
  }, [mergedInitial]);

  useEffect(() => {
    if (!precisaEscolherOrganizacao) {
      setOrgsRaw([]);
      setOrgsLoading(false);
      setOrgsError("");
      return undefined;
    }

    const ac = new AbortController();

    (async () => {
      setOrgsLoading(true);
      setOrgsError("");
      try {
        const res = await listarOrganizacoes({}, { signal: ac.signal });
        const lista = extractList(res);
        if (!ac.signal.aborted) {
          setOrgsRaw(lista);
        }
      } catch (err) {
        if (
          err?.code === "ERR_CANCELED" ||
          err?.name === "CanceledError" ||
          ac.signal.aborted
        ) {
          return;
        }
        if (!ac.signal.aborted) {
          setOrgsRaw([]);
          setOrgsError(
            err?.response?.data?.message ||
              err?.message ||
              "Não foi possível carregar as organizações."
          );
        }
      } finally {
        if (!ac.signal.aborted) {
          setOrgsLoading(false);
        }
      }
    })();

    return () => ac.abort();
  }, [precisaEscolherOrganizacao]);

  useEffect(() => {
    if (!precisaEscolherOrganizacao) return;
    if (organizacoesCriacao.length !== 1) return;
    setValues((prev) => {
      if (String(prev.organizacaoId || "").trim()) return prev;
      return {
        ...prev,
        organizacaoId: String(organizacoesCriacao[0].id),
      };
    });
  }, [organizacoesCriacao, precisaEscolherOrganizacao]);

  useLayoutEffect(() => {
    if (!autoFocusNome) return;
    if (precisaEscolherOrganizacao && !String(values.organizacaoId || "").trim()) {
      return;
    }
    const id = window.requestAnimationFrame(() => {
      nomeInputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [mergedInitial, autoFocusNome, precisaEscolherOrganizacao, values.organizacaoId]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    const next = {
      ...values,
      organizacaoId: String(
        values.organizacaoId ||
          (organizacaoContextoFixo ? organizacaoId : "") ||
          ""
      ).trim(),
    };

    const v = validate(next, modo);
    setErrors(v);

    if (Object.keys(v).length > 0) {
      return;
    }

    try {
      if (typeof onSubmit === "function") {
        await onSubmit({
          nome: next.nome.trim(),
          descricao: next.descricao.trim(),
          visibilidade: next.visibilidade,
          arquivado: next.arquivado,
          organizacaoId: next.organizacaoId || undefined,
        });
      }
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message ||
          err?.message ||
          "Não foi possível salvar o quadro."
      );
    }
  }

  const labelPrincipal =
    submitLabel ||
    (modo === "criar" ? "Criar quadro" : "Salvar alterações");

  const descricaoLength = values.descricao.length;

  const bloquearEnvioPorOrgs =
    precisaEscolherOrganizacao &&
    (orgsLoading ||
      Boolean(orgsError) ||
      organizacoesCriacao.length === 0);

  return (
    <form
      id={formId || undefined}
      className="quadro-form"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="quadro-form__panel">
        <div className="quadro-form__grid">
          {organizacaoContextoFixo && organizacaoNome ? (
            <p className="quadro-form__meta quadro-form__field--full">
              Organização:{" "}
              <strong>{organizacaoNome}</strong>
            </p>
          ) : null}

          {precisaEscolherOrganizacao ? (
            <div className="quadro-form__field quadro-form__field--full">
              <label
                htmlFor="quadro-form-organizacao"
                className="quadro-form__label"
              >
                Organização
              </label>
              {orgsLoading ? (
                <p className="quadro-form__meta" aria-live="polite">
                  Carregando organizações…
                </p>
              ) : null}
              {orgsError ? (
                <p
                  className="quadro-form__field-error"
                  role="alert"
                  aria-live="polite"
                >
                  {orgsError}
                </p>
              ) : null}
              {!orgsLoading && !orgsError && organizacoesCriacao.length === 0 ? (
                <p className="quadro-form__meta" role="status">
                  Nenhuma organização disponível em que você possa criar quadros
                  (é necessário ser membro ativo).
                </p>
              ) : null}
              {!orgsLoading && organizacoesCriacao.length > 0 ? (
                <select
                  id="quadro-form-organizacao"
                  name="organizacaoId"
                  value={values.organizacaoId}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.organizacaoId)}
                  aria-describedby={
                    errors.organizacaoId
                      ? "quadro-form-organizacao-erro"
                      : undefined
                  }
                >
                  <option value="">Selecione a organização</option>
                  {organizacoesCriacao.map((o) => (
                    <option key={o.id} value={String(o.id)}>
                      {o.nome || `Organização #${o.id}`}
                    </option>
                  ))}
                </select>
              ) : null}
              {errors.organizacaoId ? (
                <p
                  id="quadro-form-organizacao-erro"
                  className="quadro-form__field-error"
                  role="alert"
                >
                  {errors.organizacaoId}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="quadro-form__field quadro-form__field--full">
            <label htmlFor="quadro-form-nome" className="quadro-form__label">
              Nome do quadro
            </label>
            <input
              ref={nomeInputRef}
              id="quadro-form-nome"
              name="nome"
              type="text"
              autoComplete="off"
              value={values.nome}
              onChange={handleChange}
              placeholder="Ex.: Produto e backlog"
              aria-invalid={Boolean(errors.nome)}
              aria-describedby={errors.nome ? "quadro-form-nome-erro" : undefined}
            />
            {errors.nome ? (
              <p id="quadro-form-nome-erro" className="quadro-form__field-error" role="alert">
                {errors.nome}
              </p>
            ) : null}
          </div>

          <div className="quadro-form__field quadro-form__field--full">
            <label
              htmlFor="quadro-form-descricao"
              className="quadro-form__label"
            >
              Descrição
            </label>
            <textarea
              id="quadro-form-descricao"
              name="descricao"
              rows={5}
              value={values.descricao}
              onChange={handleChange}
              placeholder="Contexto e objetivo do quadro"
              aria-invalid={Boolean(errors.descricao)}
              aria-describedby={
                errors.descricao
                  ? "quadro-form-descricao-erro"
                  : "quadro-form-descricao-ajuda"
              }
            />
            <div className="quadro-form__desc-footer">
              {errors.descricao ? (
                <p
                  id="quadro-form-descricao-erro"
                  className="quadro-form__desc-hint quadro-form__desc-hint--error"
                  role="alert"
                >
                  {errors.descricao}
                </p>
              ) : (
                <p id="quadro-form-descricao-ajuda" className="quadro-form__desc-hint">
                  Campo opcional. Máximo de {DESCRICAO_MAX} caracteres.
                </p>
              )}
              <span className="quadro-form__desc-count" aria-live="polite">
                {descricaoLength}/{DESCRICAO_MAX}
              </span>
            </div>
          </div>

          <div className="quadro-form__field quadro-form__field--full">
            <label
              htmlFor="quadro-form-visibilidade"
              className="quadro-form__label"
            >
              Visibilidade
            </label>
            <select
              id="quadro-form-visibilidade"
              name="visibilidade"
              value={values.visibilidade}
              onChange={handleChange}
            >
              <option value="privado">Privado (membros da organização)</option>
              <option value="interno">Interno</option>
              <option value="publico">Público na organização</option>
            </select>
          </div>

          {showArquivado ? (
            <fieldset className="quadro-form__status-fieldset quadro-form__field--full">
              <legend className="quadro-form__status-legend">
                Estado do quadro
              </legend>
              <label htmlFor="quadro-form-arquivado" className="quadro-form__status-card">
                <input
                  id="quadro-form-arquivado"
                  name="arquivado"
                  type="checkbox"
                  checked={values.arquivado}
                  onChange={handleChange}
                  className="quadro-form__checkbox"
                />
                <span className="min-w-0">
                  <span className="quadro-form__status-title">Arquivar quadro</span>
                  <span className="quadro-form__status-help">
                    Quadros arquivados ficam fora do fluxo principal, mas preservam
                    dados.
                  </span>
                </span>
              </label>
            </fieldset>
          ) : null}
        </div>
      </div>

      {submitError ? (
        <div className="quadro-form__alert" role="alert">
          {submitError}
        </div>
      ) : null}

      <div className="quadro-form__actions">
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={bloquearEnvioPorOrgs}
        >
          {labelPrincipal}
        </Button>
        {typeof onCancel === "function" ? (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
