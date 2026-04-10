import React, { useCallback, useEffect, useState } from "react";
import { MessageCircle, Trash2 } from "lucide-react";

import Button from "../ui/Button";
import cartaoComentarioService from "../../services/cartaoComentarioService";
import { extractList, extractObject } from "../../utils/apiData";

function formatarDataHora(iso) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function CartaoComentarios({
  quadroId,
  cartaoId,
  usuarioId = "",
  onHistoricoMudou,
}) {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState("");
  const [removendoId, setRemovendoId] = useState(null);

  const carregar = useCallback(async () => {
    if (!quadroId || !cartaoId) return;
    setLoading(true);
    try {
      const res = await cartaoComentarioService.listar(quadroId, cartaoId);
      setItens(extractList(res));
    } catch {
      setItens([]);
    } finally {
      setLoading(false);
    }
  }, [quadroId, cartaoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleEnviar(event) {
    event.preventDefault();
    const t = texto.trim();
    if (!t || enviando) return;

    setErroEnvio("");
    setEnviando(true);
    try {
      const res = await cartaoComentarioService.criar(quadroId, cartaoId, {
        texto: t,
      });
      const novo = extractObject(res) || res;
      if (novo?.id) {
        setItens((prev) => [...prev, novo]);
      } else {
        await carregar();
      }
      setTexto("");
      onHistoricoMudou?.();
    } catch (err) {
      setErroEnvio(
        err?.response?.data?.message ||
          err?.message ||
          "Não foi possível enviar o comentário."
      );
    } finally {
      setEnviando(false);
    }
  }

  async function handleRemover(comentario) {
    if (!window.confirm("Remover este comentário?")) return;
    setRemovendoId(comentario.id);
    try {
      await cartaoComentarioService.remover(
        quadroId,
        cartaoId,
        comentario.id
      );
      setItens((prev) => prev.filter((c) => c.id !== comentario.id));
      onHistoricoMudou?.();
    } catch {
      await carregar();
    } finally {
      setRemovendoId(null);
    }
  }

  const uid = usuarioId != null ? String(usuarioId) : "";

  return (
    <section
      className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-xs)]"
      aria-labelledby="cartao-comentarios-titulo"
    >
      <div className="flex items-center gap-2">
        <MessageCircle
          size={20}
          className="text-[var(--color-text-muted)]"
          aria-hidden="true"
        />
        <h2
          id="cartao-comentarios-titulo"
          className="text-[var(--font-size-heading-3)] font-semibold text-[var(--color-text)]"
        >
          Comentários
        </h2>
      </div>

      {loading ? (
        <p className="mt-4 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
          Carregando comentários…
        </p>
      ) : itens.length === 0 ? (
        <p className="mt-4 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
          Nenhum comentário ainda. Seja o primeiro a comentar.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {itens.map((c) => {
            const podeExcluir =
              uid && String(c.autorId || "") === uid;
            return (
              <li
                key={c.id}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[var(--font-size-xs)] font-medium text-[var(--color-text)]">
                      {c.autorNome || "Usuário"}
                      <span className="ml-2 font-normal text-[var(--color-text-soft)]">
                        · {formatarDataHora(c.criadoEm)}
                      </span>
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
                      {c.texto}
                    </p>
                  </div>
                  {podeExcluir ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      loading={removendoId === c.id}
                      disabled={removendoId != null}
                      leftIcon={<Trash2 size={14} />}
                      onClick={() => handleRemover(c)}
                      aria-label="Remover comentário"
                    />
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form className="mt-6 flex flex-col gap-2" onSubmit={handleEnviar}>
        <label
          htmlFor="cartao-novo-comentario"
          className="text-[var(--font-size-sm)] font-medium text-[var(--color-text)]"
        >
          Novo comentário
        </label>
        <textarea
          id="cartao-novo-comentario"
          rows={3}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          disabled={enviando}
          placeholder="Escreva um comentário…"
          className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-[var(--font-size-sm)]"
        />
        {erroEnvio ? (
          <p
            className="text-[var(--font-size-xs)] text-[var(--color-danger-text)]"
            role="alert"
          >
            {erroEnvio}
          </p>
        ) : null}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            loading={enviando}
            disabled={!texto.trim()}
          >
            Publicar
          </Button>
        </div>
      </form>
    </section>
  );
}
