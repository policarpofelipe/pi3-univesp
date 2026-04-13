const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

class CartaoEventoRepository {
  async listarPorCartao(cartaoId, limit = 50) {
    const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 50;
    const [rows] = await db.query(
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
      LIMIT ?
      `,
      [cartaoId, safeLimit]
    );
    return rows;
  }

  async criar({ cartaoId, usuarioId = null, tipoEvento, dadosJson = null }) {
    const [result] = await db.query(
      `
      INSERT INTO cartao_eventos (
        cartao_id, usuario_id, tipo_evento, dados_json, criado_em
      ) VALUES (?, ?, ?, ?, NOW())
      `,
      [cartaoId, usuarioId, tipoEvento, dadosJson]
    );

    const [rows] = await db.query(
      `
      SELECT
        id,
        cartao_id AS cartaoId,
        usuario_id AS usuarioId,
        tipo_evento AS tipoEvento,
        dados_json AS dadosJson,
        criado_em AS criadoEm
      FROM cartao_eventos
      WHERE id = ?
      LIMIT 1
      `,
      [result.insertId]
    );

    return rows[0] || null;
  }
}

module.exports = new CartaoEventoRepository();
