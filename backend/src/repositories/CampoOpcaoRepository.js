const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

class CampoOpcaoRepository {
  async listar(campoId) {
    const [rows] = await db.query(
      `
      SELECT
        id,
        campo_id AS campoId,
        nome,
        valor,
        cor,
        posicao,
        ativa,
        criado_em AS criadoEm,
        atualizado_em AS atualizadoEm
      FROM campo_personalizado_opcoes
      WHERE campo_id = ?
      ORDER BY posicao ASC, id ASC
      `,
      [campoId]
    );
    return rows.map((row) => ({ ...row, ativa: Boolean(row.ativa) }));
  }

  async obterPorId(campoId, opcaoId) {
    const [rows] = await db.query(
      `
      SELECT
        id,
        campo_id AS campoId,
        nome,
        valor,
        cor,
        posicao,
        ativa,
        criado_em AS criadoEm,
        atualizado_em AS atualizadoEm
      FROM campo_personalizado_opcoes
      WHERE campo_id = ? AND id = ?
      LIMIT 1
      `,
      [campoId, opcaoId]
    );
    const row = rows[0];
    return row ? { ...row, ativa: Boolean(row.ativa) } : null;
  }

  async criar({ campoId, nome, valor = null, cor = null, ativa = true }) {
    const [maxRows] = await db.query(
      "SELECT COALESCE(MAX(posicao), 0) AS maxPos FROM campo_personalizado_opcoes WHERE campo_id = ?",
      [campoId]
    );
    const posicao = Number(maxRows[0]?.maxPos || 0) + 1;
    const [result] = await db.query(
      `
      INSERT INTO campo_personalizado_opcoes (
        campo_id, nome, valor, cor, posicao, ativa, criado_em, atualizado_em
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [campoId, nome, valor, cor, posicao, ativa ? 1 : 0]
    );
    return this.obterPorId(campoId, result.insertId);
  }

  async atualizar(campoId, opcaoId, dados = {}) {
    const campos = [];
    const params = [];
    if (dados.nome !== undefined) {
      campos.push("nome = ?");
      params.push(dados.nome);
    }
    if (dados.valor !== undefined) {
      campos.push("valor = ?");
      params.push(dados.valor);
    }
    if (dados.cor !== undefined) {
      campos.push("cor = ?");
      params.push(dados.cor);
    }
    if (dados.ativa !== undefined) {
      campos.push("ativa = ?");
      params.push(dados.ativa ? 1 : 0);
    }
    if (!campos.length) return this.obterPorId(campoId, opcaoId);

    params.push(campoId, opcaoId);
    await db.query(
      `UPDATE campo_personalizado_opcoes SET ${campos.join(", ")}, atualizado_em = NOW() WHERE campo_id = ? AND id = ?`,
      params
    );
    return this.obterPorId(campoId, opcaoId);
  }

  async remover(campoId, opcaoId) {
    const [result] = await db.query(
      "DELETE FROM campo_personalizado_opcoes WHERE campo_id = ? AND id = ?",
      [campoId, opcaoId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new CampoOpcaoRepository();
