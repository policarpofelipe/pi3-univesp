const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

class AutomacaoExecucaoRepository {
  async listarPorCartao(cartaoId, limit = 50) {
    const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 50;
    const [rows] = await db.query(
      `
      SELECT
        id,
        automacao_id AS automacaoId,
        acao_id AS acaoId,
        cartao_id AS cartaoId,
        status_execucao AS statusExecucao,
        resultado_json AS resultadoJson,
        executado_em AS executadoEm
      FROM automacao_execucoes
      WHERE cartao_id = ?
      ORDER BY executado_em DESC, id DESC
      LIMIT ?
      `,
      [cartaoId, safeLimit]
    );
    return rows;
  }

  async obter(automacaoId, acaoId, cartaoId) {
    const [rows] = await db.query(
      `
      SELECT
        id,
        automacao_id AS automacaoId,
        acao_id AS acaoId,
        cartao_id AS cartaoId,
        status_execucao AS statusExecucao,
        resultado_json AS resultadoJson,
        executado_em AS executadoEm
      FROM automacao_execucoes
      WHERE automacao_id = ? AND acao_id = ? AND cartao_id = ?
      LIMIT 1
      `,
      [automacaoId, acaoId, cartaoId]
    );
    return rows[0] || null;
  }

  async registrar({
    automacaoId,
    acaoId,
    cartaoId,
    statusExecucao = "sucesso",
    resultadoJson = null,
  }) {
    await db.query(
      `
      INSERT INTO automacao_execucoes (
        automacao_id, acao_id, cartao_id, status_execucao, resultado_json, executado_em
      ) VALUES (?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        status_execucao = VALUES(status_execucao),
        resultado_json = VALUES(resultado_json),
        executado_em = NOW()
      `,
      [automacaoId, acaoId, cartaoId, statusExecucao, resultadoJson]
    );
    return this.obter(automacaoId, acaoId, cartaoId);
  }
}

module.exports = new AutomacaoExecucaoRepository();
