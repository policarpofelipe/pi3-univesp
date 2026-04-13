import { api } from "./authService";

const cartaoAtribuicaoService = {
  async listar(quadroId, cartaoId) {
    if (!quadroId || !cartaoId) {
      throw new Error("Quadro e cartão são obrigatórios.");
    }
    const response = await api.get(
      `/quadros/${quadroId}/cartoes/${cartaoId}/atribuicoes`
    );
    return response.data;
  },

  async adicionar(quadroId, cartaoId, payload) {
    if (!quadroId || !cartaoId) {
      throw new Error("Quadro e cartão são obrigatórios.");
    }
    const response = await api.post(
      `/quadros/${quadroId}/cartoes/${cartaoId}/atribuicoes`,
      payload
    );
    return response.data;
  },

  async remover(quadroId, cartaoId, usuarioId) {
    if (!quadroId || !cartaoId || !usuarioId) {
      throw new Error("Quadro, cartão e atribuição são obrigatórios.");
    }
    const response = await api.delete(
      `/quadros/${quadroId}/cartoes/${cartaoId}/atribuicoes/${usuarioId}`
    );
    return response.data;
  },
};

export default cartaoAtribuicaoService;
