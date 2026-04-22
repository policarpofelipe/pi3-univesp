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
      <p className="quadro-membros-table__loading">
        Carregando membros…
      </p>
    );
  }

  if (!membros.length) {
    return null;
  }

  return (
    <div className="quadro-membros-table">
      <table className="quadro-membros-table__table">
        <thead className="quadro-membros-table__head">
          <tr>
            <th className="quadro-membros-table__head-cell">
              Membro
            </th>
            <th className="quadro-membros-table__head-cell">
              Status
            </th>
            <th className="quadro-membros-table__head-cell">
              Papel
            </th>
            <th className="quadro-membros-table__head-cell quadro-membros-table__head-cell--actions">
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
                className="quadro-membros-table__row"
              >
                <td className="quadro-membros-table__cell">
                  <div className="quadro-membros-table__member-name">
                    {membro.nome || "Sem nome"}
                  </div>
                  {membro.email ? (
                    <div className="quadro-membros-table__member-email">
                      <Mail size={12} aria-hidden="true" />
                      <span>{membro.email}</span>
                    </div>
                  ) : null}
                </td>
                <td className="quadro-membros-table__cell">
                  <span
                    className={[
                      "quadro-membros-table__status",
                      pendente
                        ? "quadro-membros-table__status--pending"
                        : "quadro-membros-table__status--active",
                    ].join(" ")}
                  >
                    {pendente ? "Pendente" : membro.status || "Ativo"}
                  </span>
                </td>
                <td className="quadro-membros-table__cell">
                  {typeof onAlterarPapel === "function" &&
                  papeisDisponiveis.length > 0 ? (
                    <select
                      aria-label={`Papel de ${membro.nome || "membro"}`}
                      className="quadro-membros-table__role-select"
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
                    <span className="quadro-membros-table__role-text">
                      {papeisLista.length
                        ? papeisLista.join(", ")
                        : "Sem papel"}
                    </span>
                  )}
                </td>
                <td className="quadro-membros-table__cell quadro-membros-table__cell--actions">
                  <div className="quadro-membros-table__actions">
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
