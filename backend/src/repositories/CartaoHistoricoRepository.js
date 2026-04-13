const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

class CartaoHistoricoRepository {
  async listar(cartaoId) {
    const [rows] = await db.query(
      `
      SELECT
        ce.id,
        ce.tipo_evento AS tipo,
        ce.criado_em AS criadoEm,
        ce.usuario_id AS autorId,
        COALESCE(u.nome_exibicao, u.email, 'Usuário') AS autorNome,
        ce.dados_json AS dados
      FROM cartao_eventos ce
      LEFT JOIN usuarios u ON u.id = ce.usuario_id
      WHERE ce.cartao_id = ?
      ORDER BY ce.criado_em DESC, ce.id DESC
      `,
      [cartaoId]
    );
    return rows;
  }

  async registrar({ cartaoId, usuarioId, tipoEvento, dados }) {
    await db.query(
      `
      INSERT INTO cartao_eventos (cartao_id, usuario_id, tipo_evento, dados_json, criado_em)
      VALUES (?, ?, ?, ?, NOW())
      `,
      [cartaoId, usuarioId || null, tipoEvento, dados ? JSON.stringify(dados) : null]
    );
  }
}

module.exports = new CartaoHistoricoRepository();

