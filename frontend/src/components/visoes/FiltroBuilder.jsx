import { useEffect, useMemo, useState } from "react";
import {
  BOARD_FILTER_DEADLINE,
  BOARD_FILTER_PRIORITIES,
  BOARD_FILTER_SITUATION,
} from "../../utils/boardFilterUtils";

export default function FiltroBuilder({
  initialValue = null,
  tags = [],
  membros = [],
  disabled = false,
  onChange,
}) {
  const [values, setValues] = useState({
    busca: "",
    tagId: "",
    prioridade: "",
    prazo: "",
    situacao: "",
    membroId: "",
  });

  const membrosOpcoes = useMemo(
    () =>
      (Array.isArray(membros) ? membros : [])
        .map((m) => ({
          id: String(m.usuarioId ?? m.usuario_id ?? m.id ?? ""),
          nome: String(m.nome || "").trim(),
        }))
        .filter((m) => m.id),
    [membros]
  );

  useEffect(() => {
    const parsed =
      initialValue && typeof initialValue === "object"
        ? {
            busca: String(initialValue.busca || ""),
            tagId: String(initialValue.tagId || ""),
            prioridade: String(initialValue.prioridade || ""),
            prazo: String(initialValue.prazo || ""),
            situacao: String(initialValue.situacao || ""),
            membroId: String(initialValue.membroId || ""),
          }
        : {
            busca: "",
            tagId: "",
            prioridade: "",
            prazo: "",
            situacao: "",
            membroId: "",
          };
    setValues(parsed);
  }, [initialValue]);

  function patch(partial) {
    const next = { ...values, ...partial };
    setValues(next);
    const filtro = Object.fromEntries(
      Object.entries(next).filter(([, value]) => String(value || "").trim() !== "")
    );
    if (Object.keys(filtro).length === 0) {
      onChange?.(null, true);
      return;
    }
    onChange?.(filtro, true);
  }

  return (
    <div className="space-y-3">
      <p className="text-[var(--font-size-sm)] font-medium text-[var(--color-text)]">
        Filtros da visão (opcional)
      </p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label
            htmlFor="visao-filtro-busca"
            className="mb-1 block text-[var(--font-size-xs)] text-[var(--color-text-muted)]"
          >
            Busca no título
          </label>
          <input
            id="visao-filtro-busca"
            type="text"
            value={values.busca}
            disabled={disabled}
            onChange={(event) => patch({ busca: event.target.value })}
            placeholder="Ex.: cliente, financeiro..."
            className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
          />
        </div>

        <div>
          <label
            htmlFor="visao-filtro-tag"
            className="mb-1 block text-[var(--font-size-xs)] text-[var(--color-text-muted)]"
          >
            Tag
          </label>
          <select
            id="visao-filtro-tag"
            value={values.tagId}
            disabled={disabled}
            onChange={(event) => patch({ tagId: event.target.value })}
            className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
          >
            <option value="">Todas</option>
            {tags.map((tag) => (
              <option key={tag.id} value={String(tag.id)}>
                {tag.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="visao-filtro-prioridade"
            className="mb-1 block text-[var(--font-size-xs)] text-[var(--color-text-muted)]"
          >
            Prioridade
          </label>
          <select
            id="visao-filtro-prioridade"
            value={values.prioridade}
            disabled={disabled}
            onChange={(event) => patch({ prioridade: event.target.value })}
            className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
          >
            {BOARD_FILTER_PRIORITIES.map((item) => (
              <option key={item.value || "all"} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="visao-filtro-situacao"
            className="mb-1 block text-[var(--font-size-xs)] text-[var(--color-text-muted)]"
          >
            Situação
          </label>
          <select
            id="visao-filtro-situacao"
            value={values.situacao}
            disabled={disabled}
            onChange={(event) => patch({ situacao: event.target.value })}
            className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
          >
            {BOARD_FILTER_SITUATION.map((item) => (
              <option key={item.value || "all"} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="visao-filtro-responsavel"
            className="mb-1 block text-[var(--font-size-xs)] text-[var(--color-text-muted)]"
          >
            Responsável
          </label>
          <select
            id="visao-filtro-responsavel"
            value={values.membroId}
            disabled={disabled}
            onChange={(event) => patch({ membroId: event.target.value })}
            className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
          >
            <option value="">Qualquer</option>
            {membrosOpcoes.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome || `Usuário ${m.id}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="visao-filtro-prazo"
            className="mb-1 block text-[var(--font-size-xs)] text-[var(--color-text-muted)]"
          >
            Prazo
          </label>
          <select
            id="visao-filtro-prazo"
            value={values.prazo}
            disabled={disabled}
            onChange={(event) => patch({ prazo: event.target.value })}
            className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
          >
            {BOARD_FILTER_DEADLINE.map((item) => (
              <option key={item.value || "all"} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
