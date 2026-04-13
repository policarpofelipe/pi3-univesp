import { useEffect, useState } from "react";
import Button from "../ui/Button";
import FiltroBuilder from "./FiltroBuilder";

const INITIAL = {
  nome: "",
  ativa: true,
  filtroJson: null,
};

export default function VisaoForm({
  modo = "criar",
  initialValues = {},
  loading = false,
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [filtroValido, setFiltroValido] = useState(true);

  useEffect(() => {
    setValues({
      nome: initialValues.nome || "",
      ativa: initialValues.ativa !== undefined ? Boolean(initialValues.ativa) : true,
      filtroJson: initialValues.filtroJson || null,
    });
    setErrors({});
    setSubmitError("");
    setFiltroValido(true);
  }, [initialValues]);

  function validate(nextValues) {
    const nextErrors = {};
    if (!String(nextValues.nome || "").trim()) {
      nextErrors.nome = "O nome da visão é obrigatório.";
    }
    if (!filtroValido) {
      nextErrors.filtroJson = "Corrija o JSON do filtro para continuar.";
    }
    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await onSubmit?.({
        nome: values.nome.trim(),
        ativa: Boolean(values.ativa),
        filtroJson: values.filtroJson,
      });
    } catch (error) {
      setSubmitError(
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível salvar a visão."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label
          htmlFor="visao-nome"
          className="mb-1 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
        >
          Nome da visão
        </label>
        <input
          id="visao-nome"
          type="text"
          value={values.nome}
          disabled={loading}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, nome: event.target.value }))
          }
          className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
          placeholder="Ex.: Prioridade alta"
          aria-invalid={Boolean(errors.nome)}
        />
        {errors.nome ? (
          <p className="mt-1 text-[var(--font-size-xs)] text-[var(--color-danger-text)]">
            {errors.nome}
          </p>
        ) : null}
      </div>

      <label className="flex items-center gap-2 text-[var(--font-size-sm)] text-[var(--color-text)]">
        <input
          type="checkbox"
          checked={values.ativa}
          disabled={loading}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, ativa: event.target.checked }))
          }
        />
        Visão ativa
      </label>

      <FiltroBuilder
        initialValue={values.filtroJson}
        disabled={loading}
        onChange={(filtroJson, valido) => {
          setValues((prev) => ({ ...prev, filtroJson }));
          setFiltroValido(valido);
        }}
      />
      {errors.filtroJson ? (
        <p className="text-[var(--font-size-xs)] text-[var(--color-danger-text)]">
          {errors.filtroJson}
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

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          {modo === "criar" ? "Criar visão" : "Salvar visão"}
        </Button>
      </div>
    </form>
  );
}
