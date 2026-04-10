import React, { useEffect, useMemo, useState } from "react";
import Button from "../ui/Button";

export const PERMISSOES_QUADRO_PADRAO = [
  {
    key: "visualizarQuadro",
    label: "Visualizar quadro",
    description: "Acesso de leitura ao quadro e cartões.",
  },
  {
    key: "editarQuadro",
    label: "Editar quadro",
    description: "Alterar nome, descrição e configurações básicas.",
  },
  {
    key: "excluirQuadro",
    label: "Excluir quadro",
    description: "Permite remover o quadro permanentemente.",
  },
  {
    key: "gerenciarMembros",
    label: "Gerenciar membros",
    description: "Convites, remoção e papéis dos participantes.",
  },
  {
    key: "moverCartoes",
    label: "Mover cartões",
    description: "Arrastar e transicionar cartões entre listas.",
  },
  {
    key: "editarListas",
    label: "Editar listas",
    description: "Criar, renomear e configurar listas do quadro.",
  },
];

const DEFAULT_PERMS = PERMISSOES_QUADRO_PADRAO.reduce((acc, { key }) => {
  acc[key] = false;
  return acc;
}, {});

function buildPermissoes(partial = {}) {
  const next = { ...DEFAULT_PERMS };
  Object.keys(next).forEach((k) => {
    if (partial[k] !== undefined) {
      next[k] = Boolean(partial[k]);
    }
  });
  return next;
}

function validate(values, modo) {
  const errors = {};
  if (!values.nome.trim()) {
    errors.nome = "O nome do papel é obrigatório.";
  }
  if (modo === "criar" && !values.nome.trim()) {
    errors.nome = "Informe um nome para o novo papel.";
  }
  return errors;
}

export default function QuadroPapelForm({
  modo = "criar",
  initialValues = {},
  loading = false,
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel = "Cancelar",
}) {
  const initialNome = initialValues.nome ?? "";
  const initialDesc = initialValues.descricao ?? "";

  const initialPerms = useMemo(
    () => buildPermissoes(initialValues.permissoes),
    [initialValues.permissoes]
  );

  const [nome, setNome] = useState(initialNome);
  const [descricao, setDescricao] = useState(initialDesc);
  const [permissoes, setPermissoes] = useState(initialPerms);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    setNome(initialNome);
    setDescricao(initialDesc);
    setPermissoes(buildPermissoes(initialValues.permissoes));
    setErrors({});
    setSubmitError("");
  }, [initialNome, initialDesc, initialValues.permissoes]);

  function togglePermissao(key) {
    setPermissoes((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    const values = { nome, descricao, permissoes };
    const v = validate(values, modo);
    setErrors(v);
    if (Object.keys(v).length) return;

    try {
      if (typeof onSubmit === "function") {
        await onSubmit({
          nome: nome.trim(),
          descricao: descricao.trim(),
          permissoes: { ...permissoes },
        });
      }
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message ||
          err?.message ||
          "Não foi possível salvar o papel."
      );
    }
  }

  const labelBotao =
    submitLabel || (modo === "criar" ? "Criar papel" : "Salvar papel");

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <div>
        <label
          htmlFor="papel-form-nome"
          className="mb-1 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
        >
          Nome do papel
        </label>
        <input
          id="papel-form-nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
          placeholder="Ex.: Colaborador"
          aria-invalid={Boolean(errors.nome)}
        />
        {errors.nome ? (
          <p className="mt-1 text-[var(--font-size-xs)] text-[var(--color-danger-text)]">
            {errors.nome}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="papel-form-descricao"
          className="mb-1 block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
        >
          Descrição
        </label>
        <textarea
          id="papel-form-descricao"
          rows={3}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
          placeholder="Responsabilidades deste papel"
        />
      </div>

      <fieldset className="rounded-lg border border-[var(--color-border)] p-3">
        <legend className="px-1 text-[var(--font-size-sm)] font-semibold text-[var(--color-text)]">
          Permissões
        </legend>
        <ul className="mt-2 flex flex-col gap-3">
          {PERMISSOES_QUADRO_PADRAO.map(({ key, label, description }) => (
            <li key={key}>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={Boolean(permissoes[key])}
                  onChange={() => togglePermissao(key)}
                  className="mt-1 h-4 w-4 rounded border-[var(--color-border)]"
                />
                <span>
                  <span className="block text-[var(--font-size-sm)] font-medium text-[var(--color-text)]">
                    {label}
                  </span>
                  <span className="mt-0.5 block text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
                    {description}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      {submitError ? (
        <p
          className="rounded-lg border border-[var(--color-danger-border)] bg-[var(--color-danger-surface)] px-3 py-2 text-[var(--font-size-sm)] text-[var(--color-danger-text)]"
          role="alert"
        >
          {submitError}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2">
        {typeof onCancel === "function" ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
        ) : null}
        <Button type="submit" variant="primary" loading={loading}>
          {labelBotao}
        </Button>
      </div>
    </form>
  );
}
