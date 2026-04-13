const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

class CartaoComentarioRepository {
  async listar(cartaoId) {
    const [rows] = await db.query(
      `
      SELECT
        cc.id,
        cc.cartao_id AS cartaoId,
        cc.usuario_id AS autorId,
        COALESCE(u.nome_exibicao, u.email, 'Usuário') AS autorNome,
        cc.texto,
        cc.criado_em AS criadoEm
      FROM cartao_comentarios cc
      LEFT JOIN usuarios u ON u.id = cc.usuario_id
      WHERE cc.cartao_id = ?
        AND cc.removido_em IS NULL
      ORDER BY cc.criado_em ASC
      `,
      [cartaoId]
    );
    return rows;
  }

  async criar({ cartaoId, usuarioId, texto }) {
    const [result] = await db.query(
      `
      INSERT INTO cartao_comentarios (cartao_id, usuario_id, texto, criado_em)
      VALUES (?, ?, ?, NOW())
      `,
      [cartaoId, usuarioId, texto]
    );
    return result.insertId;
  }

  async obterPorId(cartaoId, comentarioId) {
    const [rows] = await db.query(
      `
      SELECT
        cc.id,
        cc.cartao_id AS cartaoId,
        cc.usuario_id AS autorId,
        COALESCE(u.nome_exibicao, u.email, 'Usuário') AS autorNome,
        cc.texto,
        cc.criado_em AS criadoEm
      FROM cartao_comentarios cc
      LEFT JOIN usuarios u ON u.id = cc.usuario_id
      WHERE cc.cartao_id = ?
        AND cc.id = ?
        AND cc.removido_em IS NULL
      LIMIT 1
      `,
      [cartaoId, comentarioId]
    );
    return rows[0] || null;
  }

  async remover(cartaoId, comentarioId) {
    const [result] = await db.query(
      `
      UPDATE cartao_comentarios
      SET removido_em = NOW(), editado_em = NOW()
      WHERE cartao_id = ?
        AND id = ?
        AND removido_em IS NULL
      `,
      [cartaoId, comentarioId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new CartaoComentarioRepository();

