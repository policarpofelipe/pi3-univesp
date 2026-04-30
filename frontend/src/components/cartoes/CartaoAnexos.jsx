import React, { useCallback, useEffect, useRef, useState } from "react";
import { Download, Paperclip, Trash2 } from "lucide-react";

import Button from "../ui/Button";
import cartaoAnexoService from "../../services/cartaoAnexoService";
import { extractList, extractObject } from "../../utils/apiData";

const MAX_BYTES = 5 * 1024 * 1024;

function formatarTamanho(bytes) {
  if (bytes == null || Number.isNaN(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function dataUrlParaBase64Puro(dataUrl) {
  const s = String(dataUrl);
  const i = s.indexOf("base64,");
  if (i === -1) {
    return s.replace(/\s/g, "");
  }
  return s.slice(i + "base64,".length).replace(/\s/g, "");
}

function mimeDeDataUrl(dataUrl) {
  const s = String(dataUrl);
  const m = s.match(/^data:([^;]+);base64,/);
  return m ? m[1] : "application/octet-stream";
}

export default function CartaoAnexos({
  quadroId,
  cartaoId,
  onHistoricoMudou,
}) {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [baixandoId, setBaixandoId] = useState(null);
  const [removendoId, setRemovendoId] = useState(null);
  const [dragAtivo, setDragAtivo] = useState(false);
  const inputRef = useRef(null);

  const carregar = useCallback(async () => {
    if (!quadroId || !cartaoId) return;
    setLoading(true);
    try {
      const res = await cartaoAnexoService.listar(quadroId, cartaoId);
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

  async function enviarArquivo(file) {
    if (!file) return;

    setErro("");
    if (file.size > MAX_BYTES) {
      setErro(`O arquivo ultrapassa ${MAX_BYTES / (1024 * 1024)} MB.`);
      return;
    }

    setEnviando(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = () => reject(new Error("Falha ao ler o arquivo."));
        r.readAsDataURL(file);
      });

      const dadosBase64 = dataUrlParaBase64Puro(dataUrl);
      const tipoMime = file.type || mimeDeDataUrl(dataUrl);

      await cartaoAnexoService.criar(quadroId, cartaoId, {
        nomeArquivo: file.name,
        tipoMime,
        dadosBase64,
      });
      await carregar();
      onHistoricoMudou?.();
    } catch (err) {
      setErro(
        err?.response?.data?.message ||
          err?.message ||
          "Não foi possível enviar o anexo."
      );
    } finally {
      setEnviando(false);
    }
  }

  async function handleArquivo(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    await enviarArquivo(file);
  }

  async function handleBaixar(anexo) {
    setBaixandoId(anexo.id);
    setErro("");
    try {
      const res = await cartaoAnexoService.obter(quadroId, cartaoId, anexo.id);
      const data = extractObject(res) || res;
      const b64 = data?.dadosBase64;
      if (!b64) {
        setErro("Conteúdo do anexo indisponível.");
        return;
      }
      const mime = data.tipoMime || "application/octet-stream";
      const blob = await fetch(`data:${mime};base64,${b64}`).then((r) =>
        r.blob()
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.nomeArquivo || anexo.nomeArquivo || "anexo";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setErro(
        err?.response?.data?.message ||
          err?.message ||
          "Não foi possível baixar o anexo."
      );
    } finally {
      setBaixandoId(null);
    }
  }

  async function handleRemover(anexo) {
    if (!window.confirm(`Remover o anexo "${anexo.nomeArquivo}"?`)) return;
    setRemovendoId(anexo.id);
    try {
      await cartaoAnexoService.remover(quadroId, cartaoId, anexo.id);
      await carregar();
      onHistoricoMudou?.();
    } catch {
      await carregar();
    } finally {
      setRemovendoId(null);
    }
  }

  return (
    <section
      className="card-section"
      aria-labelledby="cartao-anexos-titulo"
    >
      <div className="card-section__header">
        <div className="card-section__title">
          <Paperclip
            size={16}
            aria-hidden="true"
          />
          <h2 id="cartao-anexos-titulo">Anexos</h2>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            accept="*/*"
            onChange={handleArquivo}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={enviando}
            disabled={enviando}
            onClick={() => inputRef.current?.click()}
          >
            Enviar arquivo
          </Button>
        </div>
      </div>

      <p className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
        Limite de {MAX_BYTES / (1024 * 1024)} MB por arquivo (armazenamento em
        memória; reinicia com o servidor).
      </p>

      <button
        type="button"
        className={[
          "cartao-anexos__dropzone",
          dragAtivo ? "cartao-anexos__dropzone--active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragAtivo(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragAtivo(false);
        }}
        onDrop={async (event) => {
          event.preventDefault();
          setDragAtivo(false);
          const file = event.dataTransfer?.files?.[0];
          await enviarArquivo(file);
        }}
      >
        Arraste arquivos ou clique para enviar
      </button>

      {erro ? (
        <p className="mt-2 text-[var(--font-size-sm)] text-[var(--color-danger-text)]" role="alert">
          {erro}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-4 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
          Carregando anexos…
        </p>
      ) : itens.length === 0 ? (
        <p className="mt-4 text-[var(--font-size-sm)] text-[var(--color-text-muted)]">
          Nenhum anexo. Envie um arquivo acima.
        </p>
      ) : (
        <ul className="cartao-anexos__list flex flex-col gap-2">
          {itens.map((a) => (
            <li
              key={a.id}
              className="cartao-anexos__item rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[var(--font-size-sm)] font-medium text-[var(--color-text)]">
                  {a.nomeArquivo}
                </p>
                <p className="text-[var(--font-size-xs)] text-[var(--color-text-muted)]">
                  {formatarTamanho(a.tamanhoBytes)} · {a.tipoMime}
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  loading={baixandoId === a.id}
                  disabled={baixandoId != null || removendoId != null}
                  leftIcon={<Download size={14} />}
                  onClick={() => handleBaixar(a)}
                >
                  Baixar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  loading={removendoId === a.id}
                  disabled={removendoId != null || baixandoId != null}
                  leftIcon={<Trash2 size={14} />}
                  onClick={() => handleRemover(a)}
                >
                  Excluir
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
