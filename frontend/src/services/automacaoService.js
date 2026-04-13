import { api } from "./authService";

const automacaoService = {
  async listar(quadroId) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }
    const response = await api.get(`/quadros/${quadroId}/automacoes`);
    return response.data;
  },

  async criar(quadroId, payload) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }
    const response = await api.post(`/quadros/${quadroId}/automacoes`, payload);
    return response.data;
  },

  async atualizar(quadroId, automacaoId, payload) {
    if (!quadroId || !automacaoId) {
      throw new Error("Quadro e automação são obrigatórios.");
    }
    const response = await api.put(
      `/quadros/${quadroId}/automacoes/${automacaoId}`,
      payload
    );
    return response.data;
  },

  async remover(quadroId, automacaoId) {
    if (!quadroId || !automacaoId) {
      throw new Error("Quadro e automação são obrigatórios.");
    }
    const response = await api.delete(
      `/quadros/${quadroId}/automacoes/${automacaoId}`
    );
    return response.data;
  },
};

export default automacaoService;
