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

  async listarMembros(quadroId, params = {}) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    const response = await api.get(`/quadros/${quadroId}/membros`, {
      params,
    });

    return response.data;
  },

  async adicionarMembro(quadroId, payload) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    const response = await api.post(`/quadros/${quadroId}/membros`, payload);
    return response.data;
  },

  async atualizarMembro(quadroId, membroId, payload) {
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

  async removerMembro(quadroId, membroId) {
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

  async listarPapeis(quadroId) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    const response = await api.get(`/quadros/${quadroId}/papeis`);
    return response.data;
  },

  async criarPapel(quadroId, payload) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    const response = await api.post(`/quadros/${quadroId}/papeis`, payload);
    return response.data;
  },

  async atualizarPapel(quadroId, papelId, payload) {
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

  async removerPapel(quadroId, papelId) {
    if (!quadroId) {
      throw new Error("O identificador do quadro é obrigatório.");
    }

    if (!papelId) {
      throw new Error("O identificador do papel é obrigatório.");
    }

    const response = await api.delete(`/quadros/${quadroId}/papeis/${papelId}`);
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