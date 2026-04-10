import React, { useEffect, useMemo, useState } from "react";
import Button from "../ui/Button";

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
    organizacaoId: values.organizacaoId != null ? String(values.organizacaoId) : "",
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
}) {
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
      organizacaoId: String(values.organizacaoId || organizacaoId || "").trim(),
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

  return (
    <form
      id={formId || undefined}
      className="flex flex-col gap-4"
      onSubmit={handleSubmit}
      noValidate
    >
      {organizacaoNome ? (
        <p className="text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
          Organização:{" "}
          <strong className="text-[var(--color-text)]">{organizacaoNome}</strong>
        </p>
      ) : null}

      <div>
        <label
          htmlFor="quadro-form-nome"
          className="mb-1 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
        >
          Nome do quadro
        </label>
        <input
          id="quadro-form-nome"
          name="nome"
          type="text"
          autoComplete="off"
          value={values.nome}
          onChange={handleChange}
          className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--input-text)] focus:border-[var(--input-border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
          placeholder="Ex.: Produto e backlog"
          aria-invalid={Boolean(errors.nome)}
        />
        {errors.nome ? (
          <p className="mt-1 text-[var(--font-size-xs)] text-[var(--color-danger-text)]">
            {errors.nome}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="quadro-form-descricao"
          className="mb-1 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
        >
          Descrição
        </label>
        <textarea
          id="quadro-form-descricao"
          name="descricao"
          rows={4}
          value={values.descricao}
          onChange={handleChange}
          className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--input-text)] focus:border-[var(--input-border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
          placeholder="Contexto e objetivo do quadro"
          aria-invalid={Boolean(errors.descricao)}
        />
        {errors.descricao ? (
          <p className="mt-1 text-[var(--font-size-xs)] text-[var(--color-danger-text)]">
            {errors.descricao}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="quadro-form-visibilidade"
          className="mb-1 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
        >
          Visibilidade
        </label>
        <select
          id="quadro-form-visibilidade"
          name="visibilidade"
          value={values.visibilidade}
          onChange={handleChange}
          className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--input-text)]"
        >
          <option value="privado">Privado (membros da organização)</option>
          <option value="interno">Interno</option>
          <option value="publico">Público na organização</option>
        </select>
      </div>

      {showArquivado ? (
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3">
          <input
            name="arquivado"
            type="checkbox"
            checked={values.arquivado}
            onChange={handleChange}
            className="mt-1 h-4 w-4 rounded border-[var(--color-border)]"
          />
          <span>
            <span className="block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]">
              Arquivar quadro
            </span>
            <span className="mt-0.5 block text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
              Quadros arquivados ficam fora do fluxo principal, mas preservam
              dados.
            </span>
          </span>
        </label>
      ) : null}

      {errors.organizacaoId ? (
        <p className="text-[var(--font-size-sm)] text-[var(--color-danger-text)]">
          {errors.organizacaoId}
        </p>
      ) : null}

      {submitError ? (
        <p
          className="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-surface)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-danger-text)]"
          role="alert"
        >
          {submitError}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2 pt-2">
        {typeof onCancel === "function" ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
        ) : null}
        <Button type="submit" variant="primary" loading={loading}>
          {labelPrincipal}
        </Button>
      </div>
    </form>
  );
}
