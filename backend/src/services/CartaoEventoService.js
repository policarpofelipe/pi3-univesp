const { pool } = require("../database/connection");
const CartaoRepository = require("../repositories/CartaoRepository");

function toPositiveInt(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

class CartaoEventoService {
  async listar(quadroId, cartaoId) {
    const qId = toPositiveInt(quadroId);
    const cId = toPositiveInt(cartaoId);
    if (!qId || !cId) throw Object.assign(new Error("IDs inválidos."), { statusCode: 400 });

    const cartao = await CartaoRepository.obterPorId(qId, cId);
    if (!cartao) return null;

    const [rows] = await pool.query(
      `
      SELECT
        ce.id,
        ce.cartao_id AS cartaoId,
        ce.usuario_id AS usuarioId,
        ce.tipo_evento AS tipoEvento,
        ce.dados_json AS dadosJson,
        ce.criado_em AS criadoEm
      FROM cartao_eventos ce
      WHERE ce.cartao_id = ?
      ORDER BY ce.criado_em DESC, ce.id DESC
      `,
      [cId]
    );
    return rows;
  }
}

module.exports = new CartaoEventoService();
