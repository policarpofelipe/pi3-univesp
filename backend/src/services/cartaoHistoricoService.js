const CartaoRepository = require("../repositories/CartaoRepository");
const CartaoHistoricoRepository = require("../repositories/CartaoHistoricoRepository");

function toPositiveInt(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

class CartaoHistoricoService {
  async listar(quadroId, cartaoId) {
    const qId = toPositiveInt(quadroId);
    const cId = toPositiveInt(cartaoId);
    if (!qId || !cId) {
      const error = new Error("IDs informados são inválidos.");
      error.statusCode = 400;
      throw error;
    }

    const cartao = await CartaoRepository.obterPorId(qId, cId);
    if (!cartao) return null;

    return CartaoHistoricoRepository.listar(cId);
  }

  async registrar(payload) {
    return CartaoHistoricoRepository.registrar(payload);
  }
}

module.exports = new CartaoHistoricoService();

