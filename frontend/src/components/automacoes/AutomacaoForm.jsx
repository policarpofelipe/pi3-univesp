import { useEffect, useMemo, useState } from "react";
import Button from "../ui/Button";
import GatilhoSelector from "./GatilhoSelector";
import CondicaoBuilder from "./CondicaoBuilder";
import AcaoBuilder from "./AcaoBuilder";
import HandoffConfigForm from "./HandoffConfigForm";

function normalize(initialValues = {}) {
  return {
    nome: initialValues.nome || "",
    descricao: initialValues.descricao || "",
    gatilho: initialValues.gatilho || "",
    ativo: initialValues.ativo !== undefined ? Boolean(initialValues.ativo) : true,
    executaUmaVezPorCartao:
      initialValues.executaUmaVezPorCartao !== undefined
        ? Boolean(initialValues.executaUmaVezPorCartao)
        : true,
    listaOrigemId: initialValues.listaOrigemId || null,
    listaDestinoId: initialValues.listaDestinoId || null,
    condicoesJson: initialValues.condicoesJson || null,
  };
}

export default function AutomacaoForm({
  modo = "criar",
  initialValues = {},
  listas = [],
  loading = false,
  onSubmit,
  onCancel,
}) {
  const base = useMemo(() => normalize(initialValues), [initialValues]);
  const [values, setValues] = useState(base);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [condicoesValidas, setCondicoesValidas] = useState(true);

  useEffect(() => {
    setValues(base);
    setErrors({});
    setSubmitError("");
    setCondicoesValidas(true);
  }, [base]);

  function validate(nextValues) {
    const nextErrors = {};
    if (!nextValues.nome.trim()) {
      nextErrors.nome = "O nome da automação é obrigatório.";
    }
    if (!nextValues.gatilho) {
      nextErrors.gatilho = "Selecione um gatilho.";
    }
    if (!condicoesValidas) {
      nextErrors.condicoesJson = "Corrija o JSON das condições.";
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
        descricao: values.descricao.trim(),
        gatilho: values.gatilho,
        ativo: values.ativo,
        executaUmaVezPorCartao: values.executaUmaVezPorCartao,
        listaOrigemId: values.listaOrigemId,
        listaDestinoId: values.listaDestinoId,
        condicoesJson: values.condicoesJson,
      });
    } catch (error) {
      setSubmitError(
        error?.response?.data?.message ||
          error?.message ||
          "Não foi possível salvar a automação."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label
          htmlFor="automacao-nome"
          className="mb-1 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
        >
          Nome da automação
        </label>
        <input
          id="automacao-nome"
          type="text"
          value={values.nome}
          disabled={loading}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, nome: event.target.value }))
          }
          className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
          placeholder="Ex.: Mover cartão vencido"
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
          htmlFor="automacao-descricao"
          className="mb-1 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
        >
          Descrição
        </label>
        <input
          id="automacao-descricao"
          type="text"
          value={values.descricao}
          disabled={loading}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, descricao: event.target.value }))
          }
          className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
        />
      </div>

      <GatilhoSelector
        value={values.gatilho}
        disabled={loading}
        onChange={(gatilho) => setValues((prev) => ({ ...prev, gatilho }))}
      />
      {errors.gatilho ? (
        <p className="text-[var(--font-size-xs)] text-[var(--color-danger-text)]">
          {errors.gatilho}
        </p>
      ) : null}

      <AcaoBuilder
        listas={listas}
        value={values}
        disabled={loading}
        onChange={(next) => setValues((prev) => ({ ...prev, ...next }))}
      />

      <CondicaoBuilder
        initialValue={values.condicoesJson}
        disabled={loading}
        onChange={(condicoesJson, valido) => {
          setValues((prev) => ({ ...prev, condicoesJson }));
          setCondicoesValidas(valido);
        }}
      />
      {errors.condicoesJson ? (
        <p className="text-[var(--font-size-xs)] text-[var(--color-danger-text)]">
          {errors.condicoesJson}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-[var(--font-size-sm)] text-[var(--color-text)]">
          <input
            type="checkbox"
            checked={values.executaUmaVezPorCartao}
            disabled={loading}
            onChange={(event) =>
              setValues((prev) => ({
                ...prev,
                executaUmaVezPorCartao: event.target.checked,
              }))
            }
          />
          Executar apenas uma vez por cartão
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
          Automação ativa
        </label>
      </div>

      <HandoffConfigForm />

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
          {modo === "criar" ? "Criar automação" : "Salvar automação"}
        </Button>
      </div>
    </form>
  );
}
