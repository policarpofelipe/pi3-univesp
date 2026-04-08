import { api } from "./authService";

const quadroPapelService = {
  async listar(quadroId) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    const response = await api.get(`/quadros/${quadroId}/papeis`);
    return response.data;
  },

  async obterPorId(quadroId, papelId) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    if (!papelId) {
      throw new Error("O identificador do papel é obrigatório.");
    }

    const response = await api.get(
      `/quadros/${quadroId}/papeis/${papelId}`
    );

    return response.data;
  },

  async criar(quadroId, payload) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    const response = await api.post(
      `/quadros/${quadroId}/papeis`,
      payload
    );

    return response.data;
  },

  async atualizar(quadroId, papelId, payload) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    if (!papelId) {
      throw new Error("O identificador do papel é obrigatório.");
    }

    const response = await api.put(
      `/quadros/${quadroId}/papeis/${papelId}`,
      payload
    );

    return response.data;
  },

  async atualizarPermissoes(quadroId, papelId, permissoes) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    if (!papelId) {
      throw new Error("O identificador do papel é obrigatório.");
    }

    const response = await api.patch(
      `/quadros/${quadroId}/papeis/${papelId}/permissoes`,
      { permissoes }
    );

    return response.data;
  },

  async remover(quadroId, papelId) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    if (!papelId) {
      throw new Error("O identificador do papel é obrigatório.");
    }

    const response = await api.delete(
      `/quadros/${quadroId}/papeis/${papelId}`
    );

    return response.data;
  },
};

export default quadroPapelService;
