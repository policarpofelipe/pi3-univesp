import React from "react";

export default function RenderCampoUsuario({
  value = "",
  users = [],
  disabled = false,
  onChange,
}) {
  return (
    <select
      value={value || ""}
      disabled={disabled}
      onChange={(event) => onChange?.(event.target.value)}
      className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
    >
      <option value="">Selecione um usuário</option>
      {users.map((user) => (
        <option key={user.id} value={user.id}>
          {user.nome || user.nomeExibicao || `Usuário ${user.id}`}
        </option>
      ))}
    </select>
  );
}
