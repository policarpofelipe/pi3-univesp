import { api } from "./authService";

const quadroService = {
  async listar(params = {}) {
    const response = await api.get("/quadros", {
      params,
    });

    return response.data;
  },

  async obterPorId(quadroId) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    const response = await api.get(`/quadros/${quadroId}`);
    return response.data;
  },

  async criar(payload) {
    const response = await api.post("/quadros", payload);
    return response.data;
  },

  async atualizar(quadroId, payload) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    const response = await api.put(`/quadros/${quadroId}`, payload);
    return response.data;
  },

  async remover(quadroId) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    const response = await api.delete(`/quadros/${quadroId}`);
    return response.data;
  },

  async obterConfiguracoes(quadroId) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    const response = await api.get(`/quadros/${quadroId}/configuracoes`);
    return response.data;
  },

  async atualizarConfiguracoes(quadroId, payload) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    const response = await api.put(
      `/quadros/${quadroId}/configuracoes`,
      payload
    );

    return response.data;
  },

  async arquivar(quadroId) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    const response = await api.patch(`/quadros/${quadroId}/arquivar`);
    return response.data;
  },

  async desarquivar(quadroId) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    const response = await api.patch(`/quadros/${quadroId}/desarquivar`);
    return response.data;
  },
};

export default quadroService;