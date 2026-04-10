import { api } from "./authService";

const base = (quadroId, cartaoId) =>
  `/quadros/${quadroId}/cartoes/${cartaoId}/checklists`;

const cartaoChecklistService = {
  async listar(quadroId, cartaoId) {
    if (!quadroId || !cartaoId) {
      throw new Error("Quadro e cartão são obrigatórios.");
    }
    const response = await api.get(base(quadroId, cartaoId));
    return response.data;
  },

  async criarChecklist(quadroId, cartaoId, payload = {}) {
    if (!quadroId || !cartaoId) {
      throw new Error("Quadro e cartão são obrigatórios.");
    }
    const response = await api.post(base(quadroId, cartaoId), payload);
    return response.data;
  },

  async atualizarChecklist(quadroId, cartaoId, checklistId, payload) {
    if (!quadroId || !cartaoId || !checklistId) {
      throw new Error("Quadro, cartão e checklist são obrigatórios.");
    }
    const response = await api.put(
      `${base(quadroId, cartaoId)}/${checklistId}`,
      payload
    );
    return response.data;
  },

  async removerChecklist(quadroId, cartaoId, checklistId) {
    if (!quadroId || !cartaoId || !checklistId) {
      throw new Error("Quadro, cartão e checklist são obrigatórios.");
    }
    const response = await api.delete(
      `${base(quadroId, cartaoId)}/${checklistId}`
    );
    return response.data;
  },

  async criarItem(quadroId, cartaoId, checklistId, payload) {
    if (!quadroId || !cartaoId || !checklistId) {
      throw new Error("Quadro, cartão e checklist são obrigatórios.");
    }
    const response = await api.post(
      `${base(quadroId, cartaoId)}/${checklistId}/itens`,
      payload
    );
    return response.data;
  },

  async atualizarItem(quadroId, cartaoId, checklistId, itemId, payload) {
    if (!quadroId || !cartaoId || !checklistId || !itemId) {
      throw new Error("Identificadores incompletos.");
    }
    const response = await api.patch(
      `${base(quadroId, cartaoId)}/${checklistId}/itens/${itemId}`,
      payload
    );
    return response.data;
  },

  async removerItem(quadroId, cartaoId, checklistId, itemId) {
    if (!quadroId || !cartaoId || !checklistId || !itemId) {
      throw new Error("Identificadores incompletos.");
    }
    const response = await api.delete(
      `${base(quadroId, cartaoId)}/${checklistId}/itens/${itemId}`
    );
    return response.data;
  },
};

export default cartaoChecklistService;
