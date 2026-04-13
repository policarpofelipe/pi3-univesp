import { api } from "./authService";

const cartaoRelacaoService = {
  async listar(quadroId, cartaoId) {
    if (!quadroId || !cartaoId) {
      throw new Error("Quadro e cartão são obrigatórios.");
    }
    const response = await api.get(
      `/quadros/${quadroId}/cartoes/${cartaoId}/relacoes`
    );
    return response.data;
  },

  async criar(quadroId, cartaoId, payload) {
    if (!quadroId || !cartaoId) {
      throw new Error("Quadro e cartão são obrigatórios.");
    }
    const response = await api.post(
      `/quadros/${quadroId}/cartoes/${cartaoId}/relacoes`,
      payload
    );
    return response.data;
  },

  async remover(quadroId, cartaoId, relacaoId) {
    if (!quadroId || !cartaoId || !relacaoId) {
      throw new Error("Quadro, cartão e relação são obrigatórios.");
    }
    const response = await api.delete(
      `/quadros/${quadroId}/cartoes/${cartaoId}/relacoes/${relacaoId}`
    );
    return response.data;
  },
};

export default cartaoRelacaoService;
