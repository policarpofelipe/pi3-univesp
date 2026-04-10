import React from "react";
import { Mail, Trash2, Send } from "lucide-react";
import Button from "../ui/Button";

function normalizarPapeis(membro) {
  if (Array.isArray(membro.papeis) && membro.papeis.length > 0) {
    return membro.papeis.map((p) =>
      typeof p === "string" ? p : p?.nome
    ).filter(Boolean);
  }

  if (membro.papel) {
    return [membro.papel];
  }

  return [];
}

export default function QuadroMembrosTable({
  membros = [],
  papeisDisponiveis = [],
  loading = false,
  onAlterarPapel,
  onRemover,
  onReenviarConvite,
}) {
  if (loading) {
    return (
      <p className="py-8 text-center text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
        Carregando membros…
      </p>
    );
  }

  if (!membros.length) {
    return null;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
      <table className="w-full min-w-[640px] border-collapse text-left text-[var(--font-size-sm)]">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]">
            <th className="px-4 py-3 text-[var(--font-size-xs)] font-semibold uppercase tracking-wide text-[var(--color-text-soft)]">
              Membro
            </th>
            <th className="px-4 py-3 text-[var(--font-size-xs)] font-semibold uppercase tracking-wide text-[var(--color-text-soft)]">
              Status
            </th>
            <th className="px-4 py-3 text-[var(--font-size-xs)] font-semibold uppercase tracking-wide text-[var(--color-text-soft)]">
              Papel
            </th>
            <th className="px-4 py-3 text-right text-[var(--font-size-xs)] font-semibold uppercase tracking-wide text-[var(--color-text-soft)]">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {membros.map((membro) => {
            const papeisLista = normalizarPapeis(membro);
            const papelAtual = papeisLista[0] || "";
            const pendente = membro.status === "pendente";

            return (
              <tr
                key={membro.id}
                className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)]"
              >
                <td className="px-4 py-3 align-top">
                  <div className="font-medium text-[var(--color-text)]">
                    {membro.nome || "Sem nome"}
                  </div>
                  {membro.email ? (
                    <div className="mt-1 flex items-center gap-1 text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
                      <Mail size={12} aria-hidden="true" />
                      <span>{membro.email}</span>
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3 align-top">
                  <span
                    className={[
                      "inline-flex rounded-full border px-2 py-0.5 text-[var(--font-size-xs)] font-medium capitalize",
                      pendente
                        ? "border-[var(--color-warning-border)] bg-[var(--color-warning-surface)] text-[var(--color-warning-text)]"
                        : "border-[var(--color-success-border)] bg-[var(--color-success-surface)] text-[var(--color-success-text)]",
                    ].join(" ")}
                  >
                    {pendente ? "Pendente" : membro.status || "Ativo"}
                  </span>
                </td>
                <td className="px-4 py-3 align-top">
                  {typeof onAlterarPapel === "function" &&
                  papeisDisponiveis.length > 0 ? (
                    <select
                      aria-label={`Papel de ${membro.nome || "membro"}`}
                      className="w-full min-w-[10rem] max-w-[14rem] rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-2 py-1.5 text-[var(--font-size-sm)]"
                      value={papelAtual}
                      onChange={(e) =>
                        onAlterarPapel(membro.id, e.target.value)
                      }
                    >
                      <option value="">
                        {pendente ? "Aguardando aceite" : "Selecionar"}
                      </option>
                      {papeisDisponiveis.map((p) => (
                        <option key={p.id || p.nome} value={p.nome}>
                          {p.nome}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-[var(--color-text-muted)]">
                      {papeisLista.length
                        ? papeisLista.join(", ")
                        : "Sem papel"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="flex flex-wrap justify-end gap-2">
                    {pendente && typeof onReenviarConvite === "function" ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        leftIcon={<Send size={14} />}
                        onClick={() => onReenviarConvite(membro.id)}
                      >
                        Reenviar
                      </Button>
                    ) : null}
                    {typeof onRemover === "function" ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        leftIcon={<Trash2 size={14} />}
                        onClick={() => onRemover(membro.id)}
                        aria-label={`Remover ${membro.nome || "membro"}`}
                      >
                        Remover
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
