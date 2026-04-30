import React, { useState } from "react";
import Button from "../ui/Button";

export default function TagForm({
  loading = false,
  onSubmit,
  onCancel = null,
  submitLabel = "Criar tag",
}) {
  const [nome, setNome] = useState("");
  const [cor, setCor] = useState("#64748b");
  const [erro, setErro] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");
    const n = nome.trim();
    if (!n) {
      setErro("Informe o nome da tag.");
      return;
    }
    try {
      if (typeof onSubmit === "function") {
        await onSubmit({ nome: n, cor });
      }
      setNome("");
      setCor("#64748b");
    } catch (err) {
      setErro(
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
          err?.message ||
          "Não foi possível salvar a tag."
      );
    }
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit} noValidate>
      <div>
        <label
          htmlFor="tag-form-nome"
          className="mb-1 block text-[var(--font-size-xs)] font-medium text-[var(--color-text)]"
        >
          Nome
        </label>
        <input
          id="tag-form-nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          disabled={loading}
          className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
        />
      </div>
      <div>
        <label
          htmlFor="tag-form-cor"
          className="mb-1 block text-[var(--font-size-xs)] font-medium text-[var(--color-text)]"
        >
          Cor (#RRGGBB)
        </label>
        <input
          id="tag-form-cor"
          type="color"
          value={cor.length === 7 ? cor : "#64748b"}
          onChange={(e) => setCor(e.target.value)}
          disabled={loading}
          className="h-10 w-full max-w-[5rem] cursor-pointer rounded border border-[var(--input-border)] bg-[var(--input-bg)]"
        />
      </div>
      {erro ? (
        <p className="text-[var(--font-size-xs)] text-[var(--color-danger-text)]" role="alert">
          {erro}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {typeof onCancel === "function" ? (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
        <Button type="submit" variant="primary" size="sm" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
