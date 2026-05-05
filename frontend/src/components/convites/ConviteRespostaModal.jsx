import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

import Button from "../ui/Button";
import conviteService from "../../services/conviteService";

import "../../styles/components/convite-resposta-modal.css";

function statusMensagem(status) {
  const s = String(status || "").toLowerCase();
  if (s === "aceito") return "Este convite já foi aceito.";
  if (s === "recusado") return "Este convite foi recusado.";
  if (s === "cancelado") return "Este convite foi cancelado.";
  if (s === "expirado") return "Este convite expirou.";
  return "";
}

export default function ConviteRespostaModal({
  conviteId,
  aberto,
  onClose,
  onRespondido,
}) {
  const navigate = useNavigate();
  const titleId = useId();
  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);

  const [detalhe, setDetalhe] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [processando, setProcessando] = useState(false);
  const [sucesso, setSucesso] = useState("");
  const [quadroIdPosAceite, setQuadroIdPosAceite] = useState(null);

  const carregar = useCallback(async () => {
    if (!conviteId || !aberto) return;
    setCarregando(true);
    setErro("");
    setSucesso("");
    setQuadroIdPosAceite(null);
    setDetalhe(null);
    try {
      const data = await conviteService.obterConvite(conviteId);
      setDetalhe(data);
    } catch (e) {
      setErro(
        e?.response?.data?.message ||
          e?.message ||
          "Não foi possível carregar o convite."
      );
    } finally {
      setCarregando(false);
    }
  }, [conviteId, aberto]);

  useEffect(() => {
    if (!aberto) return;
    carregar();
  }, [aberto, carregar]);

  useEffect(() => {
    if (!aberto) return undefined;
    previouslyFocused.current = document.activeElement;
    const t = window.setTimeout(() => {
      dialogRef.current?.querySelector("[data-focus-first]")?.focus();
    }, 50);
    return () => {
      window.clearTimeout(t);
      previouslyFocused.current?.focus?.();
    };
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return undefined;
    function onKey(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!processando) onClose?.();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [aberto, onClose, processando]);

  async function handleAceitar() {
    if (!conviteId) return;
    setProcessando(true);
    setErro("");
    setSucesso("");
    try {
      const res = await conviteService.aceitarConvite(conviteId);
      const qId = res?.data?.quadroId;
      setQuadroIdPosAceite(qId || null);
      setSucesso("Convite aceito com sucesso.");
      await onRespondido?.();
      if (detalhe) {
        setDetalhe({ ...detalhe, status: "aceito" });
      }
    } catch (e) {
      setErro(
        e?.response?.data?.message ||
          e?.message ||
          "Não foi possível aceitar o convite."
      );
    } finally {
      setProcessando(false);
    }
  }

  async function handleRecusar() {
    if (!conviteId) return;
    setProcessando(true);
    setErro("");
    setSucesso("");
    try {
      await conviteService.recusarConvite(conviteId);
      setSucesso("Convite recusado.");
      await onRespondido?.();
      if (detalhe) {
        setDetalhe({ ...detalhe, status: "recusado" });
      }
    } catch (e) {
      setErro(
        e?.response?.data?.message ||
          e?.message ||
          "Não foi possível recusar o convite."
      );
    } finally {
      setProcessando(false);
    }
  }

  if (!aberto) return null;

  const pendente = String(detalhe?.status || "").toLowerCase() === "pendente";
  const msgStatus = detalhe ? statusMensagem(detalhe.status) : "";

  return createPortal(
    <div
      className="convite-resposta-modal__overlay"
      role="presentation"
      onClick={() => !processando && onClose?.()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="convite-resposta-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} tabIndex={-1} data-focus-first className="convite-resposta-modal__title">
          Convite para quadro
        </h2>

        {carregando ? (
          <p className="convite-resposta-modal__loading" aria-live="polite">
            Carregando detalhes do convite…
          </p>
        ) : null}

        {erro ? (
          <p className="convite-resposta-modal__erro" role="alert">
            {erro}
          </p>
        ) : null}

        {sucesso ? (
          <p className="convite-resposta-modal__sucesso" aria-live="polite">
            {sucesso}
          </p>
        ) : null}

        {!carregando && detalhe ? (
          <div className="convite-resposta-modal__corpo">
            <p>
              Você foi convidado para participar do quadro{" "}
              <strong>{detalhe.quadro?.nome || "—"}</strong>.
            </p>

            {detalhe.convidadoPor ? (
              <p>
                <span className="convite-resposta-modal__label">Convidado por:</span>{" "}
                {detalhe.convidadoPor.nomeExibicao || detalhe.convidadoPor.email}
              </p>
            ) : null}

            {Array.isArray(detalhe.papeis) && detalhe.papeis.length ? (
              <div>
                <p className="convite-resposta-modal__label">Papéis propostos</p>
                <ul className="convite-resposta-modal__lista-papeis">
                  {detalhe.papeis.map((p) => (
                    <li key={p.id}>{p.nome}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {detalhe.mensagem ? (
              <p>
                <span className="convite-resposta-modal__label">Mensagem:</span>{" "}
                {detalhe.mensagem}
              </p>
            ) : null}

            <p>
              <span className="convite-resposta-modal__label">Status:</span>{" "}
              {detalhe.status}
            </p>

            {!pendente && msgStatus ? (
              <p className="convite-resposta-modal__info-status">{msgStatus}</p>
            ) : null}
          </div>
        ) : null}

        <div className="convite-resposta-modal__acoes">
          {pendente && !carregando && detalhe ? (
            <>
              <Button
                type="button"
                variant="primary"
                loading={processando}
                disabled={processando}
                onClick={handleAceitar}
              >
                {processando ? "Processando…" : "Aceitar convite"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={processando}
                onClick={handleRecusar}
              >
                Recusar
              </Button>
            </>
          ) : null}

          {quadroIdPosAceite ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                navigate(`/quadros/${quadroIdPosAceite}`);
                onClose?.();
              }}
            >
              Abrir quadro
            </Button>
          ) : null}

          <Button type="button" variant="ghost" disabled={processando} onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
