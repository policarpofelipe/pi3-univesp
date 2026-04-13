const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

class VisaoRepository {
  async listar(quadroId) {
    const [rows] = await db.query(
      `
      SELECT
        id,
        quadro_id AS quadroId,
        nome,
        tipo,
        chave_sistema AS chaveSistema,
        filtro_json AS filtroJson,
        fixa,
        posicao_padrao AS posicaoPadrao,
        ativa,
        criado_em AS criadoEm,
        atualizado_em AS atualizadoEm
      FROM visoes_quadro
      WHERE quadro_id = ?
      ORDER BY posicao_padrao ASC, id ASC
      `,
      [quadroId]
    );
    return rows.map((r) => ({
      ...r,
      fixa: Boolean(r.fixa),
      ativa: Boolean(r.ativa),
      filtroJson: r.filtroJson || null,
    }));
  }

  async obterPorId(quadroId, visaoId) {
    const [rows] = await db.query(
      `
      SELECT
        id,
        quadro_id AS quadroId,
        nome,
        tipo,
        chave_sistema AS chaveSistema,
        filtro_json AS filtroJson,
        fixa,
        posicao_padrao AS posicaoPadrao,
        ativa,
        criado_em AS criadoEm,
        atualizado_em AS atualizadoEm
      FROM visoes_quadro
      WHERE quadro_id = ? AND id = ?
      LIMIT 1
      `,
      [quadroId, visaoId]
    );
    const r = rows[0];
    if (!r) return null;
    return { ...r, fixa: Boolean(r.fixa), ativa: Boolean(r.ativa), filtroJson: r.filtroJson || null };
  }

  async criar(dados) {
    const [maxRows] = await db.query(
      "SELECT COALESCE(MAX(posicao_padrao), 0) AS maxPos FROM visoes_quadro WHERE quadro_id = ?",
      [dados.quadroId]
    );
    const pos = Number(maxRows[0]?.maxPos || 0) + 1;
    const [result] = await db.query(
      `
      INSERT INTO visoes_quadro (
        quadro_id, nome, tipo, chave_sistema, filtro_json, fixa, posicao_padrao, ativa, criado_em, atualizado_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        dados.quadroId,
        dados.nome,
        dados.tipo || "personalizada",
        dados.chaveSistema || null,
        dados.filtroJson ? JSON.stringify(dados.filtroJson) : null,
        dados.fixa ? 1 : 0,
        pos,
        dados.ativa === undefined ? 1 : dados.ativa ? 1 : 0,
      ]
    );
    return this.obterPorId(dados.quadroId, result.insertId);
  }

  async atualizar(quadroId, visaoId, dados = {}) {
    const campos = [];
    const params = [];
    if (dados.nome !== undefined) {
      campos.push("nome = ?");
      params.push(dados.nome);
    }
    if (dados.filtroJson !== undefined) {
      campos.push("filtro_json = ?");
      params.push(dados.filtroJson ? JSON.stringify(dados.filtroJson) : null);
    }
    if (dados.ativa !== undefined) {
      campos.push("ativa = ?");
      params.push(dados.ativa ? 1 : 0);
    }
    if (!campos.length) return this.obterPorId(quadroId, visaoId);
    params.push(quadroId, visaoId);
    await db.query(
      `UPDATE visoes_quadro SET ${campos.join(", ")}, atualizado_em = NOW() WHERE quadro_id = ? AND id = ?`,
      params
    );
    return this.obterPorId(quadroId, visaoId);
  }

  async remover(quadroId, visaoId) {
    const [result] = await db.query("DELETE FROM visoes_quadro WHERE quadro_id = ? AND id = ?", [
      quadroId,
      visaoId,
    ]);
    return result.affectedRows > 0;
  }
}

module.exports = new VisaoRepository();

