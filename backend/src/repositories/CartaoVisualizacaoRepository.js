const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

class CartaoVisualizacaoRepository {
  async listarPorCartao(cartaoId) {
    const [rows] = await db.query(
      `
      SELECT
        id,
        cartao_id AS cartaoId,
        usuario_id AS usuarioId,
        ultimo_visto_em AS ultimoVistoEm,
        vistas_total AS vistasTotal
      FROM cartao_visualizacoes
      WHERE cartao_id = ?
      ORDER BY ultimo_visto_em DESC
      `,
      [cartaoId]
    );
    return rows;
  }

  async obterPorCartaoEUsuario(cartaoId, usuarioId) {
    const [rows] = await db.query(
      `
      SELECT
        id,
        cartao_id AS cartaoId,
        usuario_id AS usuarioId,
        ultimo_visto_em AS ultimoVistoEm,
        vistas_total AS vistasTotal
      FROM cartao_visualizacoes
      WHERE cartao_id = ? AND usuario_id = ?
      LIMIT 1
      `,
      [cartaoId, usuarioId]
    );
    return rows[0] || null;
  }

  async registrarVisualizacao(cartaoId, usuarioId) {
    await db.query(
      `
      INSERT INTO cartao_visualizacoes (
        cartao_id, usuario_id, ultimo_visto_em, vistas_total
      ) VALUES (?, ?, NOW(), 1)
      ON DUPLICATE KEY UPDATE
        ultimo_visto_em = NOW(),
        vistas_total = vistas_total + 1
      `,
      [cartaoId, usuarioId]
    );
    return this.obterPorCartaoEUsuario(cartaoId, usuarioId);
  }
}

module.exports = new CartaoVisualizacaoRepository();
