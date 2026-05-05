import { api } from "./authService";
import { extractList, extractObject } from "../utils/apiData";

async function criarConviteQuadro(quadroId, payload) {
  if (!quadroId) {
    throw new Error("O identificador do quadro é obrigatório.");
  }
  const response = await api.post(`/quadros/${quadroId}/convites`, payload);
  return response.data;
}

async function obterConvite(conviteId) {
  if (!conviteId) {
    throw new Error("O identificador do convite é obrigatório.");
  }
  const response = await api.get(`/convites/${conviteId}`);
  return extractObject(response.data);
}

async function aceitarConvite(conviteId) {
  if (!conviteId) {
    throw new Error("O identificador do convite é obrigatório.");
  }
  const response = await api.post(`/convites/${conviteId}/aceitar`);
  return response.data;
}

async function recusarConvite(conviteId) {
  if (!conviteId) {
    throw new Error("O identificador do convite é obrigatório.");
  }
  const response = await api.post(`/convites/${conviteId}/recusar`);
  return response.data;
}

async function listarConvitesPendentes() {
  const response = await api.get("/convites/pendentes");
  return extractList(response.data);
}

async function listarConvitesQuadro(quadroId, params = {}) {
  if (!quadroId) {
    throw new Error("O identificador do quadro é obrigatório.");
  }
  const response = await api.get(`/quadros/${quadroId}/convites`, { params });
  return extractList(response.data);
}

async function reenviarConviteQuadro(quadroId, conviteId) {
  if (!quadroId || !conviteId) {
    throw new Error("Quadro e convite são obrigatórios.");
  }
  const response = await api.post(`/quadros/${quadroId}/convites/${conviteId}/reenviar`);
  return response.data;
}

async function removerConviteQuadro(quadroId, conviteId) {
  if (!quadroId || !conviteId) {
    throw new Error("Quadro e convite são obrigatórios.");
  }
  const response = await api.delete(`/quadros/${quadroId}/convites/${conviteId}`);
  return response.data;
}

const conviteService = {
  criarConviteQuadro,
  obterConvite,
  aceitarConvite,
  recusarConvite,
  listarConvitesPendentes,
  listarConvitesQuadro,
  reenviarConviteQuadro,
  removerConviteQuadro,
};

export default conviteService;
