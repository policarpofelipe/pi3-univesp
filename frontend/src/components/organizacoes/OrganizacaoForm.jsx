import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Button from "../ui/Button";
import "../../styles/components/organizacao-form.css";

/*
Contrato sugerido:
- initialValues?: dados iniciais para edição
- loading?: estado de submissão externa
- onSubmit(payload): função async/sync chamada ao salvar
- onCancel?(): ação opcional de cancelamento
- submitLabel?: texto do botão principal
- cancelLabel?: texto do botão secundário
- autoFocusNome?: foca o campo nome ao montar (padrão: true)

Payload gerado:
{
  nome,
  slug,
  descricao,
  ativo
}
*/

const DEFAULT_VALUES = {
  nome: "",
  slug: "",
  descricao: "",
  ativo: true,
};

function normalizeValues(values = {}) {
  return {
    nome: values.nome ?? "",
    slug: values.slug ?? "",
    descricao: values.descricao ?? "",
    ativo: values.ativo ?? true,
  };
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function validate(values) {
  const errors = {};

  if (!values.nome.trim()) {
    errors.nome = "O nome da organização é obrigatório.";
  } else if (values.nome.trim().length < 2) {
    errors.nome = "O nome deve ter pelo menos 2 caracteres.";
  }

  if (values.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) {
    errors.slug =
      "O slug deve conter apenas letras minúsculas, números e hífens, sem espaços.";
  }

  if (values.descricao && values.descricao.length > 500) {
    errors.descricao = "A descrição deve ter no máximo 500 caracteres.";
  }

  return errors;
}

export default function OrganizacaoForm({
  initialValues = DEFAULT_VALUES,
  loading = false,
  onSubmit,
  onCancel,
  submitLabel = "Salvar organização",
  cancelLabel = "Cancelar",
  autoFocusNome = true,
}) {
  const nomeInputRef = useRef(null);
  const normalizedInitialValues = useMemo(
    () => normalizeValues(initialValues),
    [initialValues]
  );

  const [values, setValues] = useState(normalizedInitialValues);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [touched, setTouched] = useState({});
  const [autoSlug, setAutoSlug] = useState(!normalizedInitialValues.slug);

  useEffect(() => {
    setValues(normalizedInitialValues);
    setErrors({});
    setTouched({});
    setSubmitError("");
    setAutoSlug(!normalizedInitialValues.slug);
  }, [normalizedInitialValues]);

  useLayoutEffect(() => {
    if (!autoFocusNome) return;
    const id = window.requestAnimationFrame(() => {
      nomeInputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [normalizedInitialValues, autoFocusNome]);

  function updateField(name, value) {
    setValues((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "nome" && autoSlug) {
        next.slug = slugify(value);
      }

      return next;
    });
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    updateField(name, type === "checkbox" ? checked : value);
  }

  function handleSlugChange(event) {
    const nextSlug = slugify(event.target.value);
    setAutoSlug(false);
    updateField("slug", nextSlug);
  }

  function handleBlur(event) {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const nextValues = { ...values };
    const nextErrors = validate(nextValues);
    setErrors(nextErrors);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const preparedValues = {
      ...values,
      nome: values.nome.trim(),
      slug: values.slug ? slugify(values.slug) : slugify(values.nome),
      descricao: values.descricao.trim(),
    };

    const nextErrors = validate(preparedValues);
    setErrors(nextErrors);
    setTouched({
      nome: true,
      slug: true,
      descricao: true,
      ativo: true,
    });
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (typeof onSubmit !== "function") {
      return;
    }

    try {
      await onSubmit(preparedValues);
    } catch (error) {
      setSubmitError(
        error?.message || "Não foi possível salvar a organização."
      );
    }
  }

  const descricaoLength = values.descricao.length;

  return (
    <form className="organizacao-form" onSubmit={handleSubmit} noValidate>
      <div className="organizacao-form__panel">
        <div className="organizacao-form__grid">
          <div className="organizacao-form__field organizacao-form__field--full">
            <label
              htmlFor="organizacao-nome"
              className="organizacao-form__label"
            >
              Nome da organização
            </label>
            <input
              ref={nomeInputRef}
              id="organizacao-nome"
              name="nome"
              type="text"
              value={values.nome}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Ex.: Equipe do projeto integrador"
              aria-invalid={Boolean(touched.nome && errors.nome)}
              aria-describedby={
                touched.nome && errors.nome ? "organizacao-nome-erro" : undefined
              }
            />
            {touched.nome && errors.nome ? (
              <p
                id="organizacao-nome-erro"
                className="mt-2 text-[var(--font-size-sm)] text-[var(--color-danger-text)]"
                role="alert"
              >
                {errors.nome}
              </p>
            ) : null}
          </div>

          <div className="organizacao-form__field organizacao-form__field--full">
            <label
              htmlFor="organizacao-slug"
              className="organizacao-form__label"
            >
              Slug
            </label>
            <input
              id="organizacao-slug"
              name="slug"
              type="text"
              value={values.slug}
              onChange={handleSlugChange}
              onBlur={handleBlur}
              placeholder="equipe-projeto-integrador"
              aria-invalid={Boolean(touched.slug && errors.slug)}
              aria-describedby={
                touched.slug && errors.slug
                  ? "organizacao-slug-erro"
                  : "organizacao-slug-ajuda"
              }
            />
            {touched.slug && errors.slug ? (
              <p
                id="organizacao-slug-erro"
                className="mt-2 text-[var(--font-size-sm)] text-[var(--color-danger-text)]"
                role="alert"
              >
                {errors.slug}
              </p>
            ) : (
              <p
                id="organizacao-slug-ajuda"
                className="mt-2 text-[var(--font-size-xs)] text-[var(--color-text-soft)]"
              >
                Usado em URLs e identificadores. Letras minúsculas, números e
                hífens.
              </p>
            )}
          </div>

          <div className="organizacao-form__field organizacao-form__field--full">
            <label
              htmlFor="organizacao-descricao"
              className="organizacao-form__label"
            >
              Descrição
            </label>
            <textarea
              id="organizacao-descricao"
              name="descricao"
              rows={5}
              value={values.descricao}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Descreva a finalidade da organização, área responsável ou contexto de uso."
              aria-invalid={Boolean(touched.descricao && errors.descricao)}
              aria-describedby={
                touched.descricao && errors.descricao
                  ? "organizacao-descricao-erro"
                  : "organizacao-descricao-ajuda"
              }
            />
            <div className="organizacao-form__desc-footer">
              {touched.descricao && errors.descricao ? (
                <p
                  id="organizacao-descricao-erro"
                  className="organizacao-form__desc-hint organizacao-form__desc-hint--error"
                  role="alert"
                >
                  {errors.descricao}
                </p>
              ) : (
                <p
                  id="organizacao-descricao-ajuda"
                  className="organizacao-form__desc-hint"
                >
                  Campo opcional. Máximo de 500 caracteres.
                </p>
              )}
              <span
                className="organizacao-form__desc-count"
                aria-live="polite"
              >
                {descricaoLength}/500
              </span>
            </div>
          </div>

          <fieldset className="organizacao-form__status-fieldset organizacao-form__field--full">
            <legend className="organizacao-form__status-legend">
              Disponibilidade no sistema
            </legend>
            <label
              htmlFor="organizacao-ativa"
              className="organizacao-form__status-card"
            >
              <input
                id="organizacao-ativa"
                name="ativo"
                type="checkbox"
                checked={values.ativo}
                onChange={handleChange}
                onBlur={handleBlur}
                className="organizacao-form__checkbox"
              />
              <span className="min-w-0">
                <span className="organizacao-form__status-title">
                  Organização ativa
                </span>
                <span className="organizacao-form__status-help">
                  Quando desmarcada, a organização fica indisponível para uso
                  normal no sistema.
                </span>
              </span>
            </label>
          </fieldset>
        </div>
      </div>

      {submitError ? (
        <div className="organizacao-form__alert" role="alert">
          {submitError}
        </div>
      ) : null}

      <div className="organizacao-form__actions">
        <Button type="submit" variant="primary" loading={loading}>
          {submitLabel}
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
