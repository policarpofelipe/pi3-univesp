import { api } from "./authService";

const cartaoComentarioService = {
  async listar(quadroId, cartaoId) {
    if (!quadroId || !cartaoId) {
      throw new Error("Quadro e cartão são obrigatórios.");
    }

    const response = await api.get(
      `/quadros/${quadroId}/cartoes/${cartaoId}/comentarios`
    );
    return response.data;
  },

  async criar(quadroId, cartaoId, payload) {
    if (!quadroId || !cartaoId) {
      throw new Error("Quadro e cartão são obrigatórios.");
    }

    const response = await api.post(
      `/quadros/${quadroId}/cartoes/${cartaoId}/comentarios`,
      payload
    );
    return response.data;
  },

  async remover(quadroId, cartaoId, comentarioId) {
    if (!quadroId || !cartaoId || !comentarioId) {
      throw new Error("Quadro, cartão e comentário são obrigatórios.");
    }

    const response = await api.delete(
      `/quadros/${quadroId}/cartoes/${cartaoId}/comentarios/${comentarioId}`
    );
    return response.data;
  },
};

export default cartaoComentarioService;
