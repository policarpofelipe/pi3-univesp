class HandoffService {
  async preparar({ cartaoOrigemId, quadroDestinoId, usuarioId }) {
    return {
      preparado: true,
      cartaoOrigemId: Number(cartaoOrigemId) || null,
      quadroDestinoId: Number(quadroDestinoId) || null,
      usuarioId: Number(usuarioId) || null,
      message: "Handoff preparado para implementação de execução.",
    };
  }
}

module.exports = new HandoffService();
