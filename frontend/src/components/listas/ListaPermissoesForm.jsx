import { useMemo, useState } from "react";
import Button from "../ui/Button";

const DEFAULT_VALUES = {
  papelId: "",
  podeVer: true,
  podeEditar: false,
  podeEnviarPara: false,
};

export default function ListaPermissoesForm({
  papeis = [],
  loading = false,
  onSubmit,
}) {
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const papeisDisponiveis = useMemo(() => {
    return papeis.filter((papel) => papel?.id);
  }, [papeis]);

  function updateField(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function validate(nextValues) {
    const nextErrors = {};
    if (!nextValues.papelId) {
      nextErrors.papelId = "Selecione um papel.";
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
        papelId: Number(values.papelId),
        podeVer: Boolean(values.podeVer),
        podeEditar: Boolean(values.podeEditar),
        podeEnviarPara: Boolean(values.podeEnviarPara),
      });
      setValues(DEFAULT_VALUES);
      setErrors({});
    } catch (error) {
      setSubmitError(
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível salvar a permissão."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label
          htmlFor="permissao-papel"
          className="mb-1 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
        >
          Papel
        </label>
        <select
          id="permissao-papel"
          value={values.papelId}
          onChange={(event) => updateField("papelId", event.target.value)}
          className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
          aria-invalid={Boolean(errors.papelId)}
        >
          <option value="">Selecione um papel</option>
          {papeisDisponiveis.map((papel) => (
            <option key={papel.id} value={papel.id}>
              {papel.nome}
            </option>
          ))}
        </select>
        {errors.papelId ? (
          <p className="mt-1 text-[var(--font-size-xs)] text-[var(--color-danger-text)]">
            {errors.papelId}
          </p>
        ) : null}
      </div>

      <fieldset className="space-y-2 rounded-lg border border-[var(--color-border)] p-3">
        <legend className="px-1 text-[var(--font-size-sm)] font-semibold text-[var(--color-text)]">
          Permissões desta lista
        </legend>
        <label className="flex items-center gap-2 text-[var(--font-size-sm)] text-[var(--color-text)]">
          <input
            type="checkbox"
            checked={values.podeVer}
            onChange={(event) => updateField("podeVer", event.target.checked)}
          />
          Pode ver
        </label>
        <label className="flex items-center gap-2 text-[var(--font-size-sm)] text-[var(--color-text)]">
          <input
            type="checkbox"
            checked={values.podeEditar}
            onChange={(event) =>
              updateField("podeEditar", event.target.checked)
            }
          />
          Pode editar
        </label>
        <label className="flex items-center gap-2 text-[var(--font-size-sm)] text-[var(--color-text)]">
          <input
            type="checkbox"
            checked={values.podeEnviarPara}
            onChange={(event) =>
              updateField("podeEnviarPara", event.target.checked)
            }
          />
          Pode enviar para esta lista
        </label>
      </fieldset>

      {submitError ? (
        <p
          className="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-surface)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-danger-text)]"
          role="alert"
        >
          {submitError}
        </p>
      ) : null}

      <Button type="submit" variant="primary" loading={loading}>
        Salvar permissão
      </Button>
    </form>
  );
}
