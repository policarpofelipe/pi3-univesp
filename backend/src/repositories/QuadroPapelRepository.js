const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

class QuadroPapelRepository {
  mapRowToEntity(row) {
    if (!row) return null;

    return {
      id: row.id,
      quadroId: row.quadroId,
      nome: row.nome,
      descricao: row.descricao,
      ativo: Boolean(row.ativo),
      membros: Number(row.membros || 0),
      criadoEm: row.criadoEm,
      atualizadoEm: row.atualizadoEm,
      permissoes: {
        podeGerenciarQuadro: Boolean(row.podeGerenciarQuadro),
        podeGerenciarListas: Boolean(row.podeGerenciarListas),
        podeGerenciarAutomacoes: Boolean(row.podeGerenciarAutomacoes),
        podeGerenciarCampos: Boolean(row.podeGerenciarCampos),
        podeConvidarMembros: Boolean(row.podeConvidarMembros),
        podeCriarCartao: Boolean(row.podeCriarCartao),
      },
    };
  }

  async listar(quadroId, filtros = {}) {
    const { busca, ativo, limit, offset } = filtros;

    const where = ["qp.quadro_id = ?"];
    const params = [quadroId];

    if (busca) {
      where.push("(qp.nome LIKE ? OR qp.descricao LIKE ?)");
      params.push(`%${busca}%`, `%${busca}%`);
    }

    if (typeof ativo === "boolean") {
      where.push("qp.ativo = ?");
      params.push(ativo ? 1 : 0);
    }

    let sql = `
      SELECT
        qp.id,
        qp.quadro_id AS quadroId,
        qp.nome,
        qp.descricao,
        qp.ativo,
        qp.pode_gerenciar_quadro AS podeGerenciarQuadro,
        qp.pode_gerenciar_listas AS podeGerenciarListas,
        qp.pode_gerenciar_automacoes AS podeGerenciarAutomacoes,
        qp.pode_gerenciar_campos AS podeGerenciarCampos,
        qp.pode_convidar_membros AS podeConvidarMembros,
        qp.pode_criar_cartao AS podeCriarCartao,
        qp.criado_em AS criadoEm,
        qp.atualizado_em AS atualizadoEm,
        COUNT(
          DISTINCT CASE
            WHEN qm.status = 'ativo' THEN qm.id
            ELSE NULL
          END
        ) AS membros
      FROM quadro_papeis qp
      LEFT JOIN quadro_membro_papeis qmp
        ON qmp.papel_id = qp.id
      LEFT JOIN quadro_membros qm
        ON qm.id = qmp.quadro_membro_id
      WHERE ${where.join(" AND ")}
      GROUP BY
        qp.id,
        qp.quadro_id,
        qp.nome,
        qp.descricao,
        qp.ativo,
        qp.pode_gerenciar_quadro,
        qp.pode_gerenciar_listas,
        qp.pode_gerenciar_automacoes,
        qp.pode_gerenciar_campos,
        qp.pode_convidar_membros,
        qp.pode_criar_cartao,
        qp.criado_em,
        qp.atualizado_em
      ORDER BY qp.nome ASC
    `;

    if (Number.isInteger(limit) && limit > 0) {
      sql += " LIMIT ?";
      params.push(limit);

      if (Number.isInteger(offset) && offset >= 0) {
        sql += " OFFSET ?";
        params.push(offset);
      }
    }

    const [rows] = await db.query(sql, params);
    return rows.map((row) => this.mapRowToEntity(row));
  }

  async obterPorId(quadroId, papelId) {
    const sql = `
      SELECT
        qp.id,
        qp.quadro_id AS quadroId,
        qp.nome,
        qp.descricao,
        qp.ativo,
        qp.pode_gerenciar_quadro AS podeGerenciarQuadro,
        qp.pode_gerenciar_listas AS podeGerenciarListas,
        qp.pode_gerenciar_automacoes AS podeGerenciarAutomacoes,
        qp.pode_gerenciar_campos AS podeGerenciarCampos,
        qp.pode_convidar_membros AS podeConvidarMembros,
        qp.pode_criar_cartao AS podeCriarCartao,
        qp.criado_em AS criadoEm,
        qp.atualizado_em AS atualizadoEm,
        COUNT(
          DISTINCT CASE
            WHEN qm.status = 'ativo' THEN qm.id
            ELSE NULL
          END
        ) AS membros
      FROM quadro_papeis qp
      LEFT JOIN quadro_membro_papeis qmp
        ON qmp.papel_id = qp.id
      LEFT JOIN quadro_membros qm
        ON qm.id = qmp.quadro_membro_id
      WHERE qp.quadro_id = ?
        AND qp.id = ?
      GROUP BY
        qp.id,
        qp.quadro_id,
        qp.nome,
        qp.descricao,
        qp.ativo,
        qp.pode_gerenciar_quadro,
        qp.pode_gerenciar_listas,
        qp.pode_gerenciar_automacoes,
        qp.pode_gerenciar_campos,
        qp.pode_convidar_membros,
        qp.pode_criar_cartao,
        qp.criado_em,
        qp.atualizado_em
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [quadroId, papelId]);
    return this.mapRowToEntity(rows[0] || null);
  }

  async criar(dados) {
    const {
      quadroId,
      nome,
      descricao = null,
      podeGerenciarQuadro = false,
      podeGerenciarListas = false,
      podeGerenciarAutomacoes = false,
      podeGerenciarCampos = false,
      podeConvidarMembros = false,
      podeCriarCartao = true,
      ativo = true,
    } = dados;

    const sql = `
      INSERT INTO quadro_papeis (
        quadro_id,
        nome,
        descricao,
        pode_gerenciar_quadro,
        pode_gerenciar_listas,
        pode_gerenciar_automacoes,
        pode_gerenciar_campos,
        pode_convidar_membros,
        pode_criar_cartao,
        ativo,
        criado_em,
        atualizado_em
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const [result] = await db.query(sql, [
      quadroId,
      nome,
      descricao,
      podeGerenciarQuadro ? 1 : 0,
      podeGerenciarListas ? 1 : 0,
      podeGerenciarAutomacoes ? 1 : 0,
      podeGerenciarCampos ? 1 : 0,
      podeConvidarMembros ? 1 : 0,
      podeCriarCartao ? 1 : 0,
      ativo ? 1 : 0,
    ]);

    return this.obterPorId(quadroId, result.insertId);
  }

  async atualizar(quadroId, papelId, dados) {
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

    if (dados.ativo !== undefined) {
      campos.push("ativo = ?");
      params.push(dados.ativo ? 1 : 0);
    }

    if (campos.length === 0) {
      return this.obterPorId(quadroId, papelId);
    }

    campos.push("atualizado_em = NOW()");
    params.push(quadroId, papelId);

    const sql = `
      UPDATE quadro_papeis
      SET ${campos.join(", ")}
      WHERE quadro_id = ?
        AND id = ?
    `;

    await db.query(sql, params);
    return this.obterPorId(quadroId, papelId);
  }

  async atualizarPermissoes(quadroId, papelId, permissoes = {}) {
    const campos = [];
    const params = [];

    if (permissoes.podeGerenciarQuadro !== undefined) {
      campos.push("pode_gerenciar_quadro = ?");
      params.push(permissoes.podeGerenciarQuadro ? 1 : 0);
    }

    if (permissoes.podeGerenciarListas !== undefined) {
      campos.push("pode_gerenciar_listas = ?");
      params.push(permissoes.podeGerenciarListas ? 1 : 0);
    }

    if (permissoes.podeGerenciarAutomacoes !== undefined) {
      campos.push("pode_gerenciar_automacoes = ?");
      params.push(permissoes.podeGerenciarAutomacoes ? 1 : 0);
    }

    if (permissoes.podeGerenciarCampos !== undefined) {
      campos.push("pode_gerenciar_campos = ?");
      params.push(permissoes.podeGerenciarCampos ? 1 : 0);
    }

    if (permissoes.podeConvidarMembros !== undefined) {
      campos.push("pode_convidar_membros = ?");
      params.push(permissoes.podeConvidarMembros ? 1 : 0);
    }

    if (permissoes.podeCriarCartao !== undefined) {
      campos.push("pode_criar_cartao = ?");
      params.push(permissoes.podeCriarCartao ? 1 : 0);
    }

    if (campos.length === 0) {
      return this.obterPorId(quadroId, papelId);
    }

    campos.push("atualizado_em = NOW()");
    params.push(quadroId, papelId);

    const sql = `
      UPDATE quadro_papeis
      SET ${campos.join(", ")}
      WHERE quadro_id = ?
        AND id = ?
    `;

    await db.query(sql, params);
    return this.obterPorId(quadroId, papelId);
  }

  async remover(quadroId, papelId) {
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      await conn.query(
        `
          DELETE qmp
          FROM quadro_membro_papeis qmp
          INNER JOIN quadro_membros qm
            ON qm.id = qmp.quadro_membro_id
          WHERE qm.quadro_id = ?
            AND qmp.papel_id = ?
        `,
        [quadroId, papelId]
      );

      const [result] = await conn.query(
        `
          DELETE FROM quadro_papeis
          WHERE quadro_id = ?
            AND id = ?
        `,
        [quadroId, papelId]
      );

      await conn.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  async contarMembrosVinculados(quadroId, papelId, filtros = {}) {
    const where = [
      "qm.quadro_id = ?",
      "qmp.papel_id = ?",
    ];
    const params = [quadroId, papelId];

    if (filtros.status) {
      where.push("qm.status = ?");
      params.push(filtros.status);
    }

    const sql = `
      SELECT COUNT(DISTINCT qm.id) AS total
      FROM quadro_membro_papeis qmp
      INNER JOIN quadro_membros qm
        ON qm.id = qmp.quadro_membro_id
      WHERE ${where.join(" AND ")}
    `;

    const [rows] = await db.query(sql, params);
    return Number(rows[0]?.total || 0);
  }
}

module.exports = new QuadroPapelRepository();
