import React, { useEffect, useMemo, useState } from "react";
import Button from "../ui/Button";

const DEFAULT = {
  titulo: "",
  descricao: "",
  listaId: "",
};

function normalize(v = {}) {
  return {
    titulo: v.titulo ?? "",
    descricao: v.descricao ?? "",
    listaId: v.listaId != null ? String(v.listaId) : "",
  };
}

function validate(values, exigeLista) {
  const errors = {};
  if (!values.titulo.trim()) {
    errors.titulo = "O título é obrigatório.";
  }
  if (exigeLista && !String(values.listaId).trim()) {
    errors.listaId = "Escolha uma lista.";
  }
  return errors;
}

export default function CartaoForm({
  modo = "criar",
  initialValues = DEFAULT,
  listas = [],
  listaIdFixo = "",
  loading = false,
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel = "Cancelar",
}) {
  const base = useMemo(() => {
    const n = normalize(initialValues);
    if (listaIdFixo) {
      n.listaId = String(listaIdFixo);
    }
    return n;
  }, [initialValues, listaIdFixo]);

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

    const exigeLista = modo === "criar" && !listaIdFixo;
    const v = validate(values, exigeLista);
    setErrors(v);
    if (Object.keys(v).length) return;

    try {
      if (typeof onSubmit === "function") {
        await onSubmit({
          titulo: values.titulo.trim(),
          descricao: values.descricao.trim(),
          listaId: values.listaId || listaIdFixo || undefined,
        });
      }
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message ||
          err?.message ||
          "Não foi possível salvar o cartão."
      );
    }
  }

  const botao =
    submitLabel || (modo === "criar" ? "Criar cartão" : "Salvar cartão");

  const mostrarSelectLista =
    modo === "criar" && !listaIdFixo && listas.length > 0;

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      {mostrarSelectLista ? (
        <div>
          <label
            htmlFor="cartao-form-lista"
            className="mb-1 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
          >
            Lista
          </label>
          <select
            id="cartao-form-lista"
            name="listaId"
            value={values.listaId}
            onChange={handleChange}
            className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
            aria-invalid={Boolean(errors.listaId)}
          >
            <option value="">Selecione…</option>
            {listas.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nome}
              </option>
            ))}
          </select>
          {errors.listaId ? (
            <p className="mt-1 text-[var(--font-size-xs)] text-[var(--color-danger-text)]">
              {errors.listaId}
            </p>
          ) : null}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="cartao-form-titulo"
          className="mb-1 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
        >
          Título
        </label>
        <input
          id="cartao-form-titulo"
          name="titulo"
          type="text"
          value={values.titulo}
          onChange={handleChange}
          className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
          placeholder="Resumo do cartão"
          aria-invalid={Boolean(errors.titulo)}
        />
        {errors.titulo ? (
          <p className="mt-1 text-[var(--font-size-xs)] text-[var(--color-danger-text)]">
            {errors.titulo}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="cartao-form-descricao"
          className="mb-1 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
        >
          Descrição (opcional)
        </label>
        <textarea
          id="cartao-form-descricao"
          name="descricao"
          rows={4}
          value={values.descricao}
          onChange={handleChange}
          className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
        />
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
