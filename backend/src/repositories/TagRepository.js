const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

class TagRepository {
  async listar(quadroId) {
    const [rows] = await db.query(
      `
      SELECT
        id,
        quadro_id AS quadroId,
        nome,
        cor,
        ativa,
        criado_em AS criadoEm,
        atualizado_em AS atualizadoEm
      FROM tags
      WHERE quadro_id = ?
      ORDER BY nome ASC, id ASC
      `,
      [quadroId]
    );
    return rows.map((row) => ({ ...row, ativa: Boolean(row.ativa) }));
  }

  async obterPorId(quadroId, tagId) {
    const [rows] = await db.query(
      `
      SELECT
        id,
        quadro_id AS quadroId,
        nome,
        cor,
        ativa,
        criado_em AS criadoEm,
        atualizado_em AS atualizadoEm
      FROM tags
      WHERE quadro_id = ? AND id = ?
      LIMIT 1
      `,
      [quadroId, tagId]
    );
    const row = rows[0];
    return row ? { ...row, ativa: Boolean(row.ativa) } : null;
  }

  async criar({ quadroId, nome, cor, ativa = true }) {
    const [result] = await db.query(
      `
      INSERT INTO tags (quadro_id, nome, cor, ativa, criado_em, atualizado_em)
      VALUES (?, ?, ?, ?, NOW(), NOW())
      `,
      [quadroId, nome, cor, ativa ? 1 : 0]
    );
    return this.obterPorId(quadroId, result.insertId);
  }

  async remover(quadroId, tagId) {
    const [result] = await db.query(
      "DELETE FROM tags WHERE quadro_id = ? AND id = ?",
      [quadroId, tagId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new TagRepository();
