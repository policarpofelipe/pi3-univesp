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
        criado_em AS criadoEm
      FROM tags
      WHERE quadro_id = ?
      ORDER BY nome ASC, id ASC
      `,
      [quadroId]
    );
    return rows;
  }

  async obterPorId(quadroId, tagId) {
    const [rows] = await db.query(
      `
      SELECT
        id,
        quadro_id AS quadroId,
        nome,
        cor,
        criado_em AS criadoEm
      FROM tags
      WHERE quadro_id = ? AND id = ?
      LIMIT 1
      `,
      [quadroId, tagId]
    );
    return rows[0] || null;
  }

  async criar({ quadroId, nome, cor }) {
    const [result] = await db.query(
      `
      INSERT INTO tags (quadro_id, nome, cor, criado_em)
      VALUES (?, ?, ?, NOW())
      `,
      [quadroId, nome, cor]
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
