import { useCallback, useEffect, useRef, useState } from "react";

export default function useCartaoModal({
  cartao,
  onSaveTituloDescricao,
  debounceMs = 500,
}) {
  const [tituloDraft, setTituloDraft] = useState("");
  const [descricaoDraft, setDescricaoDraft] = useState("");
  const [editandoTitulo, setEditandoTitulo] = useState(false);
  const [editandoDescricao, setEditandoDescricao] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setTituloDraft(cartao?.titulo || "");
    setDescricaoDraft(cartao?.descricao || "");
  }, [cartao?.id, cartao?.titulo, cartao?.descricao]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const agendarSalvar = useCallback(
    ({ titulo, descricao }) => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => {
        onSaveTituloDescricao?.({
          titulo,
          descricao,
        });
      }, debounceMs);
    },
    [debounceMs, onSaveTituloDescricao]
  );

  return {
    tituloDraft,
    setTituloDraft,
    descricaoDraft,
    setDescricaoDraft,
    editandoTitulo,
    setEditandoTitulo,
    editandoDescricao,
    setEditandoDescricao,
    agendarSalvar,
  };
}
