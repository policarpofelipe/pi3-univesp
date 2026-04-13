const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

class CampoPersonalizadoRepository {
  async listar(quadroId) {
    const [rows] = await db.query(
      `
      SELECT
        id, quadro_id AS quadroId, nome, tipo, descricao, obrigatorio, posicao, config_json AS configJson, ativo,
        criado_em AS criadoEm, atualizado_em AS atualizadoEm
      FROM campos_personalizados
      WHERE quadro_id = ?
      ORDER BY posicao ASC, id ASC
      `,
      [quadroId]
    );
    return rows.map((r) => ({
      ...r,
      obrigatorio: Boolean(r.obrigatorio),
      ativo: Boolean(r.ativo),
      configJson: r.configJson || null,
    }));
  }

  async obterPorId(quadroId, campoId) {
    const [rows] = await db.query(
      `
      SELECT
        id, quadro_id AS quadroId, nome, tipo, descricao, obrigatorio, posicao, config_json AS configJson, ativo,
        criado_em AS criadoEm, atualizado_em AS atualizadoEm
      FROM campos_personalizados
      WHERE quadro_id = ? AND id = ?
      LIMIT 1
      `,
      [quadroId, campoId]
    );
    const r = rows[0];
    if (!r) return null;
    return { ...r, obrigatorio: Boolean(r.obrigatorio), ativo: Boolean(r.ativo), configJson: r.configJson || null };
  }

  async criar(dados) {
    const [maxRows] = await db.query(
      "SELECT COALESCE(MAX(posicao), 0) AS maxPos FROM campos_personalizados WHERE quadro_id = ?",
      [dados.quadroId]
    );
    const pos = Number(maxRows[0]?.maxPos || 0) + 1;
    const [result] = await db.query(
      `
      INSERT INTO campos_personalizados (
        quadro_id, nome, tipo, descricao, obrigatorio, posicao, config_json, ativo, criado_em, atualizado_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        dados.quadroId,
        dados.nome,
        dados.tipo,
        dados.descricao || null,
        dados.obrigatorio ? 1 : 0,
        pos,
        dados.configJson ? JSON.stringify(dados.configJson) : null,
        dados.ativo === undefined ? 1 : dados.ativo ? 1 : 0,
      ]
    );
    return this.obterPorId(dados.quadroId, result.insertId);
  }

  async atualizar(quadroId, campoId, dados = {}) {
    const campos = [];
    const params = [];
    if (dados.nome !== undefined) {
      campos.push("nome = ?");
      params.push(dados.nome);
    }
    if (dados.descricao !== undefined) {
      campos.push("descricao = ?");
      params.push(dados.descricao);
    }
    if (dados.obrigatorio !== undefined) {
      campos.push("obrigatorio = ?");
      params.push(dados.obrigatorio ? 1 : 0);
    }
    if (dados.configJson !== undefined) {
      campos.push("config_json = ?");
      params.push(dados.configJson ? JSON.stringify(dados.configJson) : null);
    }
    if (dados.ativo !== undefined) {
      campos.push("ativo = ?");
      params.push(dados.ativo ? 1 : 0);
    }
    if (!campos.length) return this.obterPorId(quadroId, campoId);
    params.push(quadroId, campoId);
    await db.query(
      `UPDATE campos_personalizados SET ${campos.join(", ")}, atualizado_em = NOW() WHERE quadro_id = ? AND id = ?`,
      params
    );
    return this.obterPorId(quadroId, campoId);
  }

  async remover(quadroId, campoId) {
    const [result] = await db.query("DELETE FROM campos_personalizados WHERE quadro_id = ? AND id = ?", [
      quadroId,
      campoId,
    ]);
    return result.affectedRows > 0;
  }
}

module.exports = new CampoPersonalizadoRepository();

