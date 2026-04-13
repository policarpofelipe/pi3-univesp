const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

class AutomacaoRepository {
  async listar(quadroId) {
    const [rows] = await db.query(
      `
      SELECT
        id, quadro_id AS quadroId, nome, descricao, gatilho, lista_origem_id AS listaOrigemId,
        lista_destino_id AS listaDestinoId, campo_id AS campoId, condicoes_json AS condicoesJson,
        executa_uma_vez_por_cartao AS executaUmaVezPorCartao, ordem_execucao AS ordemExecucao, ativo,
        criado_por_usuario_id AS criadoPorUsuarioId, criado_em AS criadoEm, atualizado_em AS atualizadoEm
      FROM automacoes
      WHERE quadro_id = ?
      ORDER BY ordem_execucao ASC, id ASC
      `,
      [quadroId]
    );
    return rows.map((r) => ({
      ...r,
      ativo: Boolean(r.ativo),
      executaUmaVezPorCartao: Boolean(r.executaUmaVezPorCartao),
      condicoesJson: r.condicoesJson || null,
    }));
  }

  async obterPorId(quadroId, automacaoId) {
    const [rows] = await db.query(
      `
      SELECT
        id, quadro_id AS quadroId, nome, descricao, gatilho, lista_origem_id AS listaOrigemId,
        lista_destino_id AS listaDestinoId, campo_id AS campoId, condicoes_json AS condicoesJson,
        executa_uma_vez_por_cartao AS executaUmaVezPorCartao, ordem_execucao AS ordemExecucao, ativo,
        criado_por_usuario_id AS criadoPorUsuarioId, criado_em AS criadoEm, atualizado_em AS atualizadoEm
      FROM automacoes
      WHERE quadro_id = ? AND id = ?
      LIMIT 1
      `,
      [quadroId, automacaoId]
    );
    const r = rows[0];
    if (!r) return null;
    return {
      ...r,
      ativo: Boolean(r.ativo),
      executaUmaVezPorCartao: Boolean(r.executaUmaVezPorCartao),
      condicoesJson: r.condicoesJson || null,
    };
  }

  async criar(dados) {
    const [maxRows] = await db.query(
      "SELECT COALESCE(MAX(ordem_execucao), 0) AS maxOrd FROM automacoes WHERE quadro_id = ?",
      [dados.quadroId]
    );
    const ordem = Number(maxRows[0]?.maxOrd || 0) + 1;
    const [result] = await db.query(
      `
      INSERT INTO automacoes (
        quadro_id, nome, descricao, gatilho, lista_origem_id, lista_destino_id, campo_id, condicoes_json,
        executa_uma_vez_por_cartao, ordem_execucao, ativo, criado_por_usuario_id, criado_em, atualizado_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        dados.quadroId,
        dados.nome,
        dados.descricao || null,
        dados.gatilho,
        dados.listaOrigemId || null,
        dados.listaDestinoId || null,
        dados.campoId || null,
        dados.condicoesJson ? JSON.stringify(dados.condicoesJson) : null,
        dados.executaUmaVezPorCartao === undefined ? 1 : dados.executaUmaVezPorCartao ? 1 : 0,
        ordem,
        dados.ativo === undefined ? 1 : dados.ativo ? 1 : 0,
        dados.criadoPorUsuarioId || null,
      ]
    );
    return this.obterPorId(dados.quadroId, result.insertId);
  }

  async atualizar(quadroId, automacaoId, dados = {}) {
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
    if (dados.condicoesJson !== undefined) {
      campos.push("condicoes_json = ?");
      params.push(dados.condicoesJson ? JSON.stringify(dados.condicoesJson) : null);
    }
    if (dados.ativo !== undefined) {
      campos.push("ativo = ?");
      params.push(dados.ativo ? 1 : 0);
    }
    if (!campos.length) return this.obterPorId(quadroId, automacaoId);
    params.push(quadroId, automacaoId);
    await db.query(
      `UPDATE automacoes SET ${campos.join(", ")}, atualizado_em = NOW() WHERE quadro_id = ? AND id = ?`,
      params
    );
    return this.obterPorId(quadroId, automacaoId);
  }

  async remover(quadroId, automacaoId) {
    const [result] = await db.query("DELETE FROM automacoes WHERE quadro_id = ? AND id = ?", [
      quadroId,
      automacaoId,
    ]);
    return result.affectedRows > 0;
  }
}

module.exports = new AutomacaoRepository();

