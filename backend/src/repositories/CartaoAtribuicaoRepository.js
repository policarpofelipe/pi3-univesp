const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

class CartaoAtribuicaoRepository {
  async listar(quadroId, cartaoId) {
    const [rows] = await db.query(
      `
      SELECT
        ca.id,
        ca.cartao_id AS cartaoId,
        ca.usuario_id AS usuarioId,
        u.nome_exibicao AS usuarioNome,
        ca.papel_no_cartao AS papelNoCartao,
        ca.atribuido_por_usuario_id AS atribuidoPorUsuarioId,
        au.nome_exibicao AS atribuidoPorNome,
        ca.criado_em AS criadoEm
      FROM cartao_atribuicoes ca
      INNER JOIN cartoes c ON c.id = ca.cartao_id
      INNER JOIN listas l ON l.id = c.lista_id
      INNER JOIN usuarios u ON u.id = ca.usuario_id
      LEFT JOIN usuarios au ON au.id = ca.atribuido_por_usuario_id
      WHERE l.quadro_id = ?
        AND ca.cartao_id = ?
      ORDER BY
        CASE ca.papel_no_cartao
          WHEN 'responsavel' THEN 1
          ELSE 2
        END,
        u.nome_exibicao ASC
      `,
      [quadroId, cartaoId]
    );
    return rows;
  }

  async obterPorUsuario(quadroId, cartaoId, usuarioId) {
    const [rows] = await db.query(
      `
      SELECT
        ca.id,
        ca.cartao_id AS cartaoId,
        ca.usuario_id AS usuarioId,
        u.nome_exibicao AS usuarioNome,
        ca.papel_no_cartao AS papelNoCartao,
        ca.atribuido_por_usuario_id AS atribuidoPorUsuarioId,
        au.nome_exibicao AS atribuidoPorNome,
        ca.criado_em AS criadoEm
      FROM cartao_atribuicoes ca
      INNER JOIN cartoes c ON c.id = ca.cartao_id
      INNER JOIN listas l ON l.id = c.lista_id
      INNER JOIN usuarios u ON u.id = ca.usuario_id
      LEFT JOIN usuarios au ON au.id = ca.atribuido_por_usuario_id
      WHERE l.quadro_id = ?
        AND ca.cartao_id = ?
        AND ca.usuario_id = ?
      LIMIT 1
      `,
      [quadroId, cartaoId, usuarioId]
    );
    return rows[0] || null;
  }

  async criar({ cartaoId, usuarioId, papelNoCartao, atribuidoPorUsuarioId }) {
    await db.query(
      `
      INSERT INTO cartao_atribuicoes (
        cartao_id,
        usuario_id,
        papel_no_cartao,
        atribuido_por_usuario_id,
        criado_em
      ) VALUES (?, ?, ?, ?, NOW())
      `,
      [cartaoId, usuarioId, papelNoCartao, atribuidoPorUsuarioId || null]
    );
  }

  async removerPorUsuario(cartaoId, usuarioId) {
    const [result] = await db.query(
      "DELETE FROM cartao_atribuicoes WHERE cartao_id = ? AND usuario_id = ?",
      [cartaoId, usuarioId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new CartaoAtribuicaoRepository();
