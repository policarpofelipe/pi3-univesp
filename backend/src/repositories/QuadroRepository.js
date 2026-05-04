const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

class QuadroRepository {
  mapRowToEntity(row) {
    if (!row) return null;

    return {
      id: row.id,
      organizacaoId: row.organizacaoId,
      nome: row.nome,
      descricao: row.descricao,
      criadoPorUsuarioId: row.criadoPorUsuarioId,
      arquivadoEm: row.arquivadoEm,
      arquivado: Boolean(row.arquivadoEm),
      criadoEm: row.criadoEm,
      atualizadoEm: row.atualizadoEm,
      totalMembros: row.totalMembros !== undefined ? Number(row.totalMembros) : undefined,
      totalPapeis: row.totalPapeis !== undefined ? Number(row.totalPapeis) : undefined,
      totalListas: row.totalListas !== undefined ? Number(row.totalListas) : undefined,
    };
  }

  async listar(filtros = {}) {
    const {
      organizacaoId,
      criadoPorUsuarioId,
      usuarioId,
      arquivado,
      busca,
      limit,
      offset,
    } = filtros;

    const where = [];
    const params = [];

    let joinMembroAtual = "";
    if (usuarioId) {
      joinMembroAtual = `
      INNER JOIN quadro_membros qm_self
        ON qm_self.quadro_id = q.id
       AND qm_self.usuario_id = ?
       AND qm_self.status = 'ativo'`;
      params.push(usuarioId);
    }

    if (organizacaoId) {
      where.push("q.organizacao_id = ?");
      params.push(organizacaoId);
    }

    if (criadoPorUsuarioId) {
      where.push("q.criado_por_usuario_id = ?");
      params.push(criadoPorUsuarioId);
    }

    if (typeof arquivado === "boolean") {
      where.push(arquivado ? "q.arquivado_em IS NOT NULL" : "q.arquivado_em IS NULL");
    }

    if (busca) {
      where.push("(q.nome LIKE ? OR q.descricao LIKE ?)");
      params.push(`%${busca}%`, `%${busca}%`);
    }

    let sql = `
      SELECT
        q.id,
        q.organizacao_id AS organizacaoId,
        q.nome,
        q.descricao,
        q.criado_por_usuario_id AS criadoPorUsuarioId,
        q.arquivado_em AS arquivadoEm,
        q.criado_em AS criadoEm,
        q.atualizado_em AS atualizadoEm,
        COUNT(DISTINCT qm.id) AS totalMembros,
        COUNT(DISTINCT qp.id) AS totalPapeis,
        COUNT(DISTINCT l.id) AS totalListas
      FROM quadros q
      ${joinMembroAtual}
      LEFT JOIN quadro_membros qm
        ON qm.quadro_id = q.id
       AND qm.status = 'ativo'
      LEFT JOIN quadro_papeis qp
        ON qp.quadro_id = q.id
       AND qp.ativo = 1
      LEFT JOIN listas l
        ON l.quadro_id = q.id
      ${where.length > 0 ? `WHERE ${where.join(" AND ")}` : ""}
      GROUP BY
        q.id,
        q.organizacao_id,
        q.nome,
        q.descricao,
        q.criado_por_usuario_id,
        q.arquivado_em,
        q.criado_em,
        q.atualizado_em
      ORDER BY q.atualizado_em DESC
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

  async obterPorId(quadroId) {
    const sql = `
      SELECT
        q.id,
        q.organizacao_id AS organizacaoId,
        q.nome,
        q.descricao,
        q.criado_por_usuario_id AS criadoPorUsuarioId,
        q.arquivado_em AS arquivadoEm,
        q.criado_em AS criadoEm,
        q.atualizado_em AS atualizadoEm,
        COUNT(DISTINCT qm.id) AS totalMembros,
        COUNT(DISTINCT qp.id) AS totalPapeis,
        COUNT(DISTINCT l.id) AS totalListas
      FROM quadros q
      LEFT JOIN quadro_membros qm
        ON qm.quadro_id = q.id
       AND qm.status = 'ativo'
      LEFT JOIN quadro_papeis qp
        ON qp.quadro_id = q.id
       AND qp.ativo = 1
      LEFT JOIN listas l
        ON l.quadro_id = q.id
      WHERE q.id = ?
      GROUP BY
        q.id,
        q.organizacao_id,
        q.nome,
        q.descricao,
        q.criado_por_usuario_id,
        q.arquivado_em,
        q.criado_em,
        q.atualizado_em
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [quadroId]);
    return this.mapRowToEntity(rows[0] || null);
  }

  async obterResumo(quadroId) {
    const quadro = await this.obterPorId(quadroId);
    if (!quadro) return null;

    const [totalsRows] = await db.query(
      `
      SELECT
        COUNT(DISTINCT l.id) AS totalListas,
        COUNT(c.id) AS totalCartoes,
        COALESCE(SUM(
          CASE
            WHEN c.prazo_em IS NOT NULL
              AND c.prazo_em < NOW()
              AND c.concluido_em IS NULL
              AND c.arquivado_em IS NULL
            THEN 1
            ELSE 0
          END
        ), 0) AS cartoesVencidos
      FROM listas l
      LEFT JOIN cartoes c
        ON c.lista_id = l.id
       AND c.arquivado_em IS NULL
      WHERE l.quadro_id = ?
        AND l.ativa = 1
      `,
      [quadroId]
    );

    const [porListaRows] = await db.query(
      `
      SELECT
        l.id AS listaId,
        l.nome AS lista,
        COUNT(c.id) AS total
      FROM listas l
      LEFT JOIN cartoes c
        ON c.lista_id = l.id
       AND c.arquivado_em IS NULL
      WHERE l.quadro_id = ?
        AND l.ativa = 1
      GROUP BY l.id, l.nome, l.posicao_padrao
      ORDER BY l.posicao_padrao ASC, l.id ASC
      `,
      [quadroId]
    );

    const [porPrioridadeRows] = await db.query(
      `
      SELECT
        c.prioridade AS prioridade,
        COUNT(c.id) AS total
      FROM cartoes c
      INNER JOIN listas l
        ON l.id = c.lista_id
      WHERE l.quadro_id = ?
        AND l.ativa = 1
        AND c.arquivado_em IS NULL
      GROUP BY c.prioridade
      `,
      [quadroId]
    );

    const cartoesPorPrioridade = {
      baixa: 0,
      media: 0,
      alta: 0,
      urgente: 0,
    };

    porPrioridadeRows.forEach((row) => {
      const chave = String(row.prioridade || "").toLowerCase();
      if (Object.prototype.hasOwnProperty.call(cartoesPorPrioridade, chave)) {
        cartoesPorPrioridade[chave] = Number(row.total) || 0;
      }
    });

    const totals = totalsRows[0] || {};

    return {
      quadro: {
        id: quadro.id,
        nome: quadro.nome,
        descricao: quadro.descricao,
      },
      totalListas: Number(totals.totalListas) || 0,
      totalCartoes: Number(totals.totalCartoes) || 0,
      cartoesPorLista: porListaRows.map((row) => ({
        listaId: Number(row.listaId),
        lista: row.lista,
        total: Number(row.total) || 0,
      })),
      cartoesPorPrioridade,
      cartoesVencidos: Number(totals.cartoesVencidos) || 0,
    };
  }

  async criar(dados) {
    const {
      organizacaoId,
      nome,
      descricao = null,
      criadoPorUsuarioId = null,
    } = dados;

    const sql = `
      INSERT INTO quadros (
        organizacao_id,
        nome,
        descricao,
        criado_por_usuario_id,
        arquivado_em,
        criado_em,
        atualizado_em
      )
      VALUES (?, ?, ?, ?, NULL, NOW(), NOW())
    `;

    const [result] = await db.query(sql, [
      organizacaoId,
      nome,
      descricao,
      criadoPorUsuarioId,
    ]);

    return this.obterPorId(result.insertId);
  }

  async atualizar(quadroId, dados) {
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

    if (dados.criadoPorUsuarioId !== undefined) {
      campos.push("criado_por_usuario_id = ?");
      params.push(dados.criadoPorUsuarioId);
    }

    if (campos.length === 0) {
      return this.obterPorId(quadroId);
    }

    campos.push("atualizado_em = NOW()");
    params.push(quadroId);

    const sql = `
      UPDATE quadros
      SET ${campos.join(", ")}
      WHERE id = ?
    `;

    await db.query(sql, params);
    return this.obterPorId(quadroId);
  }

  async remover(quadroId) {
    const sql = `
      DELETE FROM quadros
      WHERE id = ?
    `;

    const [result] = await db.query(sql, [quadroId]);
    return result.affectedRows > 0;
  }

  async arquivar(quadroId) {
    const sql = `
      UPDATE quadros
      SET arquivado_em = NOW(),
          atualizado_em = NOW()
      WHERE id = ?
    `;

    await db.query(sql, [quadroId]);
    return this.obterPorId(quadroId);
  }

  async desarquivar(quadroId) {
    const sql = `
      UPDATE quadros
      SET arquivado_em = NULL,
          atualizado_em = NOW()
      WHERE id = ?
    `;

    await db.query(sql, [quadroId]);
    return this.obterPorId(quadroId);
  }

  async obterPreferenciasUsuario(quadroId, usuarioId) {
    const sql = `
      SELECT
        qpu.id,
        qpu.quadro_id AS quadroId,
        qpu.usuario_id AS usuarioId,
        qpu.tema,
        qpu.cor_fundo AS corFundo,
        qpu.compacto,
        qpu.atualizado_em AS atualizadoEm
      FROM quadro_preferencias_usuario qpu
      WHERE qpu.quadro_id = ?
        AND qpu.usuario_id = ?
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [quadroId, usuarioId]);
    const row = rows[0];
    if (!row) return null;
    return {
      ...row,
      compacto: Boolean(row.compacto),
    };
  }

  async atualizarPreferenciasUsuario(quadroId, usuarioId, dados = {}) {
    const sql = `
      INSERT INTO quadro_preferencias_usuario (
        quadro_id,
        usuario_id,
        tema,
        cor_fundo,
        compacto,
        atualizado_em
      )
      VALUES (?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        tema = VALUES(tema),
        cor_fundo = VALUES(cor_fundo),
        compacto = VALUES(compacto),
        atualizado_em = NOW()
    `;

    await db.query(sql, [
      quadroId,
      usuarioId,
      dados.tema || "sistema",
      dados.corFundo || null,
      dados.compacto ? 1 : 0,
    ]);

    return this.obterPreferenciasUsuario(quadroId, usuarioId);
  }
}

module.exports = new QuadroRepository();
