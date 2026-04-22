const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

class ListaRepository {
  mapRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      quadroId: row.quadroId,
      nome: row.nome,
      descricao: row.descricao,
      cor: row.cor,
      natureza: row.natureza,
      posicao: Number(row.posicaoPadrao),
      limiteWip: row.limiteWip == null ? null : Number(row.limiteWip),
      usaControleAcesso: Boolean(row.usaControleAcesso),
      usaRegrasTransicao: Boolean(row.usaRegrasTransicao),
      ativa: Boolean(row.ativa),
      criadaEm: row.criadaEm,
      atualizadaEm: row.atualizadaEm,
      totalCartoes: Number(row.totalCartoes || 0),
    };
  }

  async listar(quadroId) {
    const [rows] = await db.query(
      `
      SELECT
        l.id,
        l.quadro_id AS quadroId,
        l.nome,
        l.descricao,
        l.cor,
        l.natureza,
        l.posicao_padrao AS posicaoPadrao,
        l.limite_wip AS limiteWip,
        l.usa_controle_acesso AS usaControleAcesso,
        l.usa_regras_transicao AS usaRegrasTransicao,
        l.ativa,
        l.criada_em AS criadaEm,
        l.atualizada_em AS atualizadaEm,
        COUNT(c.id) AS totalCartoes
      FROM listas l
      LEFT JOIN cartoes c
        ON c.lista_id = l.id
       AND c.arquivado_em IS NULL
      WHERE l.quadro_id = ?
      GROUP BY
        l.id, l.quadro_id, l.nome, l.descricao, l.cor, l.natureza,
        l.posicao_padrao, l.limite_wip, l.usa_controle_acesso,
        l.usa_regras_transicao, l.ativa, l.criada_em, l.atualizada_em
      ORDER BY l.posicao_padrao ASC, l.id ASC
      `,
      [quadroId]
    );
    return rows.map((row) => this.mapRow(row));
  }

  async obterPorId(quadroId, listaId) {
    const [rows] = await db.query(
      `
      SELECT
        l.id,
        l.quadro_id AS quadroId,
        l.nome,
        l.descricao,
        l.cor,
        l.natureza,
        l.posicao_padrao AS posicaoPadrao,
        l.limite_wip AS limiteWip,
        l.usa_controle_acesso AS usaControleAcesso,
        l.usa_regras_transicao AS usaRegrasTransicao,
        l.ativa,
        l.criada_em AS criadaEm,
        l.atualizada_em AS atualizadaEm,
        COUNT(c.id) AS totalCartoes
      FROM listas l
      LEFT JOIN cartoes c
        ON c.lista_id = l.id
       AND c.arquivado_em IS NULL
      WHERE l.quadro_id = ?
        AND l.id = ?
      GROUP BY
        l.id, l.quadro_id, l.nome, l.descricao, l.cor, l.natureza,
        l.posicao_padrao, l.limite_wip, l.usa_controle_acesso,
        l.usa_regras_transicao, l.ativa, l.criada_em, l.atualizada_em
      LIMIT 1
      `,
      [quadroId, listaId]
    );
    return this.mapRow(rows[0] || null);
  }

  async criar({ quadroId, nome, descricao = null, limiteWip = null, cor = null }) {
    const [maxRows] = await db.query(
      "SELECT COALESCE(MAX(posicao_padrao), 0) AS maxPos FROM listas WHERE quadro_id = ?",
      [quadroId]
    );
    const nextPos = Number(maxRows[0]?.maxPos || 0) + 1;

    const [result] = await db.query(
      `
      INSERT INTO listas (
        quadro_id, nome, descricao, cor, posicao_padrao, limite_wip, criada_em, atualizada_em
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [quadroId, nome, descricao, cor, nextPos, limiteWip]
    );

    return this.obterPorId(quadroId, result.insertId);
  }

  async atualizar(quadroId, listaId, dados = {}) {
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
    if (dados.limiteWip !== undefined) {
      campos.push("limite_wip = ?");
      params.push(dados.limiteWip);
    }
    if (dados.cor !== undefined) {
      campos.push("cor = ?");
      params.push(dados.cor);
    }
    if (campos.length === 0) return this.obterPorId(quadroId, listaId);

    params.push(quadroId, listaId);
    await db.query(
      `
      UPDATE listas
      SET ${campos.join(", ")}, atualizada_em = NOW()
      WHERE quadro_id = ? AND id = ?
      `,
      params
    );
    return this.obterPorId(quadroId, listaId);
  }

  async remover(quadroId, listaId) {
    const [result] = await db.query(
      "DELETE FROM listas WHERE quadro_id = ? AND id = ?",
      [quadroId, listaId]
    );
    await this.recalcularPosicoes(quadroId);
    return result.affectedRows > 0;
  }

  async reordenar(quadroId, ids = []) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      for (let i = 0; i < ids.length; i += 1) {
        await conn.query(
          `
          UPDATE listas
          SET posicao_padrao = ?, atualizada_em = NOW()
          WHERE quadro_id = ? AND id = ?
          `,
          [i + 1, quadroId, ids[i]]
        );
      }
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
    return this.listar(quadroId);
  }

  async recalcularPosicoes(quadroId) {
    const [rows] = await db.query(
      "SELECT id FROM listas WHERE quadro_id = ? ORDER BY posicao_padrao ASC, id ASC",
      [quadroId]
    );
    for (let i = 0; i < rows.length; i += 1) {
      await db.query("UPDATE listas SET posicao_padrao = ? WHERE id = ?", [
        i + 1,
        rows[i].id,
      ]);
    }
  }
}

module.exports = new ListaRepository();

