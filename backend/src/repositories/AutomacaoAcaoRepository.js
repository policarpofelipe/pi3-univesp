const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

class AutomacaoAcaoRepository {
  normalizeRow(row) {
    if (!row) return null;
    let configJson = row.configJson;
    if (typeof configJson === "string") {
      try {
        configJson = JSON.parse(configJson);
      } catch {
        configJson = null;
      }
    }
    return { ...row, ativo: Boolean(row.ativo), configJson: configJson || null };
  }

  async listarPorAutomacao(automacaoId, incluirInativas = false) {
    const [rows] = await db.query(
      `
      SELECT
        id,
        automacao_id AS automacaoId,
        ordem_execucao AS ordemExecucao,
        tipo_acao AS tipoAcao,
        config_json AS configJson,
        ativo,
        criado_em AS criadoEm,
        atualizado_em AS atualizadoEm
      FROM automacao_acoes
      WHERE automacao_id = ?
        ${incluirInativas ? "" : "AND ativo = 1"}
      ORDER BY ordem_execucao ASC, id ASC
      `,
      [automacaoId]
    );
    return rows.map((row) => this.normalizeRow(row));
  }

  async obterPorId(automacaoId, acaoId) {
    const [rows] = await db.query(
      `
      SELECT
        id,
        automacao_id AS automacaoId,
        ordem_execucao AS ordemExecucao,
        tipo_acao AS tipoAcao,
        config_json AS configJson,
        ativo,
        criado_em AS criadoEm,
        atualizado_em AS atualizadoEm
      FROM automacao_acoes
      WHERE automacao_id = ? AND id = ?
      LIMIT 1
      `,
      [automacaoId, acaoId]
    );
    return this.normalizeRow(rows[0] || null);
  }

  async criar({ automacaoId, tipoAcao, configJson = null, ativo = true }) {
    const [maxRows] = await db.query(
      "SELECT COALESCE(MAX(ordem_execucao), 0) AS maxOrdem FROM automacao_acoes WHERE automacao_id = ?",
      [automacaoId]
    );
    const ordemExecucao = Number(maxRows[0]?.maxOrdem || 0) + 1;
    const [result] = await db.query(
      `
      INSERT INTO automacao_acoes (
        automacao_id, ordem_execucao, tipo_acao, config_json, ativo, criado_em, atualizado_em
      ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        automacaoId,
        ordemExecucao,
        tipoAcao,
        configJson ? JSON.stringify(configJson) : null,
        ativo ? 1 : 0,
      ]
    );
    return this.obterPorId(automacaoId, result.insertId);
  }

  async substituirAcoes(automacaoId, acoes = []) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query("DELETE FROM automacao_acoes WHERE automacao_id = ?", [automacaoId]);
      for (let i = 0; i < acoes.length; i += 1) {
        const item = acoes[i];
        await conn.query(
          `
          INSERT INTO automacao_acoes (
            automacao_id, ordem_execucao, tipo_acao, config_json, ativo, criado_em, atualizado_em
          ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
          `,
          [
            automacaoId,
            i + 1,
            item.tipoAcao,
            item.configJson ? JSON.stringify(item.configJson) : null,
            item.ativo === undefined ? 1 : item.ativo ? 1 : 0,
          ]
        );
      }
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
    return this.listarPorAutomacao(automacaoId, true);
  }
}

module.exports = new AutomacaoAcaoRepository();
