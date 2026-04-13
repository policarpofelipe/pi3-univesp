import { api } from "./authService";

function fallback() {
  return {
    success: false,
    message: "Relações entre cartões ainda não estão disponíveis no backend.",
    data: [],
    featureUnavailable: true,
  };
}

const cartaoRelacaoService = {
  async listar(quadroId, cartaoId) {
    if (!quadroId || !cartaoId) {
      throw new Error("Quadro e cartão são obrigatórios.");
    }
    try {
      const response = await api.get(
        `/quadros/${quadroId}/cartoes/${cartaoId}/relacoes`
      );
      return response.data;
    } catch (error) {
      if (error?.response?.status === 404) return fallback();
      throw error;
    }
  },

  async criar(quadroId, cartaoId, payload) {
    if (!quadroId || !cartaoId) {
      throw new Error("Quadro e cartão são obrigatórios.");
    }
    try {
      const response = await api.post(
        `/quadros/${quadroId}/cartoes/${cartaoId}/relacoes`,
        payload
      );
      return response.data;
    } catch (error) {
      if (error?.response?.status === 404) return fallback();
      throw error;
    }
  },

  async remover(quadroId, cartaoId, relacaoId) {
    if (!quadroId || !cartaoId || !relacaoId) {
      throw new Error("Quadro, cartão e relação são obrigatórios.");
    }
    try {
      const response = await api.delete(
        `/quadros/${quadroId}/cartoes/${cartaoId}/relacoes/${relacaoId}`
      );
      return response.data;
    } catch (error) {
      if (error?.response?.status === 404) return fallback();
      throw error;
    }
  },
};

export default cartaoRelacaoService;
