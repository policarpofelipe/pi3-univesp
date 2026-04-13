const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

class CartaoRelacaoRepository {
  async listar(quadroId, cartaoOrigemId) {
    const [rows] = await db.query(
      `
      SELECT
        cr.id,
        cr.cartao_origem_id AS cartaoOrigemId,
        cr.cartao_destino_id AS cartaoDestinoId,
        cd.titulo AS cartaoDestinoTitulo,
        cr.tipo_relacao AS tipoRelacao,
        cr.criado_por_usuario_id AS criadoPorUsuarioId,
        u.nome_exibicao AS criadoPorNome,
        cr.criado_em AS criadoEm
      FROM cartao_relacoes cr
      INNER JOIN cartoes co ON co.id = cr.cartao_origem_id
      INNER JOIN listas lo ON lo.id = co.lista_id
      INNER JOIN cartoes cd ON cd.id = cr.cartao_destino_id
      INNER JOIN listas ld ON ld.id = cd.lista_id
      LEFT JOIN usuarios u ON u.id = cr.criado_por_usuario_id
      WHERE lo.quadro_id = ?
        AND ld.quadro_id = ?
        AND cr.cartao_origem_id = ?
      ORDER BY cr.criado_em DESC, cr.id DESC
      `,
      [quadroId, quadroId, cartaoOrigemId]
    );
    return rows;
  }

  async criar({
    cartaoOrigemId,
    cartaoDestinoId,
    tipoRelacao,
    criadoPorUsuarioId,
  }) {
    const [result] = await db.query(
      `
      INSERT INTO cartao_relacoes (
        cartao_origem_id,
        cartao_destino_id,
        tipo_relacao,
        criado_por_usuario_id,
        criado_em
      ) VALUES (?, ?, ?, ?, NOW())
      `,
      [cartaoOrigemId, cartaoDestinoId, tipoRelacao, criadoPorUsuarioId || null]
    );
    return result.insertId;
  }

  async remover(relacaoId, cartaoOrigemId) {
    const [result] = await db.query(
      `
      DELETE FROM cartao_relacoes
      WHERE id = ?
        AND cartao_origem_id = ?
      `,
      [relacaoId, cartaoOrigemId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new CartaoRelacaoRepository();
