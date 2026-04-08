const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;


class QuadroPapelRepository {
  async listar(quadroId, filtros = {}) {
    const { busca, limit, offset } = filtros;

    const where = ["qp.quadro_id = ?"];
    const params = [quadroId];

    if (busca) {
      where.push("(qp.nome LIKE ? OR qp.descricao LIKE ?)");
      params.push(`%${busca}%`, `%${busca}%`);
    }

    let sql = `
      SELECT
        qp.id,
        qp.quadro_id AS quadroId,
        qp.nome,
        qp.descricao,
        qp.criado_em AS criadoEm,
        qp.atualizado_em AS atualizadoEm,
        COALESCE(COUNT(qm.id), 0) AS membros,
        qpp.visualizar_quadro AS visualizarQuadro,
        qpp.editar_quadro AS editarQuadro,
        qpp.excluir_quadro AS excluirQuadro,
        qpp.gerenciar_membros AS gerenciarMembros,
        qpp.mover_cartoes AS moverCartoes,
        qpp.editar_listas AS editarListas
      FROM quadro_papeis qp
      LEFT JOIN quadro_papel_permissoes qpp
        ON qpp.papel_id = qp.id
      LEFT JOIN quadro_membros qm
        ON qm.papel_id = qp.id
       AND qm.quadro_id = qp.quadro_id
       AND qm.status = 'ativo'
      WHERE ${where.join(" AND ")}
      GROUP BY
        qp.id,
        qp.quadro_id,
        qp.nome,
        qp.descricao,
        qp.criado_em,
        qp.atualizado_em,
        qpp.visualizar_quadro,
        qpp.editar_quadro,
        qpp.excluir_quadro,
        qpp.gerenciar_membros,
        qpp.mover_cartoes,
        qpp.editar_listas
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

    return rows.map(this.#mapRowToEntity);
  }

  async obterPorId(quadroId, papelId) {
    const sql = `
      SELECT
        qp.id,
        qp.quadro_id AS quadroId,
        qp.nome,
        qp.descricao,
        qp.criado_em AS criadoEm,
        qp.atualizado_em AS atualizadoEm,
        COALESCE(COUNT(qm.id), 0) AS membros,
        qpp.visualizar_quadro AS visualizarQuadro,
        qpp.editar_quadro AS editarQuadro,
        qpp.excluir_quadro AS excluirQuadro,
        qpp.gerenciar_membros AS gerenciarMembros,
        qpp.mover_cartoes AS moverCartoes,
        qpp.editar_listas AS editarListas
      FROM quadro_papeis qp
      LEFT JOIN quadro_papel_permissoes qpp
        ON qpp.papel_id = qp.id
      LEFT JOIN quadro_membros qm
        ON qm.papel_id = qp.id
       AND qm.quadro_id = qp.quadro_id
       AND qm.status = 'ativo'
      WHERE qp.quadro_id = ?
        AND qp.id = ?
      GROUP BY
        qp.id,
        qp.quadro_id,
        qp.nome,
        qp.descricao,
        qp.criado_em,
        qp.atualizado_em,
        qpp.visualizar_quadro,
        qpp.editar_quadro,
        qpp.excluir_quadro,
        qpp.gerenciar_membros,
        qpp.mover_cartoes,
        qpp.editar_listas
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [quadroId, papelId]);
    return rows[0] ? this.#mapRowToEntity(rows[0]) : null;
  }

  async criar(dados) {
    const {
      quadroId,
      nome,
      descricao = null,
      permissoes = {},
    } = dados;

    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      const sqlPapel = `
        INSERT INTO quadro_papeis (
          quadro_id,
          nome,
          descricao,
          criado_em,
          atualizado_em
        )
        VALUES (?, ?, ?, NOW(), NOW())
      `;

      const [result] = await conn.query(sqlPapel, [
        quadroId,
        nome,
        descricao,
      ]);

      const papelId = result.insertId;

      const sqlPermissoes = `
        INSERT INTO quadro_papel_permissoes (
          papel_id,
          visualizar_quadro,
          editar_quadro,
          excluir_quadro,
          gerenciar_membros,
          mover_cartoes,
          editar_listas,
          atualizado_em
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      await conn.query(sqlPermissoes, [
        papelId,
        permissoes.visualizarQuadro ? 1 : 0,
        permissoes.editarQuadro ? 1 : 0,
        permissoes.excluirQuadro ? 1 : 0,
        permissoes.gerenciarMembros ? 1 : 0,
        permissoes.moverCartoes ? 1 : 0,
        permissoes.editarListas ? 1 : 0,
      ]);

      await conn.commit();

      return this.obterPorId(quadroId, papelId);
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
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
    const sql = `
      INSERT INTO quadro_papel_permissoes (
        papel_id,
        visualizar_quadro,
        editar_quadro,
        excluir_quadro,
        gerenciar_membros,
        mover_cartoes,
        editar_listas,
        atualizado_em
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        visualizar_quadro = VALUES(visualizar_quadro),
        editar_quadro = VALUES(editar_quadro),
        excluir_quadro = VALUES(excluir_quadro),
        gerenciar_membros = VALUES(gerenciar_membros),
        mover_cartoes = VALUES(mover_cartoes),
        editar_listas = VALUES(editar_listas),
        atualizado_em = NOW()
    `;

    await db.query(sql, [
      papelId,
      permissoes.visualizarQuadro ? 1 : 0,
      permissoes.editarQuadro ? 1 : 0,
      permissoes.excluirQuad
