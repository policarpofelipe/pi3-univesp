const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

class QuadroMembroRepository {
  mapRowToEntity(row) {
    if (!row) return null;

    return {
      id: row.id,
      quadroId: row.quadroId,
      usuarioId: row.usuarioId,
      nome: row.nome,
      email: row.email,
      status: row.status,
      criadoEm: row.criadoEm,
      atualizadoEm: row.atualizadoEm,
      papeis: row.papeis || [],
    };
  }

  async listar(quadroId, filtros = {}) {
    const { status, busca, limit, offset } = filtros;

    const where = ["qm.quadro_id = ?"];
    const params = [quadroId];

    if (status) {
      where.push("qm.status = ?");
      params.push(status);
    }

    if (busca) {
      where.push("(u.nome_exibicao LIKE ? OR u.email LIKE ?)");
      params.push(`%${busca}%`, `%${busca}%`);
    }

    let sql = `
      SELECT
        qm.id,
        qm.quadro_id AS quadroId,
        qm.usuario_id AS usuarioId,
        qm.status,
        qm.criado_em AS criadoEm,
        qm.atualizado_em AS atualizadoEm,
        u.nome_exibicao AS nome,
        u.email
      FROM quadro_membros qm
      INNER JOIN usuarios u
        ON u.id = qm.usuario_id
      WHERE ${where.join(" AND ")}
      ORDER BY qm.criado_em DESC
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

    if (rows.length === 0) {
      return [];
    }

    const membroIds = rows.map((row) => row.id);
    const papeisPorMembro = await this.listarPapeisPorMembroIds(membroIds);

    return rows.map((row) =>
      this.mapRowToEntity({
        ...row,
        papeis: papeisPorMembro[row.id] || [],
      })
    );
  }

  async obterPorId(quadroId, membroId) {
    const sql = `
      SELECT
        qm.id,
        qm.quadro_id AS quadroId,
        qm.usuario_id AS usuarioId,
        qm.status,
        qm.criado_em AS criadoEm,
        qm.atualizado_em AS atualizadoEm,
        u.nome_exibicao AS nome,
        u.email
      FROM quadro_membros qm
      INNER JOIN usuarios u
        ON u.id = qm.usuario_id
      WHERE qm.quadro_id = ?
        AND qm.id = ?
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [quadroId, membroId]);
    const row = rows[0];

    if (!row) {
      return null;
    }

    const papeisPorMembro = await this.listarPapeisPorMembroIds([row.id]);

    return this.mapRowToEntity({
      ...row,
      papeis: papeisPorMembro[row.id] || [],
    });
  }

  async obterPorUsuarioId(quadroId, usuarioId) {
    const sql = `
      SELECT
        qm.id,
        qm.quadro_id AS quadroId,
        qm.usuario_id AS usuarioId,
        qm.status,
        qm.criado_em AS criadoEm,
        qm.atualizado_em AS atualizadoEm,
        u.nome_exibicao AS nome,
        u.email
      FROM quadro_membros qm
      INNER JOIN usuarios u
        ON u.id = qm.usuario_id
      WHERE qm.quadro_id = ?
        AND qm.usuario_id = ?
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [quadroId, usuarioId]);
    const row = rows[0];

    if (!row) {
      return null;
    }

    const papeisPorMembro = await this.listarPapeisPorMembroIds([row.id]);

    return this.mapRowToEntity({
      ...row,
      papeis: papeisPorMembro[row.id] || [],
    });
  }

  async adicionar(dados) {
    const {
      quadroId,
      usuarioId,
      status = "ativo",
      papelIds = [],
    } = dados;

    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      const sql = `
        INSERT INTO quadro_membros (
          quadro_id,
          usuario_id,
          status,
          criado_em,
          atualizado_em
        )
        VALUES (?, ?, ?, NOW(), NOW())
      `;

      const [result] = await conn.query(sql, [quadroId, usuarioId, status]);
      const membroId = result.insertId;

      if (Array.isArray(papelIds) && papelIds.length > 0) {
        const values = papelIds.map((papelId) => [membroId, papelId]);

        await conn.query(
          `
            INSERT INTO quadro_membro_papeis (
              quadro_membro_id,
              papel_id,
              criado_em
            )
            VALUES ?
          `,
          [values.map(([quadroMembroId, papelId]) => [quadroMembroId, papelId, new Date()])]
        );
      }

      await conn.commit();
      return this.obterPorId(quadroId, membroId);
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  async atualizar(quadroId, membroId, dados) {
    const campos = [];
    const params = [];

    if (dados.status !== undefined) {
      campos.push("status = ?");
      params.push(dados.status);
    }

    if (campos.length > 0) {
      campos.push("atualizado_em = NOW()");
      params.push(quadroId, membroId);

      const sql = `
        UPDATE quadro_membros
        SET ${campos.join(", ")}
        WHERE quadro_id = ?
          AND id = ?
      `;

      await db.query(sql, params);
    }

    if (Array.isArray(dados.papelIds)) {
      await this.substituirPapeis(membroId, dados.papelIds);
    }

    return this.obterPorId(quadroId, membroId);
  }

  async atualizarPapeis(quadroId, membroId, papelIds = []) {
    await this.substituirPapeis(membroId, papelIds);
    return this.obterPorId(quadroId, membroId);
  }

  async remover(quadroId, membroId) {
    const sql = `
      DELETE FROM quadro_membros
      WHERE quadro_id = ?
        AND id = ?
    `;

    const [result] = await db.query(sql, [quadroId, membroId]);
    return result.affectedRows > 0;
  }

  async contarPorQuadro(quadroId, filtros = {}) {
    const where = ["quadro_id = ?"];
    const params = [quadroId];

    if (filtros.status) {
      where.push("status = ?");
      params.push(filtros.status);
    }

    const sql = `
      SELECT COUNT(*) AS total
      FROM quadro_membros
      WHERE ${where.join(" AND ")}
    `;

    const [rows] = await db.query(sql, params);
    return Number(rows[0]?.total || 0);
  }

  async listarPapeisPorMembroIds(membroIds = []) {
    if (!Array.isArray(membroIds) || membroIds.length === 0) {
      return {};
    }

    const placeholders = membroIds.map(() => "?").join(",");

    const sql = `
      SELECT
        qmp.quadro_membro_id AS quadroMembroId,
        qp.id,
        qp.nome,
        qp.descricao,
        qp.ativo
      FROM quadro_membro_papeis qmp
      INNER JOIN quadro_papeis qp
        ON qp.id = qmp.papel_id
      WHERE qmp.quadro_membro_id IN (${placeholders})
      ORDER BY qp.nome ASC
    `;

    const [rows] = await db.query(sql, membroIds);

    return rows.reduce((acc, row) => {
      if (!acc[row.quadroMembroId]) {
        acc[row.quadroMembroId] = [];
      }

      acc[row.quadroMembroId].push({
        id: row.id,
        nome: row.nome,
        descricao: row.descricao,
        ativo: Boolean(row.ativo),
      });

      return acc;
    }, {});
  }

  async substituirPapeis(membroId, papelIds = []) {
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      await conn.query(
        `
          DELETE FROM quadro_membro_papeis
          WHERE quadro_membro_id = ?
        `,
        [membroId]
      );

      if (Array.isArray(papelIds) && papelIds.length > 0) {
        const sql = `
          INSERT INTO quadro_membro_papeis (
            quadro_membro_id,
            papel_id,
            criado_em
          )
          VALUES ?
        `;

        const values = papelIds.map((papelId) => [membroId, papelId, new Date()]);
        await conn.query(sql, [values]);
      }

      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
}

module.exports = new QuadroMembroRepository();
