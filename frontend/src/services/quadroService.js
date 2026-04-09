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

  async obterPreferenciasUsuario(quadroId, usuarioId) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    if (!usuarioId) {
      throw new Error("O identificador do usuário é obrigatório.");
    }

    const response = await api.get(
      `/quadros/${quadroId}/preferencias/${usuarioId}`
    );

    return response.data;
  },

  async atualizarPreferenciasUsuario(quadroId, usuarioId, payload) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    if (!usuarioId) {
      throw new Error("O identificador do usuário é obrigatório.");
    }

    const response = await api.put(
      `/quadros/${quadroId}/preferencias/${usuarioId}`,
      payload
    );

    return response.data;
  },
};

export default quadroService;
