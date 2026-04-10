import React, { useCallback, useEffect, useState } from "react";
import Button from "../ui/Button";
import quadroService from "../../services/quadroService";

const DEFAULT_PREFS = {
  mostrarContagemCartoes: true,
  densidadeListagem: "confortavel",
  abrirDetalheEmPainel: false,
};

function normalizePrefs(raw) {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_PREFS };
  }

  return {
    mostrarContagemCartoes:
      raw.mostrarContagemCartoes ?? DEFAULT_PREFS.mostrarContagemCartoes,
    densidadeListagem:
      raw.densidadeListagem ?? DEFAULT_PREFS.densidadeListagem,
    abrirDetalheEmPainel:
      raw.abrirDetalheEmPainel ?? DEFAULT_PREFS.abrirDetalheEmPainel,
  };
}

export default function QuadroPreferenciasForm({
  quadroId,
  usuarioId,
  className = "",
}) {
  const [values, setValues] = useState(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveOk, setSaveOk] = useState(false);

  const carregar = useCallback(async () => {
    if (!quadroId || !usuarioId) {
      setLoading(false);
      setLoadError(
        "Sessão ou identificadores incompletos; não é possível carregar preferências."
      );
      return;
    }

    setLoading(true);
    setLoadError("");

    try {
      const response = await quadroService.obterPreferenciasUsuario(
        quadroId,
        usuarioId
      );
      const data =
        response?.data != null && typeof response.data === "object"
          ? response.data
          : response;
      setValues(normalizePrefs(data));
    } catch (err) {
      setLoadError(
        err?.response?.status === 404
          ? "As preferências por usuário ainda não estão disponíveis nesta API. Os campos abaixo são locais até o endpoint ser publicado."
          : err?.message || "Não foi possível carregar as preferências."
      );
      setValues({ ...DEFAULT_PREFS });
    } finally {
      setLoading(false);
    }
  }, [quadroId, usuarioId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setSaveOk(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaveError("");
    setSaveOk(false);

    if (!quadroId || !usuarioId) {
      setSaveError("Usuário ou quadro não identificado.");
      return;
    }

    setSaving(true);

    try {
      await quadroService.atualizarPreferenciasUsuario(
        quadroId,
        usuarioId,
        values
      );
      setSaveOk(true);
    } catch (err) {
      setSaveError(
        err?.response?.data?.message ||
          err?.message ||
          "Não foi possível salvar as preferências."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className={[
        "rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 md:p-6",
        className,
      ].join(" ")}
      aria-labelledby="quadro-prefs-titulo"
    >
      <h3
        id="quadro-prefs-titulo"
        className="text-[var(--font-size-md)] font-semibold text-[var(--color-text)]"
      >
        Preferências neste quadro (por usuário)
      </h3>
      <p className="mt-1 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
        Ajustes de visualização aplicados só à sua conta neste quadro.
      </p>

      {loading ? (
        <p className="mt-4 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
          Carregando preferências…
        </p>
      ) : null}

      {loadError ? (
        <p
          className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-text-muted)]"
          role="status"
        >
          {loadError}
        </p>
      ) : null}

      {!loading ? (
        <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="mostrarContagemCartoes"
              checked={values.mostrarContagemCartoes}
              onChange={handleChange}
              className="mt-1 h-4 w-4 rounded border-[var(--color-border)]"
            />
            <span>
              <span className="block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]">
                Mostrar contagem de cartões nas listas
              </span>
              <span className="mt-0.5 block text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
                Exibe totais ao lado do nome de cada lista no quadro.
              </span>
            </span>
          </label>

          <div>
            <label
              htmlFor="quadro-prefs-densidade"
              className="mb-1 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
            >
              Densidade da listagem
            </label>
            <select
              id="quadro-prefs-densidade"
              name="densidadeListagem"
              value={values.densidadeListagem}
              onChange={handleChange}
              className="w-full max-w-md rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
            >
              <option value="confortavel">Confortável</option>
              <option value="compacta">Compacta</option>
            </select>
          </div>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="abrirDetalheEmPainel"
              checked={values.abrirDetalheEmPainel}
              onChange={handleChange}
              className="mt-1 h-4 w-4 rounded border-[var(--color-border)]"
            />
            <span>
              <span className="block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]">
                Abrir detalhe do cartão em painel lateral
              </span>
              <span className="mt-0.5 block text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
                Quando disponível no fluxo do quadro, prioriza painel em vez de
                página inteira.
              </span>
            </span>
          </label>

          {saveError ? (
            <p
              className="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-surface)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-danger-text)]"
              role="alert"
            >
              {saveError}
            </p>
          ) : null}

          {saveOk ? (
            <p
              className="text-[var(--font-size-sm)] text-[var(--color-success-text)]"
              role="status"
            >
              Preferências salvas.
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="primary" loading={saving}>
              Salvar preferências
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={carregar}
              disabled={saving}
            >
              Restaurar do servidor
            </Button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
