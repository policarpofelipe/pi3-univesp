import { api } from "./authService";

const tagService = {
  async listar(quadroId) {
    if (!quadroId) {
      throw new Error("O quadro é obrigatório.");
    }
    const response = await api.get(`/quadros/${quadroId}/tags`);
    return response.data;
  },

  async criar(quadroId, payload) {
    if (!quadroId) {
      throw new Error("O quadro é obrigatório.");
    }
    const response = await api.post(`/quadros/${quadroId}/tags`, payload);
    return response.data;
  },

  async remover(quadroId, tagId) {
    if (!quadroId || !tagId) {
      throw new Error("Quadro e tag são obrigatórios.");
    }
    const response = await api.delete(`/quadros/${quadroId}/tags/${tagId}`);
    return response.data;
  },
};

export default tagService;
