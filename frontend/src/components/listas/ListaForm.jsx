import React, { useEffect, useMemo, useState } from "react";
import Button from "../ui/Button";

const DEFAULT = {
  nome: "",
  descricao: "",
  limiteWip: "",
};

function normalize(v = {}) {
  return {
    nome: v.nome ?? "",
    descricao: v.descricao ?? "",
    limiteWip:
      v.limiteWip === null || v.limiteWip === undefined
        ? ""
        : String(v.limiteWip),
  };
}

function validate(values) {
  const errors = {};
  if (!values.nome.trim()) {
    errors.nome = "O nome da lista é obrigatório.";
  }
  if (values.limiteWip !== "") {
    const n = Number(values.limiteWip);
    if (!Number.isFinite(n) || n < 1) {
      errors.limiteWip = "Informe um limite WIP positivo ou deixe em branco.";
    }
  }
  return errors;
}

export default function ListaForm({
  modo = "criar",
  initialValues = DEFAULT,
  loading = false,
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel = "Cancelar",
}) {
  const base = useMemo(() => normalize(initialValues), [initialValues]);

  const [values, setValues] = useState(base);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    setValues(base);
    setErrors({});
    setSubmitError("");
  }, [base]);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    const v = validate(values);
    setErrors(v);
    if (Object.keys(v).length) return;

    const limiteWip =
      values.limiteWip === "" ? null : Number(values.limiteWip);

    try {
      if (typeof onSubmit === "function") {
        await onSubmit({
          nome: values.nome.trim(),
          descricao: values.descricao.trim(),
          limiteWip,
        });
      }
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message ||
          err?.message ||
          "Não foi possível salvar a lista."
      );
    }
  }

  const botao =
    submitLabel || (modo === "criar" ? "Criar lista" : "Salvar lista");

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <div>
        <label
          htmlFor="lista-form-nome"
          className="mb-1 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
        >
          Nome
        </label>
        <input
          id="lista-form-nome"
          name="nome"
          type="text"
          value={values.nome}
          onChange={handleChange}
          className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--input-text)]"
          placeholder="Ex.: Em revisão"
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
          htmlFor="lista-form-descricao"
          className="mb-1 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
        >
          Descrição (opcional)
        </label>
        <textarea
          id="lista-form-descricao"
          name="descricao"
          rows={3}
          value={values.descricao}
          onChange={handleChange}
          className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
          placeholder="Objetivo desta coluna no fluxo"
        />
      </div>

      <div>
        <label
          htmlFor="lista-form-wip"
          className="mb-1 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
        >
          Limite WIP (opcional)
        </label>
        <input
          id="lista-form-wip"
          name="limiteWip"
          type="number"
          min={1}
          value={values.limiteWip}
          onChange={handleChange}
          className="w-full max-w-[12rem] rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
          placeholder="Ex.: 5"
          aria-invalid={Boolean(errors.limiteWip)}
        />
        {errors.limiteWip ? (
          <p className="mt-1 text-[var(--font-size-xs)] text-[var(--color-danger-text)]">
            {errors.limiteWip}
          </p>
        ) : (
          <p className="mt-1 text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
            Deixe em branco para não limitar cartões nesta lista.
          </p>
        )}
      </div>

      {submitError ? (
        <p
          className="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-surface)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-danger-text)]"
          role="alert"
        >
          {submitError}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2">
        {typeof onCancel === "function" ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
        ) : null}
        <Button type="submit" variant="primary" loading={loading}>
          {botao}
        </Button>
      </div>
    </form>
  );
}
