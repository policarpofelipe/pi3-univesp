const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

class TagRepository {
  mapRow(row) {
    if (!row) return null;
    return { ...row, ativa: Boolean(row.ativa) };
  }

  async listar(quadroId, { incluirInativas = false } = {}) {
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
        ${incluirInativas ? "" : "AND ativa = 1"}
      ORDER BY nome ASC, id ASC
      `,
      [quadroId]
    );
    return rows.map((row) => this.mapRow(row));
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
    return this.mapRow(rows[0] || null);
  }

  async obterPorNome(quadroId, nome) {
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
        AND LOWER(nome) = LOWER(?)
      LIMIT 1
      `,
      [quadroId, nome]
    );
    return this.mapRow(rows[0] || null);
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

  async atualizar(quadroId, tagId, dados = {}) {
    const campos = [];
    const params = [];
    if (dados.nome !== undefined) {
      campos.push("nome = ?");
      params.push(dados.nome);
    }
    if (dados.cor !== undefined) {
      campos.push("cor = ?");
      params.push(dados.cor);
    }
    if (dados.ativa !== undefined) {
      campos.push("ativa = ?");
      params.push(dados.ativa ? 1 : 0);
    }
    if (!campos.length) {
      return this.obterPorId(quadroId, tagId);
    }
    params.push(quadroId, tagId);
    await db.query(
      `
      UPDATE tags
      SET ${campos.join(", ")}, atualizado_em = NOW()
      WHERE quadro_id = ? AND id = ?
      `,
      params
    );
    return this.obterPorId(quadroId, tagId);
  }

  async desativar(quadroId, tagId) {
    const [result] = await db.query(
      `
      UPDATE tags
      SET ativa = 0, atualizado_em = NOW()
      WHERE quadro_id = ? AND id = ?
      `,
      [quadroId, tagId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new TagRepository();
