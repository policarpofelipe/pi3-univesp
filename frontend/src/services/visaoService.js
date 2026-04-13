import { api } from "./authService";

const visaoService = {
  async listar(quadroId) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    const response = await api.get(`/quadros/${quadroId}/visoes`);
    return response.data;
  },

  async criar(quadroId, payload) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    const response = await api.post(`/quadros/${quadroId}/visoes`, payload);
    return response.data;
  },

  async atualizar(quadroId, visaoId, payload) {
    if (!quadroId || !visaoId) {
      throw new Error("Quadro e visão são obrigatórios.");
    }

    const response = await api.put(
      `/quadros/${quadroId}/visoes/${visaoId}`,
      payload
    );
    return response.data;
  },

  async remover(quadroId, visaoId) {
    if (!quadroId || !visaoId) {
      throw new Error("Quadro e visão são obrigatórios.");
    }

    const response = await api.delete(`/quadros/${quadroId}/visoes/${visaoId}`);
    return response.data;
  },
};

export default visaoService;
