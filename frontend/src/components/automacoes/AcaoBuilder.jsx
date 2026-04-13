export default function AcaoBuilder({
  listas = [],
  value = {},
  disabled = false,
  onChange,
}) {
  const listaOrigemId = value.listaOrigemId ? String(value.listaOrigemId) : "";
  const listaDestinoId = value.listaDestinoId ? String(value.listaDestinoId) : "";

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div>
        <label
          htmlFor="automacao-lista-origem"
          className="mb-1 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
        >
          Lista de origem (opcional)
        </label>
        <select
          id="automacao-lista-origem"
          value={listaOrigemId}
          disabled={disabled}
          onChange={(event) =>
            onChange?.({
              ...value,
              listaOrigemId: event.target.value ? Number(event.target.value) : null,
            })
          }
          className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
        >
          <option value="">Qualquer lista</option>
          {listas.map((lista) => (
            <option key={lista.id} value={lista.id}>
              {lista.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="automacao-lista-destino"
          className="mb-1 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
        >
          Lista de destino (opcional)
        </label>
        <select
          id="automacao-lista-destino"
          value={listaDestinoId}
          disabled={disabled}
          onChange={(event) =>
            onChange?.({
              ...value,
              listaDestinoId: event.target.value ? Number(event.target.value) : null,
            })
          }
          className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
        >
          <option value="">Sem movimentação</option>
          {listas.map((lista) => (
            <option key={lista.id} value={lista.id}>
              {lista.nome}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
