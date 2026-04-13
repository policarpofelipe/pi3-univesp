import { api } from "./authService";

const listaTransicaoService = {
  async listar(quadroId, listaId) {
    if (!quadroId || !listaId) {
      throw new Error("Quadro e lista são obrigatórios.");
    }

    const response = await api.get(
      `/quadros/${quadroId}/listas/${listaId}/transicoes`
    );
    return response.data;
  },

  async criar(quadroId, listaId, payload) {
    if (!quadroId || !listaId) {
      throw new Error("Quadro e lista são obrigatórios.");
    }

    const response = await api.post(
      `/quadros/${quadroId}/listas/${listaId}/transicoes`,
      payload
    );
    return response.data;
  },

  async remover(quadroId, listaId, regraId) {
    if (!quadroId || !listaId || !regraId) {
      throw new Error("Quadro, lista e regra são obrigatórios.");
    }

    const response = await api.delete(
      `/quadros/${quadroId}/listas/${listaId}/transicoes/${regraId}`
    );
    return response.data;
  },
};

export default listaTransicaoService;
