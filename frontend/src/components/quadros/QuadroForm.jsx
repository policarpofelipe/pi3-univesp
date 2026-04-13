import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Button from "../ui/Button";
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

  useEffect(() => {
    setValues(mergedInitial);
    setErrors({});
    setSubmitError("");
  }, [mergedInitial]);

  useLayoutEffect(() => {
    if (!autoFocusNome) return;
    const id = window.requestAnimationFrame(() => {
      nomeInputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [mergedInitial, autoFocusNome]);

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
        values.organizacaoId || organizacaoId || ""
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

  return (
    <form
      id={formId || undefined}
      className="quadro-form"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="quadro-form__panel">
        <div className="quadro-form__grid">
          {organizacaoNome ? (
            <p className="quadro-form__meta quadro-form__field--full">
              Organização:{" "}
              <strong>{organizacaoNome}</strong>
            </p>
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

          {errors.organizacaoId ? (
            <p
              className="quadro-form__field-error quadro-form__field--full"
              role="alert"
            >
              {errors.organizacaoId}
            </p>
          ) : null}
        </div>
      </div>

      {submitError ? (
        <div className="quadro-form__alert" role="alert">
          {submitError}
        </div>
      ) : null}

      <div className="quadro-form__actions">
        <Button type="submit" variant="primary" loading={loading}>
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
