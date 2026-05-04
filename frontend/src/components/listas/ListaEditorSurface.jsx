import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import ListaForm from "./ListaForm";
import listaService from "../../services/listaService";
import { extractObject } from "../../utils/apiData";
import { emitQuadroListasCartoesTagsAtualizados } from "../../utils/quadroSyncEvents";

import LoadingState from "../ui/LoadingState";
import ErrorState from "../ui/ErrorState";
import Button from "../ui/Button";

/**
 * Formulário criar/editar lista + persistência (modal ou página).
 */
export default function ListaEditorSurface({
  modo = "criar",
  listaId: listaIdProp,
  onCancel,
  onSaved,
}) {
  const { quadroId, listaId: listaIdParam } = useParams();
  const listaId = listaIdProp ?? listaIdParam;

  const [loadingLista, setLoadingLista] = useState(modo === "editar");
  const [erroLista, setErroLista] = useState("");
  const [listaEmEdicao, setListaEmEdicao] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const carregarLista = useCallback(async () => {
    if (modo !== "editar" || !quadroId || !listaId) return;
    setLoadingLista(true);
    setErroLista("");
    try {
      const res = await listaService.obterPorId(quadroId, listaId);
      const data = extractObject(res) || res;
      setListaEmEdicao(data);
    } catch (err) {
      setErroLista(
        err?.response?.data?.message ||
          err?.message ||
          "Não foi possível carregar a lista."
      );
      setListaEmEdicao(null);
    } finally {
      setLoadingLista(false);
    }
  }, [modo, quadroId, listaId]);

  useEffect(() => {
    carregarLista();
  }, [carregarLista]);

  const initialValues = useMemo(() => {
    if (!listaEmEdicao) return {};
    return {
      nome: listaEmEdicao.nome,
      descricao: listaEmEdicao.descricao,
      limiteWip: listaEmEdicao.limiteWip,
      cor: listaEmEdicao.cor,
    };
  }, [listaEmEdicao]);

  async function handleSubmit(payload) {
    if (!quadroId) return;
    setSalvando(true);
    try {
      if (modo === "criar") {
        await listaService.criar(quadroId, payload);
      } else if (listaId) {
        await listaService.atualizar(quadroId, listaId, payload);
      }
      emitQuadroListasCartoesTagsAtualizados(quadroId);
      onSaved?.();
    } catch (err) {
      throw err;
    } finally {
      setSalvando(false);
    }
  }

  if (modo === "editar" && loadingLista) {
    return <LoadingState title="Carregando lista" />;
  }

  if (modo === "editar" && (erroLista || !listaEmEdicao)) {
    return (
      <ErrorState
        title="Não foi possível abrir a lista"
        description={erroLista || "Lista não encontrada."}
        action={
          <Button type="button" variant="primary" onClick={onCancel}>
            Voltar
          </Button>
        }
      />
    );
  }

  return (
    <ListaForm
      modo={modo === "criar" ? "criar" : "editar"}
      initialValues={initialValues}
      loading={salvando}
      onCancel={onCancel}
      onSubmit={handleSubmit}
    />
  );
}
