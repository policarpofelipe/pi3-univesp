const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

class CartaoRepository {
  mapRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      listaId: row.listaId,
      titulo: row.titulo,
      descricao: row.descricao,
      prioridade: row.prioridade,
      posicao: Number(row.posicao),
      prazoEm: row.prazoEm,
      concluidoEm: row.concluidoEm,
      criadoPorUsuarioId: row.criadoPorUsuarioId,
      arquivadoEm: row.arquivadoEm,
      criadoEm: row.criadoEm,
      atualizadoEm: row.atualizadoEm,
    };
  }

  async listar(quadroId, filtros = {}) {
    const where = ["l.quadro_id = ?", "c.arquivado_em IS NULL"];
    const params = [quadroId];

    if (filtros.listaId) {
      where.push("c.lista_id = ?");
      params.push(filtros.listaId);
    }

    const [rows] = await db.query(
      `
      SELECT
        c.id,
        c.lista_id AS listaId,
        c.titulo,
        c.descricao,
        c.prioridade,
        c.posicao,
        c.prazo_em AS prazoEm,
        c.concluido_em AS concluidoEm,
        c.criado_por_usuario_id AS criadoPorUsuarioId,
        c.arquivado_em AS arquivadoEm,
        c.criado_em AS criadoEm,
        c.atualizado_em AS atualizadoEm
      FROM cartoes c
      INNER JOIN listas l ON l.id = c.lista_id
      WHERE ${where.join(" AND ")}
      ORDER BY c.lista_id ASC, c.posicao ASC, c.id ASC
      `,
      params
    );

    if (!rows.length) return [];

    const cards = rows.map((row) => this.mapRow(row));
    const tagsByCard = await this.listarTagsPorCartoes(cards.map((c) => c.id));
    return cards.map((c) => ({ ...c, tagIds: tagsByCard[c.id] || [] }));
  }

  async obterPorId(quadroId, cartaoId) {
    const [rows] = await db.query(
      `
      SELECT
        c.id,
        c.lista_id AS listaId,
        c.titulo,
        c.descricao,
        c.prioridade,
        c.posicao,
        c.prazo_em AS prazoEm,
        c.concluido_em AS concluidoEm,
        c.criado_por_usuario_id AS criadoPorUsuarioId,
        c.arquivado_em AS arquivadoEm,
        c.criado_em AS criadoEm,
        c.atualizado_em AS atualizadoEm
      FROM cartoes c
      INNER JOIN listas l ON l.id = c.lista_id
      WHERE l.quadro_id = ? AND c.id = ?
      LIMIT 1
      `,
      [quadroId, cartaoId]
    );
    const card = this.mapRow(rows[0] || null);
    if (!card) return null;
    const tags = await this.listarTagsPorCartoes([card.id]);
    return { ...card, tagIds: tags[card.id] || [] };
  }

  async criar({ listaId, titulo, descricao, prioridade, prazoEm, criadoPorUsuarioId, tagIds }) {
    const [maxPosRows] = await db.query(
      "SELECT COALESCE(MAX(posicao), 0) AS maxPos FROM cartoes WHERE lista_id = ? AND arquivado_em IS NULL",
      [listaId]
    );
    const nextPos = Number(maxPosRows[0]?.maxPos || 0) + 1;

    const [result] = await db.query(
      `
      INSERT INTO cartoes (
        lista_id, titulo, descricao, prioridade, posicao, prazo_em, criado_por_usuario_id, criado_em, atualizado_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [listaId, titulo, descricao, prioridade, nextPos, prazoEm, criadoPorUsuarioId]
    );

    if (Array.isArray(tagIds) && tagIds.length) {
      await this.substituirTags(result.insertId, tagIds);
    }

    return result.insertId;
  }

  async atualizar(cartaoId, dados = {}) {
    const campos = [];
    const params = [];
    if (dados.titulo !== undefined) {
      campos.push("titulo = ?");
      params.push(dados.titulo);
    }
    if (dados.descricao !== undefined) {
      campos.push("descricao = ?");
      params.push(dados.descricao);
    }
    if (dados.prioridade !== undefined) {
      campos.push("prioridade = ?");
      params.push(dados.prioridade);
    }
    if (dados.prazoEm !== undefined) {
      campos.push("prazo_em = ?");
      params.push(dados.prazoEm);
    }
    if (campos.length) {
      params.push(cartaoId);
      await db.query(
        `UPDATE cartoes SET ${campos.join(", ")}, atualizado_em = NOW() WHERE id = ?`,
        params
      );
    }
    if (dados.tagIds !== undefined) {
      await this.substituirTags(cartaoId, dados.tagIds || []);
    }
  }

  async mover(quadroId, cartaoId, listaDestinoId, posicaoDestino) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [cardRows] = await conn.query(
        `
        SELECT c.id, c.lista_id AS listaId
        FROM cartoes c
        INNER JOIN listas l ON l.id = c.lista_id
        WHERE c.id = ? AND l.quadro_id = ?
        LIMIT 1
        `,
        [cartaoId, quadroId]
      );
      if (!cardRows.length) {
        await conn.rollback();
        return false;
      }
      const origemId = Number(cardRows[0].listaId);

      const [destRows] = await conn.query(
        "SELECT id FROM listas WHERE id = ? AND quadro_id = ? LIMIT 1",
        [listaDestinoId, quadroId]
      );
      if (!destRows.length) {
        await conn.rollback();
        return null;
      }

      await conn.query(
        "UPDATE cartoes SET lista_id = ?, atualizado_em = NOW() WHERE id = ?",
        [listaDestinoId, cartaoId]
      );

      await this.recalcularPosicoesListaWithConn(conn, origemId);
      await this.recalcularPosicoesListaWithConn(conn, listaDestinoId, cartaoId, posicaoDestino);

      await conn.commit();
      return true;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  async remover(quadroId, cartaoId) {
    const [rows] = await db.query(
      `
      SELECT c.lista_id AS listaId
      FROM cartoes c
      INNER JOIN listas l ON l.id = c.lista_id
      WHERE c.id = ? AND l.quadro_id = ?
      LIMIT 1
      `,
      [cartaoId, quadroId]
    );
    if (!rows.length) return false;
    const listaId = rows[0].listaId;

    const [result] = await db.query(
      "UPDATE cartoes SET arquivado_em = NOW(), atualizado_em = NOW() WHERE id = ? AND arquivado_em IS NULL",
      [cartaoId]
    );
    if (result.affectedRows > 0) {
      await this.recalcularPosicoesLista(listaId);
      return true;
    }
    return false;
  }

  async listarTagsPorCartoes(cartaoIds = []) {
    if (!cartaoIds.length) return {};
    const placeholders = cartaoIds.map(() => "?").join(",");
    const [rows] = await db.query(
      `SELECT cartao_id AS cartaoId, tag_id AS tagId FROM cartao_tags WHERE cartao_id IN (${placeholders})`,
      cartaoIds
    );
    return rows.reduce((acc, row) => {
      if (!acc[row.cartaoId]) acc[row.cartaoId] = [];
      acc[row.cartaoId].push(row.tagId);
      return acc;
    }, {});
  }

  async substituirTags(cartaoId, tagIds = []) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query("DELETE FROM cartao_tags WHERE cartao_id = ?", [cartaoId]);
      const unicos = [...new Set(tagIds.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0))];
      if (unicos.length) {
        const values = unicos.map((tagId) => [cartaoId, tagId, new Date()]);
        await conn.query(
          `
          INSERT INTO cartao_tags (cartao_id, tag_id, criado_em)
          VALUES ?
          `,
          [values]
        );
      }
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  /**
   * Cartões não concluídos nem arquivados com prazo_em <= agora (UTC no servidor).
   */
  async listarCartoesComPrazoVencido({ limit = 200 } = {}) {
    const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 200;
    const [rows] = await db.query(
      `
      SELECT
        c.id AS cartaoId,
        c.lista_id AS listaId,
        l.quadro_id AS quadroId,
        c.titulo,
        c.prazo_em AS prazoEm
      FROM cartoes c
      INNER JOIN listas l ON l.id = c.lista_id
      WHERE c.prazo_em IS NOT NULL
        AND c.prazo_em <= NOW()
        AND c.concluido_em IS NULL
        AND c.arquivado_em IS NULL
      ORDER BY c.prazo_em ASC, c.id ASC
      LIMIT ?
      `,
      [safeLimit]
    );
    return rows;
  }

  async recalcularPosicoesLista(listaId) {
    const conn = await db.getConnection();
    try {
      await this.recalcularPosicoesListaWithConn(conn, listaId);
    } finally {
      conn.release();
    }
  }

  async recalcularPosicoesListaWithConn(conn, listaId, cartaoPrioritarioId = null, posicaoDestino = null) {
    const [rows] = await conn.query(
      "SELECT id FROM cartoes WHERE lista_id = ? AND arquivado_em IS NULL ORDER BY posicao ASC, id ASC",
      [listaId]
    );
    const ids = rows.map((r) => Number(r.id));
    if (cartaoPrioritarioId && ids.includes(Number(cartaoPrioritarioId))) {
      const sem = ids.filter((id) => id !== Number(cartaoPrioritarioId));
      const idx = posicaoDestino == null ? sem.length : Math.max(0, Math.min(Number(posicaoDestino), sem.length));
      sem.splice(idx, 0, Number(cartaoPrioritarioId));
      for (let i = 0; i < sem.length; i += 1) {
        await conn.query("UPDATE cartoes SET posicao = ?, atualizado_em = NOW() WHERE id = ?", [
          i + 1,
          sem[i],
        ]);
      }
      return;
    }
    for (let i = 0; i < ids.length; i += 1) {
      await conn.query("UPDATE cartoes SET posicao = ?, atualizado_em = NOW() WHERE id = ?", [
        i + 1,
        ids[i],
      ]);
    }
  }
}

module.exports = new CartaoRepository();

