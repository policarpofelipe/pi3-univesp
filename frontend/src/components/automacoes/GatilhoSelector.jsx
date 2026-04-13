const GATILHOS = [
  { id: "AO_CRIAR_CARTAO", label: "Ao criar cartão" },
  { id: "AO_ENTRAR_NA_LISTA", label: "Ao entrar na lista" },
  { id: "AO_SAIR_DA_LISTA", label: "Ao sair da lista" },
  { id: "AO_ATUALIZAR_CAMPO", label: "Ao atualizar campo" },
  { id: "AO_VENCER_PRAZO", label: "Ao vencer prazo" },
];

export default function GatilhoSelector({ value = "", disabled = false, onChange }) {
  return (
    <div>
      <label
        htmlFor="automacao-gatilho"
        className="mb-1 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
      >
        Gatilho
      </label>
      <select
        id="automacao-gatilho"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
      >
        <option value="">Selecione</option>
        {GATILHOS.map((gatilho) => (
          <option key={gatilho.id} value={gatilho.id}>
            {gatilho.label}
          </option>
        ))}
      </select>
    </div>
  );
}
