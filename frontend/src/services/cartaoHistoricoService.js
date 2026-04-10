import { api } from "./authService";

const cartaoHistoricoService = {
  async listar(quadroId, cartaoId) {
    if (!quadroId || !cartaoId) {
      throw new Error("Quadro e cartão são obrigatórios.");
    }
    const response = await api.get(
      `/quadros/${quadroId}/cartoes/${cartaoId}/historico`
    );
    return response.data;
  },
};

export default cartaoHistoricoService;
