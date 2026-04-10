import { api } from "./authService";

const listaService = {
  async listar(quadroId) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    const response = await api.get(`/quadros/${quadroId}/listas`);
    return response.data;
  },

  async obterPorId(quadroId, listaId) {
    if (!quadroId || !listaId) {
      throw new Error("Quadro e lista são obrigatórios.");
    }

    const response = await api.get(
      `/quadros/${quadroId}/listas/${listaId}`
    );
    return response.data;
  },

  async criar(quadroId, payload) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    const response = await api.post(`/quadros/${quadroId}/listas`, payload);
    return response.data;
  },

  async atualizar(quadroId, listaId, payload) {
    if (!quadroId || !listaId) {
      throw new Error("Quadro e lista são obrigatórios.");
    }

    const response = await api.put(
      `/quadros/${quadroId}/listas/${listaId}`,
      payload
    );
    return response.data;
  },

  async remover(quadroId, listaId) {
    if (!quadroId || !listaId) {
      throw new Error("Quadro e lista são obrigatórios.");
    }

    const response = await api.delete(
      `/quadros/${quadroId}/listas/${listaId}`
    );
    return response.data;
  },

  async reordenar(quadroId, ids) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    if (!Array.isArray(ids)) {
      throw new Error("A nova ordem deve ser um array de ids.");
    }

    const response = await api.patch(
      `/quadros/${quadroId}/listas/reordenar`,
      { ids }
    );
    return response.data;
  },
};

export default listaService;
