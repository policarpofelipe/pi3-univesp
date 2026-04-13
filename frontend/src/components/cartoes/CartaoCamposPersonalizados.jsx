import { useCallback, useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import campoPersonalizadoService from "../../services/campoPersonalizadoService";
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

export default function CartaoCamposPersonalizados({ quadroId }) {
  const [loading, setLoading] = useState(true);
  const [campos, setCampos] = useState([]);
  const [values, setValues] = useState({});

  const carregar = useCallback(async () => {
    if (!quadroId) return;
    setLoading(true);
    try {
      const res = await campoPersonalizadoService.listar(quadroId);
      setCampos(extractList(res).filter((item) => item.ativo !== false));
    } catch {
      setCampos([]);
    } finally {
      setLoading(false);
    }
  }, [quadroId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

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
          {campos.map((campo) => (
            <div key={campo.id}>
              <label className="mb-1 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]">
                {campo.nome}
              </label>
              {renderByType(campo, values[campo.id], (next) =>
                setValues((prev) => ({ ...prev, [campo.id]: next }))
              )}
            </div>
          ))}
          <p className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
            Estrutura pronta no frontend. Persistência de valores por cartão será ligada
            quando o backend de valores de campo estiver disponível nesta API.
          </p>
        </div>
      )}
    </section>
  );
}
