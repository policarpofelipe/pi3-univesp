const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

class AutomacaoAcaoRepository {
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
    return rows.map((row) => ({ ...row, ativo: Boolean(row.ativo) }));
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
    const row = rows[0];
    return row ? { ...row, ativo: Boolean(row.ativo) } : null;
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
      [automacaoId, ordemExecucao, tipoAcao, configJson, ativo ? 1 : 0]
    );
    return this.obterPorId(automacaoId, result.insertId);
  }
}

module.exports = new AutomacaoAcaoRepository();
