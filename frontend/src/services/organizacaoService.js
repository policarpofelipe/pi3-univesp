import { api } from "./authService";

const organizacaoService = {
  async listar(params = {}, axiosConfig = {}) {
    const response = await api.get("/organizacoes", {
      params,
      ...axiosConfig,
    });

    return response.data;
  },

  async buscarPorId(organizacaoId) {
    if (!organizacaoId) {
      throw new Error("O identificador da organização é obrigatório.");
    }

    const response = await api.get(`/organizacoes/${organizacaoId}`);
    return response.data;
  },

  async criar(payload) {
    const response = await api.post("/organizacoes", payload);
    return response.data;
  },

  async atualizar(organizacaoId, payload) {
    if (!organizacaoId) {
      throw new Error("O identificador da organização é obrigatório.");
    }

    const response = await api.put(`/organizacoes/${organizacaoId}`, payload);
    return response.data;
  },

  async remover(organizacaoId) {
    if (!organizacaoId) {
      throw new Error("O identificador da organização é obrigatório.");
    }

    const response = await api.delete(`/organizacoes/${organizacaoId}`);
    return response.data;
  },

  async buscarConfiguracoes(organizacaoId) {
    if (!organizacaoId) {
      throw new Error("O identificador da organização é obrigatório.");
    }

    const response = await api.get(
      `/organizacoes/${organizacaoId}/configuracoes`
    );

    return response.data;
  },

  async atualizarConfiguracoes(organizacaoId, payload) {
    if (!organizacaoId) {
      throw new Error("O identificador da organização é obrigatório.");
    }

    const response = await api.put(
      `/organizacoes/${organizacaoId}/configuracoes`,
      payload
    );

    return response.data;
  },

  async listarMembros(organizacaoId, params = {}) {
    if (!organizacaoId) {
      throw new Error("O identificador da organização é obrigatório.");
    }

    const response = await api.get(
      `/organizacoes/${organizacaoId}/membros`,
      {
        params,
      }
    );

    return response.data;
  },

  async buscarMembroPorId(organizacaoId, membroId) {
    if (!organizacaoId) {
      throw new Error("O identificador da organização é obrigatório.");
    }

    if (!membroId) {
      throw new Error("O identificador do membro é obrigatório.");
    }

    const response = await api.get(
      `/organizacoes/${organizacaoId}/membros/${membroId}`
    );

    return response.data;
  },

  async convidarMembro(organizacaoId, payload) {
    if (!organizacaoId) {
      throw new Error("O identificador da organização é obrigatório.");
    }

    const response = await api.post(
      `/organizacoes/${organizacaoId}/membros`,
      payload
    );

    return response.data;
  },

  async atualizarMembro(organizacaoId, membroId, payload) {
    if (!organizacaoId) {
      throw new Error("O identificador da organização é obrigatório.");
    }

    if (!membroId) {
      throw new Error("O identificador do membro é obrigatório.");
    }

    const response = await api.put(
      `/organizacoes/${organizacaoId}/membros/${membroId}`,
      payload
    );

    return response.data;
  },

  async removerMembro(organizacaoId, membroId) {
    if (!organizacaoId) {
      throw new Error("O identificador da organização é obrigatório.");
    }

    if (!membroId) {
      throw new Error("O identificador do membro é obrigatório.");
    }

    const response = await api.delete(
      `/organizacoes/${organizacaoId}/membros/${membroId}`
    );

    return response.data;
  },
};

export function listarOrganizacoes(params = {}, axiosConfig = {}) {
  return organizacaoService.listar(params, axiosConfig);
}

export function buscarOrganizacaoPorId(organizacaoId) {
  return organizacaoService.buscarPorId(organizacaoId);
}

export function criarOrganizacao(payload) {
  return organizacaoService.criar(payload);
}

export function atualizarOrganizacao(organizacaoId, payload) {
  return organizacaoService.atualizar(organizacaoId, payload);
}

export function removerOrganizacao(organizacaoId) {
  return organizacaoService.remover(organizacaoId);
}

export function buscarConfiguracoes(organizacaoId) {
  return organizacaoService.buscarConfiguracoes(organizacaoId);
}

export function atualizarConfiguracoes(organizacaoId, payload) {
  return organizacaoService.atualizarConfiguracoes(organizacaoId, payload);
}

export function listarMembrosOrganizacao(organizacaoId, params = {}) {
  return organizacaoService.listarMembros(organizacaoId, params);
}

export function buscarMembroOrganizacaoPorId(organizacaoId, membroId) {
  return organizacaoService.buscarMembroPorId(organizacaoId, membroId);
}

export function convidarMembro(organizacaoId, payload) {
  return organizacaoService.convidarMembro(organizacaoId, payload);
}

export function atualizarMembro(organizacaoId, membroId, payload) {
  return organizacaoService.atualizarMembro(organizacaoId, membroId, payload);
}

export function removerMembro(organizacaoId, membroId) {
  return organizacaoService.removerMembro(organizacaoId, membroId);
}

export default organizacaoService;
