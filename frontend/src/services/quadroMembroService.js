import { api } from "./authService";

const quadroMembroService = {
  async listar(quadroId, params = {}) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    const response = await api.get(`/quadros/${quadroId}/membros`, {
      params,
    });

    return response.data;
  },

  async obterPorId(quadroId, membroId) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    if (!membroId) {
      throw new Error("O identificador do membro do quadro é obrigatório.");
    }

    const response = await api.get(`/quadros/${quadroId}/membros/${membroId}`);
    return response.data;
  },

  async adicionar(quadroId, payload) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    const response = await api.post(`/quadros/${quadroId}/membros`, payload);
    return response.data;
  },

  async convidar(quadroId, payload) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    const response = await api.post(
      `/quadros/${quadroId}/membros/convites`,
      payload
    );

    return response.data;
  },

  async atualizar(quadroId, membroId, payload) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    if (!membroId) {
      throw new Error("O identificador do membro do quadro é obrigatório.");
    }

    const response = await api.put(
      `/quadros/${quadroId}/membros/${membroId}`,
      payload
    );

    return response.data;
  },

  async atualizarPapel(quadroId, membroId, payload) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    if (!membroId) {
      throw new Error("O identificador do membro do quadro é obrigatório.");
    }

    const response = await api.patch(
      `/quadros/${quadroId}/membros/${membroId}/papel`,
      payload
    );

    return response.data;
  },

  async reenviarConvite(quadroId, membroId) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    if (!membroId) {
      throw new Error("O identificador do membro do quadro é obrigatório.");
    }

    const response = await api.post(
      `/quadros/${quadroId}/membros/${membroId}/reenviar-convite`
    );

    return response.data;
  },

  async remover(quadroId, membroId) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    if (!membroId) {
      throw new Error("O identificador do membro do quadro é obrigatório.");
    }

    const response = await api.delete(
      `/quadros/${quadroId}/membros/${membroId}`
    );

    return response.data;
  },
};

export default quadroMembroService;
