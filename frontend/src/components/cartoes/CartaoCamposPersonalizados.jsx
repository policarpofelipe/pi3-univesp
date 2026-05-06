import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, SlidersHorizontal } from "lucide-react";
import campoPersonalizadoService from "../../services/campoPersonalizadoService";
import cartaoCampoValorService from "../../services/cartaoCampoValorService";
import { extractList } from "../../utils/apiData";
import RenderCampoTexto from "../camposPersonalizados/RenderCampoTexto";
import RenderCampoNumero from "../camposPersonalizados/RenderCampoNumero";
import RenderCampoMoeda from "../camposPersonalizados/RenderCampoMoeda";
import RenderCampoData from "../camposPersonalizados/RenderCampoData";
import RenderCampoDataHora from "../camposPersonalizados/RenderCampoDataHora";
import RenderCampoBooleano from "../camposPersonalizados/RenderCampoBooleano";
import RenderCampoSelecao from "../camposPersonalizados/RenderCampoSelecao";
import RenderCampoUsuario from "../camposPersonalizados/RenderCampoUsuario";

import "../../styles/components/campos-personalizados-cartao.css";

const DEBOUNCE_MS = 550;

function tipoNormalizado(campo) {
  return String(campo?.tipo ?? "")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");
}

/**
 * Campos estreitos em 2 colunas: tipos nativos + heurística (opções de seleção).
 */
function isCampoLayoutCurto(campo) {
  const t = tipoNormalizado(campo);
  const opcoes = campo?.configJson?.opcoes;
  if (Array.isArray(opcoes) && opcoes.length > 0) {
    if (!t || t === "texto") {
      return true;
    }
  }
  if (!t || t === "texto") return false;
  return (
    t === "numero" ||
    t === "moeda" ||
    t === "data" ||
    t === "data_hora" ||
    t === "booleano" ||
    t === "selecao" ||
    t === "usuario"
  );
}

function usaSalvamentoDebounced(campo) {
  const t = tipoNormalizado(campo);
  return t === "texto" || t === "numero" || t === "moeda" || !t;
}

function valoresEquivalentes(a, b) {
  if (Object.is(a, b)) return true;
  if (a == null && b == null) return true;
  if (a === "" && (b == null || b === "")) return true;
  if (b === "" && (a == null || a === "")) return true;
  return JSON.stringify(a) === JSON.stringify(b);
}

function renderByType(campo, value, onChange) {
  const t = tipoNormalizado(campo);
  switch (t) {
    case "numero":
      return <RenderCampoNumero value={value} onChange={onChange} />;
    case "moeda":
      return <RenderCampoMoeda value={value} onChange={onChange} />;
    case "data":
      return <RenderCampoData value={value} onChange={onChange} />;
    case "data_hora":
      return <RenderCampoDataHora value={value} onChange={onChange} />;
    case "booleano":
      return <RenderCampoBooleano value={value} onChange={onChange} />;
    case "selecao":
      return (
        <RenderCampoSelecao
          value={value}
          options={campo?.configJson?.opcoes || []}
          onChange={onChange}
        />
      );
    case "usuario":
      return <RenderCampoUsuario value={value} users={[]} onChange={onChange} />;
    default:
      return <RenderCampoTexto value={value} onChange={onChange} />;
  }
}

export default function CartaoCamposPersonalizados({
  quadroId,
  cartaoId,
  embedded = false,
}) {
  const [loading, setLoading] = useState(true);
  const [campos, setCampos] = useState([]);
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState({});
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const ultimoSalvoRef = useRef({});
  const debouncePorCampoRef = useRef({});

  const limparDebounce = useCallback((campoId) => {
    const id = String(campoId);
    const t = debouncePorCampoRef.current[id];
    if (t != null) {
      window.clearTimeout(t);
      debouncePorCampoRef.current[id] = null;
    }
  }, []);

  const carregar = useCallback(async () => {
    if (!quadroId || !cartaoId) return;
    setLoading(true);
    setFeedback({ type: "", message: "" });
    try {
      const [resCampos, resValores] = await Promise.all([
        campoPersonalizadoService.listar(quadroId),
        cartaoCampoValorService.listar(quadroId, cartaoId),
      ]);
      const listaCampos = extractList(resCampos)
        .filter((item) => item.ativo !== false)
        .map((c) => {
          let configJson = c.configJson;
          if (typeof configJson === "string") {
            try {
              configJson = JSON.parse(configJson);
            } catch {
              configJson = null;
            }
          }
          return { ...c, configJson };
        });
      const listaValores = extractList(resValores);
      const valoresMap = {};
      listaValores.forEach((item) => {
        valoresMap[item.campoId] = item.valor;
      });
      setCampos(listaCampos);
      setValues(valoresMap);
      ultimoSalvoRef.current = { ...valoresMap };
    } catch {
      setCampos([]);
      setValues({});
      ultimoSalvoRef.current = {};
    } finally {
      setLoading(false);
    }
  }, [quadroId, cartaoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(
    () => () => {
      Object.keys(debouncePorCampoRef.current).forEach((id) => {
        const handle = debouncePorCampoRef.current[id];
        if (handle != null) window.clearTimeout(handle);
      });
    },
    []
  );

  const persistirValor = useCallback(
    async (campo, valor) => {
      if (!quadroId || !cartaoId) return;
      const id = campo.id;
      const anterior = ultimoSalvoRef.current[id];
      if (valoresEquivalentes(anterior, valor)) return;

      setSaving((s) => ({ ...s, [id]: true }));
      setFeedback({ type: "", message: "" });
      try {
        const response = await cartaoCampoValorService.definir(quadroId, cartaoId, id, {
          valor: valor ?? null,
        });
        const atualizado = response?.data;
        const normalizado = atualizado?.valor ?? valor ?? null;
        ultimoSalvoRef.current[id] = normalizado;
        setValues((prev) => ({ ...prev, [id]: normalizado }));
      } catch (error) {
        setFeedback({
          type: "error",
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Não foi possível salvar o campo.",
        });
      } finally {
        setSaving((s) => {
          const next = { ...s };
          delete next[id];
          return next;
        });
      }
    },
    [quadroId, cartaoId]
  );

  const agendarMudanca = useCallback(
    (campo, valorBruto) => {
      const id = campo.id;
      setValues((prev) => ({ ...prev, [id]: valorBruto }));

      if (usaSalvamentoDebounced(campo)) {
        limparDebounce(id);
        debouncePorCampoRef.current[String(id)] = window.setTimeout(() => {
          debouncePorCampoRef.current[String(id)] = null;
          persistirValor(campo, valorBruto);
        }, DEBOUNCE_MS);
        return;
      }

      persistirValor(campo, valorBruto);
    },
    [persistirValor, limparDebounce]
  );

  const body = loading ? (
    <p className="text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
      Carregando campos personalizados…
    </p>
  ) : campos.length === 0 ? (
    <p className="text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
      Nenhum campo personalizado ativo para este quadro.
    </p>
  ) : (
    <div className="flex flex-col gap-2">
      {feedback.type === "error" && feedback.message ? (
        <p
          className="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-surface)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-danger-text)]"
          role="alert"
        >
          {feedback.message}
        </p>
      ) : null}
      <div className="campos-personalizados-grid">
        {campos.map((campo) => {
          const largo = !isCampoLayoutCurto(campo);
          return (
            <div
              key={campo.id}
              className={[
                "cartao-campo-personalizado",
                largo ? "campos-personalizados-grid__item--full" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="cartao-campo-personalizado__head">
                <p className="cartao-campo-personalizado__label">{campo.nome}</p>
                {saving[campo.id] ? (
                  <span className="cartao-campo-personalizado__saving inline-flex items-center gap-1">
                    <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
                    Salvando…
                  </span>
                ) : null}
              </div>
              <div className="cartao-campo-personalizado__control">
                {renderByType(campo, values[campo.id], (next) =>
                  agendarMudanca(campo, next)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (embedded) {
    return body;
  }

  return (
    <section className="card-section">
      <div className="card-section__header">
        <h2 className="card-section__title">
          <SlidersHorizontal size={16} />
          Campos personalizados
        </h2>
      </div>
      {body}
    </section>
  );
}
