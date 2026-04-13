import { useEffect, useMemo, useState } from "react";
import Button from "../ui/Button";
import CampoOpcaoForm from "./CampoOpcaoForm";

const TIPOS = [
  { id: "texto", label: "Texto" },
  { id: "numero", label: "Número" },
  { id: "data", label: "Data" },
  { id: "data_hora", label: "Data e hora" },
  { id: "booleano", label: "Booleano" },
  { id: "selecao", label: "Seleção" },
  { id: "usuario", label: "Usuário" },
];

function normalize(initialValues = {}) {
  const config = initialValues.configJson || {};
  const opcoes = Array.isArray(config.opcoes) ? config.opcoes : [];

  return {
    nome: initialValues.nome || "",
    tipo: initialValues.tipo || "texto",
    descricao: initialValues.descricao || "",
    obrigatorio: Boolean(initialValues.obrigatorio),
    ativo: initialValues.ativo !== undefined ? Boolean(initialValues.ativo) : true,
    opcoes,
  };
}

export default function CampoPersonalizadoForm({
  modo = "criar",
  initialValues = {},
  loading = false,
  onSubmit,
  onCancel,
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

  const usaOpcoes = values.tipo === "selecao";

  function validate(nextValues) {
    const nextErrors = {};
    if (!nextValues.nome.trim()) {
      nextErrors.nome = "O nome do campo é obrigatório.";
    }
    if (!nextValues.tipo) {
      nextErrors.tipo = "Selecione o tipo do campo.";
    }
    if (nextValues.tipo === "selecao" && nextValues.opcoes.length === 0) {
      nextErrors.opcoes = "Adicione pelo menos uma opção para o tipo seleção.";
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
        tipo: values.tipo,
        descricao: values.descricao.trim(),
        obrigatorio: values.obrigatorio,
        ativo: values.ativo,
        configJson: values.tipo === "selecao" ? { opcoes: values.opcoes } : null,
      });
    } catch (error) {
      setSubmitError(
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível salvar o campo personalizado."
      );
    }
  }

  function addOpcao(label) {
    const normalized = String(label || "").trim();
    if (!normalized) return;
    setValues((prev) => {
      if (prev.opcoes.includes(normalized)) return prev;
      return { ...prev, opcoes: [...prev.opcoes, normalized] };
    });
  }

  function removeOpcao(opcao) {
    setValues((prev) => ({
      ...prev,
      opcoes: prev.opcoes.filter((item) => item !== opcao),
    }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label
          htmlFor="campo-nome"
          className="mb-1 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
        >
          Nome do campo
        </label>
        <input
          id="campo-nome"
          type="text"
          value={values.nome}
          disabled={loading}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, nome: event.target.value }))
          }
          className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
          placeholder="Ex.: Cliente"
          aria-invalid={Boolean(errors.nome)}
        />
        {errors.nome ? (
          <p className="mt-1 text-[var(--font-size-xs)] text-[var(--color-danger-text)]">
            {errors.nome}
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label
            htmlFor="campo-tipo"
            className="mb-1 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
          >
            Tipo
          </label>
          <select
            id="campo-tipo"
            value={values.tipo}
            disabled={loading || modo === "editar"}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, tipo: event.target.value }))
            }
            className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
          >
            {TIPOS.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="campo-descricao"
            className="mb-1 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
          >
            Descrição
          </label>
          <input
            id="campo-descricao"
            type="text"
            value={values.descricao}
            disabled={loading}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, descricao: event.target.value }))
            }
            className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
            placeholder="Contexto de uso do campo"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-[var(--font-size-sm)] text-[var(--color-text)]">
          <input
            type="checkbox"
            checked={values.obrigatorio}
            disabled={loading}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, obrigatorio: event.target.checked }))
            }
          />
          Obrigatório
        </label>
        <label className="flex items-center gap-2 text-[var(--font-size-sm)] text-[var(--color-text)]">
          <input
            type="checkbox"
            checked={values.ativo}
            disabled={loading}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, ativo: event.target.checked }))
            }
          />
          Ativo
        </label>
      </div>

      {usaOpcoes ? (
        <section className="space-y-2 rounded-lg border border-[var(--color-border)] p-3">
          <h3 className="text-[var(--font-size-sm)] font-semibold text-[var(--color-text)]">
            Opções do campo
          </h3>
          <CampoOpcaoForm loading={loading} onAdd={addOpcao} />
          {errors.opcoes ? (
            <p className="text-[var(--font-size-xs)] text-[var(--color-danger-text)]">
              {errors.opcoes}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {values.opcoes.map((opcao) => (
              <button
                key={opcao}
                type="button"
                onClick={() => removeOpcao(opcao)}
                className="rounded-full border border-[var(--color-border)] px-3 py-1 text-[var(--font-size-xs)] text-[var(--color-text)]"
              >
                {opcao} ×
              </button>
            ))}
          </div>
        </section>
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
          {modo === "criar" ? "Criar campo" : "Salvar campo"}
        </Button>
      </div>
    </form>
  );
}
