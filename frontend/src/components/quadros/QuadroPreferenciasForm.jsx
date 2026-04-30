import React, { useCallback, useEffect, useState } from "react";
import Button from "../ui/Button";
import quadroService from "../../services/quadroService";

const DEFAULT_PREFS = {
  tema: "sistema",
  corFundo: "",
  compacto: false,
};

function normalizePrefs(raw) {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_PREFS };
  }

  return {
    tema: raw.tema ?? DEFAULT_PREFS.tema,
    corFundo: raw.corFundo ?? DEFAULT_PREFS.corFundo,
    compacto: raw.compacto ?? DEFAULT_PREFS.compacto,
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
        err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          err?.message ||
          "Não foi possível carregar as preferências."
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
        err?.response?.data?.error?.message ||
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
        "quadro-preferencias-form",
        className,
      ].join(" ")}
      aria-labelledby="quadro-prefs-titulo"
    >
      <h3 id="quadro-prefs-titulo" className="quadro-preferencias-form__title">
        Preferências neste quadro (por usuário)
      </h3>
      <p className="quadro-preferencias-form__description">
        Ajustes de visualização aplicados só à sua conta neste quadro.
      </p>

      {loading ? (
        <p className="quadro-preferencias-form__loading">
          Carregando preferências…
        </p>
      ) : null}

      {loadError ? (
        <p className="quadro-preferencias-form__feedback" role="status">
          {loadError}
        </p>
      ) : null}

      {!loading ? (
        <form className="quadro-preferencias-form__form" onSubmit={handleSubmit}>
          <div className="quadro-preferencias-form__field">
            <label
              htmlFor="quadro-prefs-tema"
              className="quadro-preferencias-form__label"
            >
              Tema
            </label>
            <select
              id="quadro-prefs-tema"
              name="tema"
              value={values.tema}
              onChange={handleChange}
              className="quadro-preferencias-form__select"
            >
              <option value="sistema">Sistema</option>
              <option value="claro">Claro</option>
              <option value="escuro">Escuro</option>
            </select>
          </div>

          <div className="quadro-preferencias-form__field">
            <label
              htmlFor="quadro-prefs-cor-fundo"
              className="quadro-preferencias-form__label"
            >
              Cor de fundo (opcional)
            </label>
            <input
              id="quadro-prefs-cor-fundo"
              type="color"
              name="corFundo"
              value={values.corFundo || "#000000"}
              onChange={handleChange}
              className="quadro-preferencias-form__select"
            />
          </div>

          <label className="quadro-preferencias-form__check-card">
            <input
              type="checkbox"
              name="compacto"
              checked={Boolean(values.compacto)}
              onChange={handleChange}
              className="quadro-preferencias-form__checkbox"
            />
            <span className="quadro-preferencias-form__check-content">
              <span className="quadro-preferencias-form__check-title">
                Modo compacto no quadro
              </span>
              <span className="quadro-preferencias-form__check-description">
                Reduz espaçamentos para maior densidade visual.
              </span>
            </span>
          </label>

          {saveError ? (
            <p className="quadro-preferencias-form__feedback quadro-preferencias-form__feedback--error" role="alert">
              {saveError}
            </p>
          ) : null}

          {saveOk ? (
            <p className="quadro-preferencias-form__feedback quadro-preferencias-form__feedback--success" role="status">
              Preferências salvas.
            </p>
          ) : null}

          <div className="quadro-preferencias-form__actions">
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
