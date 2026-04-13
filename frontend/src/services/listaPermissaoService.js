import { api } from "./authService";

const listaPermissaoService = {
  async listar(quadroId, listaId) {
    if (!quadroId || !listaId) {
      throw new Error("Quadro e lista são obrigatórios.");
    }

    const response = await api.get(
      `/quadros/${quadroId}/listas/${listaId}/permissoes`
    );
    return response.data;
  },

  async definir(quadroId, listaId, payload) {
    if (!quadroId || !listaId) {
      throw new Error("Quadro e lista são obrigatórios.");
    }

    const response = await api.put(
      `/quadros/${quadroId}/listas/${listaId}/permissoes`,
      payload
    );
    return response.data;
  },

  async remover(quadroId, listaId, papelId) {
    if (!quadroId || !listaId || !papelId) {
      throw new Error("Quadro, lista e papel são obrigatórios.");
    }

    const response = await api.delete(
      `/quadros/${quadroId}/listas/${listaId}/permissoes/${papelId}`
    );
    return response.data;
  },
};

export default listaPermissaoService;
