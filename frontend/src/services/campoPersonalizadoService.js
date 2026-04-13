import { api } from "./authService";

const campoPersonalizadoService = {
  async listar(quadroId) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    const response = await api.get(`/quadros/${quadroId}/campos-personalizados`);
    return response.data;
  },

  async criar(quadroId, payload) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    const response = await api.post(
      `/quadros/${quadroId}/campos-personalizados`,
      payload
    );
    return response.data;
  },

  async atualizar(quadroId, campoId, payload) {
    if (!quadroId || !campoId) {
      throw new Error("Quadro e campo são obrigatórios.");
    }

    const response = await api.put(
      `/quadros/${quadroId}/campos-personalizados/${campoId}`,
      payload
    );
    return response.data;
  },

  async remover(quadroId, campoId) {
    if (!quadroId || !campoId) {
      throw new Error("Quadro e campo são obrigatórios.");
    }

    const response = await api.delete(
      `/quadros/${quadroId}/campos-personalizados/${campoId}`
    );
    return response.data;
  },
};

export default campoPersonalizadoService;
