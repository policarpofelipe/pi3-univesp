import { api } from "./authService";

const cartaoCampoValorService = {
  async listar(quadroId, cartaoId) {
    if (!quadroId || !cartaoId) {
      throw new Error("Quadro e cartão são obrigatórios.");
    }
    const response = await api.get(
      `/quadros/${quadroId}/cartoes/${cartaoId}/campos-valores`
    );
    return response.data;
  },

  async definir(quadroId, cartaoId, campoId, payload) {
    if (!quadroId || !cartaoId || !campoId) {
      throw new Error("Quadro, cartão e campo são obrigatórios.");
    }
    const response = await api.put(
      `/quadros/${quadroId}/cartoes/${cartaoId}/campos-valores/${campoId}`,
      payload
    );
    return response.data;
  },
};

export default cartaoCampoValorService;
