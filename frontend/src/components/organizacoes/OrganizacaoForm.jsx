import React, { useEffect, useMemo, useState } from "react";
import Button from "../ui/Button";

/*
Contrato sugerido:
- initialValues?: dados iniciais para edição
- loading?: estado de submissão externa
- onSubmit(payload): função async/sync chamada ao salvar
- onCancel?(): ação opcional de cancelamento
- submitLabel?: texto do botão principal
- cancelLabel?: texto do botão secundário

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
}) {
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
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
      noValidate
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label
            htmlFor="organizacao-nome"
            className="mb-2 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
          >
            Nome da organização
          </label>
          <input
            id="organizacao-nome"
            name="nome"
            type="text"
            value={values.nome}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Ex.: Reduz Telecom"
            aria-invalid={Boolean(touched.nome && errors.nome)}
            aria-describedby={touched.nome && errors.nome ? "organizacao-nome-erro" : undefined}
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

        <div>
          <label
            htmlFor="organizacao-slug"
            className="mb-2 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
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
            placeholder="reduz-telecom"
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
              Usado em URLs e identificadores. Letras minúsculas, números e hífens.
            </p>
          )}
        </div>

        <div className="flex items-end">
          <label className="flex items-start gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-3 w-full">
            <input
              id="organizacao-ativa"
              name="ativo"
              type="checkbox"
              checked={values.ativo}
              onChange={handleChange}
              onBlur={handleBlur}
              className="mt-1 h-4 w-4"
            />
            <span>
              <span className="block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]">
                Organização ativa
              </span>
              <span className="mt-1 block text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
                Define se a organização estará disponível para uso normal no sistema.
              </span>
            </span>
          </label>
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="organizacao-descricao"
            className="mb-2 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
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
          <div className="mt-2 flex items-center justify-between gap-3">
            {touched.descricao && errors.descricao ? (
              <p
                id="organizacao-descricao-erro"
                className="text-[var(--font-size-sm)] text-[var(--color-danger-text)]"
                role="alert"
              >
                {errors.descricao}
              </p>
            ) : (
              <p
                id="organizacao-descricao-ajuda"
                className="text-[var(--font-size-xs)] text-[var(--color-text-soft)]"
              >
                Campo opcional. Máximo de 500 caracteres.
              </p>
            )}

            <span
              className="text-[var(--font-size-xs)] text-[var(--color-text-soft)]"
              aria-live="polite"
            >
              {descricaoLength}/500
            </span>
          </div>
        </div>
      </div>

      {submitError ? (
        <div
          className="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-surface)] px-4 py-3 text-[var(--font-size-sm)] text-[var(--color-danger-text)]"
          role="alert"
        >
          {submitError}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="primary" loading={loading}>
          {submitLabel}
        </Button>

        {typeof onCancel === "function" ? (
          <Button
            type="button"
            variant="ghost"
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