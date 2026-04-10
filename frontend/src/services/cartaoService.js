import { api } from "./authService";

const cartaoService = {
  async listar(quadroId, params = {}) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    const response = await api.get(`/quadros/${quadroId}/cartoes`, {
      params,
    });
    return response.data;
  },

  async obterPorId(quadroId, cartaoId) {
    if (!quadroId || !cartaoId) {
      throw new Error("Quadro e cartão são obrigatórios.");
    }

    const response = await api.get(
      `/quadros/${quadroId}/cartoes/${cartaoId}`
    );
    return response.data;
  },

  async criar(quadroId, payload) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    const response = await api.post(`/quadros/${quadroId}/cartoes`, payload);
    return response.data;
  },

  async atualizar(quadroId, cartaoId, payload) {
    if (!quadroId || !cartaoId) {
      throw new Error("Quadro e cartão são obrigatórios.");
    }

    const response = await api.put(
      `/quadros/${quadroId}/cartoes/${cartaoId}`,
      payload
    );
    return response.data;
  },

  async mover(quadroId, cartaoId, payload) {
    if (!quadroId || !cartaoId) {
      throw new Error("Quadro e cartão são obrigatórios.");
    }

    const response = await api.patch(
      `/quadros/${quadroId}/cartoes/${cartaoId}/mover`,
      payload
    );
    return response.data;
  },

  async remover(quadroId, cartaoId) {
    if (!quadroId || !cartaoId) {
      throw new Error("Quadro e cartão são obrigatórios.");
    }

    const response = await api.delete(
      `/quadros/${quadroId}/cartoes/${cartaoId}`
    );
    return response.data;
  },
};

export default cartaoService;
