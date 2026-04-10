import { api } from "./authService";

const base = (quadroId, cartaoId) =>
  `/quadros/${quadroId}/cartoes/${cartaoId}/anexos`;

const cartaoAnexoService = {
  async listar(quadroId, cartaoId) {
    if (!quadroId || !cartaoId) {
      throw new Error("Quadro e cartão são obrigatórios.");
    }
    const response = await api.get(base(quadroId, cartaoId));
    return response.data;
  },

  async obter(quadroId, cartaoId, anexoId) {
    if (!quadroId || !cartaoId || !anexoId) {
      throw new Error("Identificadores incompletos.");
    }
    const response = await api.get(`${base(quadroId, cartaoId)}/${anexoId}`);
    return response.data;
  },

  async criar(quadroId, cartaoId, payload) {
    if (!quadroId || !cartaoId) {
      throw new Error("Quadro e cartão são obrigatórios.");
    }
    const response = await api.post(base(quadroId, cartaoId), payload);
    return response.data;
  },

  async remover(quadroId, cartaoId, anexoId) {
    if (!quadroId || !cartaoId || !anexoId) {
      throw new Error("Identificadores incompletos.");
    }
    const response = await api.delete(`${base(quadroId, cartaoId)}/${anexoId}`);
    return response.data;
  },
};

export default cartaoAnexoService;
