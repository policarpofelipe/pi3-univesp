const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

class OrganizacaoRepository {
  mapRowToEntity(row) {
    if (!row) return null;

    return {
      id: row.id,
      nome: row.nome,
      slug: row.slug,
      criadoPorUsuarioId: row.criadoPorUsuarioId,
      ativo: Boolean(row.ativo),
      criadoEm: row.criadoEm,
      atualizadoEm: row.atualizadoEm,
      membrosCount:
        row.membrosCount !== undefined ? Number(row.membrosCount) : undefined,
      quadrosCount:
        row.quadrosCount !== undefined ? Number(row.quadrosCount) : undefined,
    };
  }

  async listar(filtros = {}) {
    const { usuarioId, busca, ativo, limit, offset } = filtros;

    const where = [];
    const params = [];

    let sql = `
      SELECT
        o.id,
        o.nome,
        o.slug,
        o.criado_por_usuario_id AS criadoPorUsuarioId,
        o.ativo,
        o.criado_em AS criadoEm,
        o.atualizado_em AS atualizadoEm,
        COUNT(DISTINCT CASE WHEN om.status = 'ativo' THEN om.id END) AS membrosCount,
        COUNT(DISTINCT q.id) AS quadrosCount
      FROM organizacoes o
      LEFT JOIN organizacao_membros om
        ON om.organizacao_id = o.id
      LEFT JOIN quadros q
        ON q.organizacao_id = o.id
    `;

    if (usuarioId) {
      sql += `
        INNER JOIN organizacao_membros omu
          ON omu.organizacao_id = o.id
         AND omu.usuario_id = ?
         AND omu.status IN ('ativo', 'convidado')
      `;
      params.push(usuarioId);
    }

    if (busca) {
      where.push("(o.nome LIKE ? OR o.slug LIKE ?)");
      params.push(`%${busca}%`, `%${busca}%`);
    }

    if (typeof ativo === "boolean") {
      where.push("o.ativo = ?");
      params.push(ativo ? 1 : 0);
    }

    if (where.length > 0) {
      sql += ` WHERE ${where.join(" AND ")}`;
    }

    sql += `
      GROUP BY
        o.id,
        o.nome,
        o.slug,
        o.criado_por_usuario_id,
        o.ativo,
        o.criado_em,
        o.atualizado_em
      ORDER BY o.atualizado_em DESC
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

  async obterPorId(organizacaoId) {
    const sql = `
      SELECT
        o.id,
        o.nome,
        o.slug,
        o.criado_por_usuario_id AS criadoPorUsuarioId,
        o.ativo,
        o.criado_em AS criadoEm,
        o.atualizado_em AS atualizadoEm,
        COUNT(DISTINCT CASE WHEN om.status = 'ativo' THEN om.id END) AS membrosCount,
        COUNT(DISTINCT q.id) AS quadrosCount
      FROM organizacoes o
      LEFT JOIN organizacao_membros om
        ON om.organizacao_id = o.id
      LEFT JOIN quadros q
        ON q.organizacao_id = o.id
      WHERE o.id = ?
      GROUP BY
        o.id,
        o.nome,
        o.slug,
        o.criado_por_usuario_id,
        o.ativo,
        o.criado_em,
        o.atualizado_em
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [organizacaoId]);
    return this.mapRowToEntity(rows[0] || null);
  }

  async obterPorSlug(slug) {
    const sql = `
      SELECT
        o.id,
        o.nome,
        o.slug,
        o.criado_por_usuario_id AS criadoPorUsuarioId,
        o.ativo,
        o.criado_em AS criadoEm,
        o.atualizado_em AS atualizadoEm
      FROM organizacoes o
      WHERE o.slug = ?
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [slug]);
    return this.mapRowToEntity(rows[0] || null);
  }

  async criar(dados) {
    const {
      nome,
      slug,
      criadoPorUsuarioId = null,
      ativo = true,
    } = dados;

    const sql = `
      INSERT INTO organizacoes (
        nome,
        slug,
        criado_por_usuario_id,
        ativo,
        criado_em,
        atualizado_em
      )
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;

    const [result] = await db.query(sql, [
      nome,
      slug,
      criadoPorUsuarioId,
      ativo ? 1 : 0,
    ]);

    return this.obterPorId(result.insertId);
  }

  async atualizar(organizacaoId, dados = {}) {
    const campos = [];
    const params = [];

    if (dados.nome !== undefined) {
      campos.push("nome = ?");
      params.push(dados.nome);
    }

    if (dados.slug !== undefined) {
      campos.push("slug = ?");
      params.push(dados.slug);
    }

    if (dados.ativo !== undefined) {
      campos.push("ativo = ?");
      params.push(dados.ativo ? 1 : 0);
    }

    if (campos.length === 0) {
      return this.obterPorId(organizacaoId);
    }

    campos.push("atualizado_em = NOW()");
    params.push(organizacaoId);

    const sql = `
      UPDATE organizacoes
      SET ${campos.join(", ")}
      WHERE id = ?
    `;

    await db.query(sql, params);
    return this.obterPorId(organizacaoId);
  }

  async remover(organizacaoId) {
    const sql = `
      DELETE FROM organizacoes
      WHERE id = ?
    `;

    const [result] = await db.query(sql, [organizacaoId]);
    return result.affectedRows > 0;
  }

  async adicionarMembro(dados) {
    const {
      organizacaoId,
      usuarioId,
      papel = "membro",
      status = "ativo",
    } = dados;

    const sql = `
      INSERT INTO organizacao_membros (
        organizacao_id,
        usuario_id,
        papel,
        status,
        criado_em,
        atualizado_em
      )
      VALUES (?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        papel = VALUES(papel),
        status = VALUES(status),
        atualizado_em = NOW()
    `;

    await db.query(sql, [
      organizacaoId,
      usuarioId,
      papel,
      status,
    ]);

    return this.obterMembroPorUsuarioId(organizacaoId, usuarioId);
  }

  async obterMembroPorUsuarioId(organizacaoId, usuarioId) {
    const sql = `
      SELECT
        om.id,
        om.organizacao_id AS organizacaoId,
        om.usuario_id AS usuarioId,
        om.papel,
        om.status,
        om.criado_em AS criadoEm,
        om.atualizado_em AS atualizadoEm,
        u.nome_exibicao AS nome,
        u.email
      FROM organizacao_membros om
      INNER JOIN usuarios u
        ON u.id = om.usuario_id
      WHERE om.organizacao_id = ?
        AND om.usuario_id = ?
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [organizacaoId, usuarioId]);
    return rows[0] || null;
  }

  async listarMembros(organizacaoId, filtros = {}) {
    const { status, busca, limit, offset } = filtros;

    const where = ["om.organizacao_id = ?"];
    const params = [organizacaoId];

    if (status) {
      where.push("om.status = ?");
      params.push(status);
    }

    if (busca) {
      where.push("(u.nome_exibicao LIKE ? OR u.email LIKE ? OR om.papel LIKE ?)");
      params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`);
    }

    let sql = `
      SELECT
        om.id,
        om.organizacao_id AS organizacaoId,
        om.usuario_id AS usuarioId,
        om.papel,
        om.status,
        om.criado_em AS criadoEm,
        om.atualizado_em AS atualizadoEm,
        u.nome_exibicao AS nome,
        u.email
      FROM organizacao_membros om
      INNER JOIN usuarios u
        ON u.id = om.usuario_id
      WHERE ${where.join(" AND ")}
      ORDER BY om.criado_em DESC
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
    return rows;
  }

  async atualizarMembro(organizacaoId, membroId, dados = {}) {
    const campos = [];
    const params = [];

    if (dados.papel !== undefined) {
      campos.push("papel = ?");
      params.push(dados.papel);
    }

    if (dados.status !== undefined) {
      campos.push("status = ?");
      params.push(dados.status);
    }

    if (campos.length === 0) {
      return this.obterMembroPorId(organizacaoId, membroId);
    }

    campos.push("atualizado_em = NOW()");
    params.push(organizacaoId, membroId);

    const sql = `
      UPDATE organizacao_membros
      SET ${campos.join(", ")}
      WHERE organizacao_id = ?
        AND id = ?
    `;

    await db.query(sql, params);
    return this.obterMembroPorId(organizacaoId, membroId);
  }

  async obterMembroPorId(organizacaoId, membroId) {
    const sql = `
      SELECT
        om.id,
        om.organizacao_id AS organizacaoId,
        om.usuario_id AS usuarioId,
        om.papel,
        om.status,
        om.criado_em AS criadoEm,
        om.atualizado_em AS atualizadoEm,
        u.nome_exibicao AS nome,
        u.email
      FROM organizacao_membros om
      INNER JOIN usuarios u
        ON u.id = om.usuario_id
      WHERE om.organizacao_id = ?
        AND om.id = ?
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [organizacaoId, membroId]);
    return rows[0] || null;
  }

  async removerMembro(organizacaoId, membroId) {
    const sql = `
      DELETE FROM organizacao_membros
      WHERE organizacao_id = ?
        AND id = ?
    `;

    const [result] = await db.query(sql, [organizacaoId, membroId]);
    return result.affectedRows > 0;
  }
}

module.exports = new OrganizacaoRepository();
