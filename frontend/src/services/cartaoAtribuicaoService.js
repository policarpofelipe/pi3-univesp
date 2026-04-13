import { api } from "./authService";

function fallback() {
  return {
    success: false,
    message: "Atribuições de cartão ainda não estão disponíveis no backend.",
    data: [],
    featureUnavailable: true,
  };
}

const cartaoAtribuicaoService = {
  async listar(quadroId, cartaoId) {
    if (!quadroId || !cartaoId) {
      throw new Error("Quadro e cartão são obrigatórios.");
    }
    try {
      const response = await api.get(
        `/quadros/${quadroId}/cartoes/${cartaoId}/atribuicoes`
      );
      return response.data;
    } catch (error) {
      if (error?.response?.status === 404) return fallback();
      throw error;
    }
  },

  async adicionar(quadroId, cartaoId, payload) {
    if (!quadroId || !cartaoId) {
      throw new Error("Quadro e cartão são obrigatórios.");
    }
    try {
      const response = await api.post(
        `/quadros/${quadroId}/cartoes/${cartaoId}/atribuicoes`,
        payload
      );
      return response.data;
    } catch (error) {
      if (error?.response?.status === 404) return fallback();
      throw error;
    }
  },

  async remover(quadroId, cartaoId, atribuicaoId) {
    if (!quadroId || !cartaoId || !atribuicaoId) {
      throw new Error("Quadro, cartão e atribuição são obrigatórios.");
    }
    try {
      const response = await api.delete(
        `/quadros/${quadroId}/cartoes/${cartaoId}/atribuicoes/${atribuicaoId}`
      );
      return response.data;
    } catch (error) {
      if (error?.response?.status === 404) return fallback();
      throw error;
    }
  },
};

export default cartaoAtribuicaoService;
