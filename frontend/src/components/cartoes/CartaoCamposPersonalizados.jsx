import { useCallback, useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import Button from "../ui/Button";
import campoPersonalizadoService from "../../services/campoPersonalizadoService";
import cartaoCampoValorService from "../../services/cartaoCampoValorService";
import { extractList } from "../../utils/apiData";
import RenderCampoTexto from "../camposPersonalizados/RenderCampoTexto";
import RenderCampoNumero from "../camposPersonalizados/RenderCampoNumero";
import RenderCampoData from "../camposPersonalizados/RenderCampoData";
import RenderCampoDataHora from "../camposPersonalizados/RenderCampoDataHora";
import RenderCampoBooleano from "../camposPersonalizados/RenderCampoBooleano";
import RenderCampoSelecao from "../camposPersonalizados/RenderCampoSelecao";
import RenderCampoUsuario from "../camposPersonalizados/RenderCampoUsuario";

function renderByType(campo, value, onChange) {
  switch (campo.tipo) {
    case "numero":
      return <RenderCampoNumero value={value} onChange={onChange} />;
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

export default function CartaoCamposPersonalizados({ quadroId, cartaoId }) {
  const [loading, setLoading] = useState(true);
  const [campos, setCampos] = useState([]);
  const [values, setValues] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const carregar = useCallback(async () => {
    if (!quadroId || !cartaoId) return;
    setLoading(true);
    setFeedback({ type: "", message: "" });
    try {
      const [resCampos, resValores] = await Promise.all([
        campoPersonalizadoService.listar(quadroId),
        cartaoCampoValorService.listar(quadroId, cartaoId),
      ]);
      const listaCampos = extractList(resCampos).filter((item) => item.ativo !== false);
      const listaValores = extractList(resValores);
      const valoresMap = {};
      listaValores.forEach((item) => {
        valoresMap[item.campoId] = item.valor;
      });
      setCampos(listaCampos);
      setValues(valoresMap);
    } catch {
      setCampos([]);
      setValues({});
    } finally {
      setLoading(false);
    }
  }, [quadroId, cartaoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function salvarCampo(campo) {
    setSavingId(campo.id);
    setFeedback({ type: "", message: "" });
    try {
      const response = await cartaoCampoValorService.definir(
        quadroId,
        cartaoId,
        campo.id,
        { valor: values[campo.id] ?? null }
      );
      const atualizado = response?.data;
      setValues((prev) => ({ ...prev, [campo.id]: atualizado?.valor ?? null }));
      setFeedback({
        type: "success",
        message: response?.message || "Campo salvo com sucesso.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Não foi possível salvar o campo.",
      });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-xs)]">
      <div className="mb-3 flex items-center gap-2">
        <SlidersHorizontal size={18} />
        <h2 className="text-[var(--font-size-heading-4)] font-semibold text-[var(--color-text)]">
          Campos personalizados
        </h2>
      </div>

      {loading ? (
        <p className="text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
          Carregando campos personalizados…
        </p>
      ) : campos.length === 0 ? (
        <p className="text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
          Nenhum campo personalizado ativo para este quadro.
        </p>
      ) : (
        <div className="space-y-3">
          {feedback.message ? (
            <p
              className={
                feedback.type === "error"
                  ? "rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-surface)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-danger-text)]"
                  : "rounded-lg border border-[var(--color-success-border)] bg-[var(--color-success-surface)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-success-text)]"
              }
              role={feedback.type === "error" ? "alert" : "status"}
            >
              {feedback.message}
            </p>
          ) : null}
          {campos.map((campo) => (
            <div key={campo.id}>
              <label className="mb-1 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]">
                {campo.nome}
              </label>
              {renderByType(campo, values[campo.id], (next) =>
                setValues((prev) => ({ ...prev, [campo.id]: next }))
              )}
              <div className="mt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  loading={savingId === campo.id}
                  disabled={savingId != null}
                  onClick={() => salvarCampo(campo)}
                >
                  Salvar campo
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
