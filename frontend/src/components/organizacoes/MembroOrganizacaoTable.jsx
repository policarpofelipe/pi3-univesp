import React, { useMemo, useState } from "react";
import { Shield, Trash2, UserCheck, UserX, Users } from "lucide-react";
import IconButton from "../ui/IconButton";

/*
Contrato sugerido:
- membros: [
    {
      id,
      nome,
      email,
      papel,
      status,
      ultimoAcesso
    }
  ]
- onUpdateRole(membroId, novoPapel)
- onUpdateStatus(membroId, novoStatus)
- onRemove(membroId)

Observação:
- esta tabela assume papéis e status discretos
- ações são explícitas para evitar ambiguidade operacional
*/

const ROLE_OPTIONS = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Administrador" },
  { value: "member", label: "Membro" },
  { value: "viewer", label: "Leitor" },
];

const STATUS_OPTIONS = [
  { value: "ativo", label: "Ativo" },
  { value: "pendente", label: "Pendente" },
  { value: "inativo", label: "Inativo" },
];

function getRoleLabel(role) {
  return ROLE_OPTIONS.find((item) => item.value === role)?.label || role || "Não definido";
}

function getStatusLabel(status) {
  return STATUS_OPTIONS.find((item) => item.value === status)?.label || status || "Não definido";
}

function getStatusClasses(status) {
  if (status === "ativo") {
    return "border-[var(--color-success-border)] bg-[var(--color-success-surface)] text-[var(--color-success-text)]";
  }

  if (status === "pendente") {
    return "border-[var(--color-warning-border)] bg-[var(--color-warning-surface)] text-[var(--color-warning-text)]";
  }

  if (status === "inativo") {
    return "border-[var(--color-danger-border)] bg-[var(--color-danger-surface)] text-[var(--color-danger-text)]";
  }

  return "border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]";
}

function formatDate(value) {
  if (!value) return "Não informado";

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  } catch {
    return value;
  }
}

export default function MembroOrganizacaoTable({
  membros = [],
  onUpdateRole,
  onUpdateStatus,
  onRemove,
}) {
  const [pendingRoleId, setPendingRoleId] = useState(null);
  const [pendingStatusId, setPendingStatusId] = useState(null);
  const [pendingRemoveId, setPendingRemoveId] = useState(null);

  const normalizedMembros = useMemo(
    () => (Array.isArray(membros) ? membros : []),
    [membros]
  );

  async function handleRoleChange(membroId, novoPapel) {
    if (typeof onUpdateRole !== "function") return;

    try {
      setPendingRoleId(membroId);
      await onUpdateRole(membroId, novoPapel);
    } finally {
      setPendingRoleId(null);
    }
  }

  async function handleStatusChange(membroId, novoStatus) {
    if (typeof onUpdateStatus !== "function") return;

    try {
      setPendingStatusId(membroId);
      await onUpdateStatus(membroId, novoStatus);
    } finally {
      setPendingStatusId(null);
    }
  }

  async function handleRemove(membroId) {
    if (typeof onRemove !== "function") return;

    const confirmed = window.confirm(
      "Tem certeza de que deseja remover este membro da organização?"
    );

    if (!confirmed) return;

    try {
      setPendingRemoveId(membroId);
      await onRemove(membroId);
    } finally {
      setPendingRemoveId(null);
    }
  }

  if (normalizedMembros.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]">
          <Users className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="mt-4 text-[var(--font-size-md)] font-medium text-[var(--color-text)]">
          Nenhum membro encontrado
        </p>
        <p className="mt-1 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
          Quando houver membros vinculados à organização, eles serão exibidos aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-[var(--color-surface-alt)]">
            <tr>
              <th className="px-4 py-3 text-left text-[var(--font-size-xs)] font-semibold uppercase tracking-wide text-[var(--color-text-soft)]">
                Membro
              </th>
              <th className="px-4 py-3 text-left text-[var(--font-size-xs)] font-semibold uppercase tracking-wide text-[var(--color-text-soft)]">
                Papel
              </th>
              <th className="px-4 py-3 text-left text-[var(--font-size-xs)] font-semibold uppercase tracking-wide text-[var(--color-text-soft)]">
                Status
              </th>
              <th className="px-4 py-3 text-left text-[var(--font-size-xs)] font-semibold uppercase tracking-wide text-[var(--color-text-soft)]">
                Último acesso
              </th>
              <th className="px-4 py-3 text-right text-[var(--font-size-xs)] font-semibold uppercase tracking-wide text-[var(--color-text-soft)]">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {normalizedMembros.map((membro, index) => {
              const isUpdatingRole = pendingRoleId === membro.id;
              const isUpdatingStatus = pendingStatusId === membro.id;
              const isRemoving = pendingRemoveId === membro.id;

              return (
                <tr
                  key={membro.id}
                  className={index !== normalizedMembros.length - 1 ? "border-b border-[var(--color-border)]" : ""}
                >
                  <td className="px-4 py-4 align-top">
                    <div className="min-w-[220px]">
                      <p className="text-[var(--font-size-sm)] font-medium text-[var(--color-text)]">
                        {membro.nome || "Sem nome"}
                      </p>
                      <p className="mt-1 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
                        {membro.email || "Sem e-mail"}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="min-w-[180px]">
                      <label htmlFor={`papel-${membro.id}`} className="sr-only">
                        Alterar papel de {membro.nome || membro.email}
                      </label>
                      <div className="relative">
                        <Shield
                          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-soft)]"
                          aria-hidden="true"
                        />
                        <select
                          id={`papel-${membro.id}`}
                          value={membro.papel || "member"}
                          onChange={(e) => handleRoleChange(membro.id, e.target.value)}
                          disabled={isUpdatingRole || isRemoving}
                          className="pl-9"
                          aria-label={`Papel atual: ${getRoleLabel(membro.papel)}`}
                        >
                          {ROLE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="min-w-[180px] space-y-2">
                      <span
                        className={`inline-flex rounded-full border px-2 py-1 text-[var(--font-size-xs)] font-medium ${getStatusClasses(
                          membro.status
                        )}`}
                      >
                        {getStatusLabel(membro.status)}
                      </span>

                      <div>
                        <label htmlFor={`status-${membro.id}`} className="sr-only">
                          Alterar status de {membro.nome || membro.email}
                        </label>
                        <select
                          id={`status-${membro.id}`}
                          value={membro.status || "ativo"}
                          onChange={(e) => handleStatusChange(membro.id, e.target.value)}
                          disabled={isUpdatingStatus || isRemoving}
                          aria-label={`Status atual: ${getStatusLabel(membro.status)}`}
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <span className="text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
                      {formatDate(membro.ultimoAcesso || membro.ultimo_acesso)}
                    </span>
                  </td>

                  <td className="px-4 py-4 align-top">
                    <div className="flex items-center justify-end gap-2">
                      {membro.status === "ativo" ? (
                        <IconButton
                          icon={<UserX className="h-4 w-4" />}
                          label={`Marcar ${membro.nome || membro.email} como inativo`}
                          variant="ghost"
                          disabled={isUpdatingStatus || isUpdatingRole || isRemoving}
                          onClick={() => handleStatusChange(membro.id, "inativo")}
                        />
                      ) : (
                        <IconButton
                          icon={<UserCheck className="h-4 w-4" />}
                          label={`Marcar ${membro.nome || membro.email} como ativo`}
                          variant="ghost"
                          disabled={isUpdatingStatus || isUpdatingRole || isRemoving}
                          onClick={() => handleStatusChange(membro.id, "ativo")}
                        />
                      )}

                      <IconButton
                        icon={<Trash2 className="h-4 w-4" />}
                        label={`Remover ${membro.nome || membro.email} da organização`}
                        variant="danger"
                        disabled={isUpdatingRole || isUpdatingStatus || isRemoving}
                        onClick={() => handleRemove(membro.id)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}