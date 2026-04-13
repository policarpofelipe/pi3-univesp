import { useMemo, useState } from "react";
import Button from "../ui/Button";

const DEFAULT_VALUES = {
  listaDestinoId: "",
  papelId: "",
};

export default function ListaTransicoesForm({
  listasDestino = [],
  papeis = [],
  loading = false,
  onSubmit,
}) {
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const destinos = useMemo(
    () => listasDestino.filter((lista) => lista?.id),
    [listasDestino]
  );
  const papeisDisponiveis = useMemo(
    () => papeis.filter((papel) => papel?.id),
    [papeis]
  );

  function validate(nextValues) {
    const nextErrors = {};
    if (!nextValues.listaDestinoId) {
      nextErrors.listaDestinoId = "Selecione uma lista de destino.";
    }
    return nextErrors;
  }

  function updateField(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await onSubmit?.({
        listaDestinoId: Number(values.listaDestinoId),
        ...(values.papelId ? { papelId: Number(values.papelId) } : {}),
      });
      setValues(DEFAULT_VALUES);
      setErrors({});
    } catch (error) {
      setSubmitError(
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível criar a regra de transição."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label
          htmlFor="transicao-lista-destino"
          className="mb-1 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
        >
          Lista de destino
        </label>
        <select
          id="transicao-lista-destino"
          value={values.listaDestinoId}
          onChange={(event) => updateField("listaDestinoId", event.target.value)}
          className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
          aria-invalid={Boolean(errors.listaDestinoId)}
        >
          <option value="">Selecione uma lista</option>
          {destinos.map((lista) => (
            <option key={lista.id} value={lista.id}>
              {lista.nome}
            </option>
          ))}
        </select>
        {errors.listaDestinoId ? (
          <p className="mt-1 text-[var(--font-size-xs)] text-[var(--color-danger-text)]">
            {errors.listaDestinoId}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="transicao-papel"
          className="mb-1 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
        >
          Papel (opcional)
        </label>
        <select
          id="transicao-papel"
          value={values.papelId}
          onChange={(event) => updateField("papelId", event.target.value)}
          className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
        >
          <option value="">Todos os papéis</option>
          {papeisDisponiveis.map((papel) => (
            <option key={papel.id} value={papel.id}>
              {papel.nome}
            </option>
          ))}
        </select>
      </div>

      {submitError ? (
        <p
          className="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-surface)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-danger-text)]"
          role="alert"
        >
          {submitError}
        </p>
      ) : null}

      <Button type="submit" variant="primary" loading={loading}>
        Criar regra de transição
      </Button>
    </form>
  );
}
