import { api } from "./authService";
import { extractList, extractObject } from "../utils/apiData";

async function listarNotificacoes(params = {}) {
  const response = await api.get("/notificacoes", { params });
  return extractList(response.data);
}

async function obterTotalNaoLidas() {
  const response = await api.get("/notificacoes/nao-lidas/total");
  const data = extractObject(response.data);
  return Number(data?.total ?? 0);
}

async function marcarComoLida(notificacaoId) {
  if (!notificacaoId) {
    throw new Error("Identificador da notificação é obrigatório.");
  }
  const response = await api.patch(
    `/notificacoes/${notificacaoId}/lida`
  );
  return response.data;
}

const notificacaoService = {
  listarNotificacoes,
  obterTotalNaoLidas,
  marcarComoLida,
};

export default notificacaoService;
