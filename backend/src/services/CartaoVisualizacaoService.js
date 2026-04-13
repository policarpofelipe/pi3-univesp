const { pool } = require("../database/connection");
const CartaoRepository = require("../repositories/CartaoRepository");

function toPositiveInt(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

class CartaoVisualizacaoService {
  async registrar(quadroId, cartaoId, usuarioId) {
    const qId = toPositiveInt(quadroId);
    const cId = toPositiveInt(cartaoId);
    const uId = toPositiveInt(usuarioId);
    if (!qId || !cId || !uId) throw Object.assign(new Error("IDs inválidos."), { statusCode: 400 });

    const cartao = await CartaoRepository.obterPorId(qId, cId);
    if (!cartao) return null;

    await pool.query(
      `
      INSERT INTO cartao_visualizacoes (
        cartao_id, usuario_id, ultimo_visto_em, vistas_total
      ) VALUES (?, ?, NOW(), 1)
      ON DUPLICATE KEY UPDATE
        ultimo_visto_em = NOW(),
        vistas_total = vistas_total + 1
      `,
      [cId, uId]
    );
    return { cartaoId: cId, usuarioId: uId };
  }
}

module.exports = new CartaoVisualizacaoService();
