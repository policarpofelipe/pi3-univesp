const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

/*
  Convenção assumida de tabelas:
  - quadros
  - quadro_configuracoes

  Campos assumidos em quadros:
  - id
  - organizacao_id
  - nome
  - descricao
  - visibilidade
  - arquivado
  - criado_por
  - criado_em
  - atualizado_em

  Campos assumidos em quadro_configuracoes:
  - quadro_id
  - permitir_convites
  - permitir_comentarios
  - exigir_permissao_mover_cartoes
  - permitir_transicoes_livres
  - atualizado_em

  Se seus nomes reais divergirem, ajuste os SQLs.
*/

class QuadroRepository {
  async listar(filtros = {}) {
    const {
      organizacaoId,
      visibilidade,
      arquivado,
      busca,
      limit,
      offset,
    } = filtros;

    const where = [];
    const params = [];

    if (organizacaoId) {
      where.push("q.organizacao_id = ?");
      params.push(organizacaoId);
    }

    if (visibilidade) {
      where.push("q.visibilidade = ?");
      params.push(visibilidade);
    }

    if (typeof arquivado === "boolean") {
      where.push("q.arquivado = ?");
      params.push(arquivado ? 1 : 0);
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
        q.visibilidade,
        q.arquivado,
        q.criado_por AS criadoPor,
        q.criado_em AS criadoEm,
        q.atualizado_em AS atualizadoEm
      FROM quadros q
    `;

    if (where.length > 0) {
      sql += ` WHERE ${where.join(" AND ")}`;
    }

    sql += " ORDER BY q.atualizado_em DESC";

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

  async obterPorId(quadroId) {
    const sql = `
      SELECT
        q.id,
        q.organizacao_id AS organizacaoId,
        q.nome,
        q.descricao,
        q.visibilidade,
        q.arquivado,
        q.criado_por AS criadoPor,
        q.criado_em AS criadoEm,
        q.atualizado_em AS atualizadoEm
      FROM quadros q
      WHERE q.id = ?
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [quadroId]);
    return rows[0] || null;
  }

  async criar(dados) {
    const {
      organizacaoId,
      nome,
      descricao = null,
      visibilidade = "privado",
      criadoPor = null,
    } = dados;

    const sql = `
      INSERT INTO quadros (
        organizacao_id,
        nome,
        descricao,
        visibilidade,
        arquivado,
        criado_por,
        criado_em,
        atualizado_em
      )
      VALUES (?, ?, ?, ?, 0, ?, NOW(), NOW())
    `;

    const [result] = await db.query(sql, [
      organizacaoId,
      nome,
      descricao,
      visibilidade,
      criadoPor,
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

    if (dados.visibilidade !== undefined) {
      campos.push("visibilidade = ?");
      params.push(dados.visibilidade);
    }

    if (dados.arquivado !== undefined) {
      campos.push("arquivado = ?");
      params.push(dados.arquivado ? 1 : 0);
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
    const sql = "DELETE FROM quadros WHERE id = ?";
    const [result] = await db.query(sql, [quadroId]);
    return result.affectedRows > 0;
  }

  async obterConfiguracoes(quadroId) {
    const sql = `
      SELECT
        qc.quadro_id AS quadroId,
        qc.permitir_convites AS permitirConvites,
        qc.permitir_comentarios AS permitirComentarios,
        qc.exigir_permissao_mover_cartoes AS exigirPermissaoMoverCartoes,
        qc.permitir_transicoes_livres AS permitirTransicoesLivres,
        qc.atualizado_em AS atualizadoEm
      FROM quadro_configuracoes qc
      WHERE qc.quadro_id = ?
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [quadroId]);
    return rows[0] || null;
  }

  async criarConfiguracoesPadrao(quadroId) {
    const sql = `
      INSERT INTO quadro_configuracoes (
        quadro_id,
        permitir_convites,
        permitir_comentarios,
        exigir_permissao_mover_cartoes,
        permitir_transicoes_livres,
        atualizado_em
      )
      VALUES (?, 1, 1, 0, 1, NOW())
    `;

    await db.query(sql, [quadroId]);
    return this.obterConfiguracoes(quadroId);
  }

  async atualizarConfiguracoes(quadroId, dados) {
    const sql = `
      INSERT INTO quadro_configuracoes (
        quadro_id,
        permitir_convites,
        permitir_comentarios,
        exigir_permissao_mover_cartoes,
        permitir_transicoes_livres,
        atualizado_em
      )
      VALUES (?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        permitir_convites = VALUES(permitir_convites),
        permitir_comentarios = VALUES(permitir_comentarios),
        exigir_permissao_mover_cartoes = VALUES(exigir_permissao_mover_cartoes),
        permitir_transicoes_livres = VALUES(permitir_transicoes_livres),
        atualizado_em = NOW()
    `;

    await db.query(sql, [
      quadroId,
      dados.permitirConvites ? 1 : 0,
      dados.permitirComentarios ? 1 : 0,
      dados.exigirPermissaoMoverCartoes ? 1 : 0,
      dados.permitirTransicoesLivres ? 1 : 0,
    ]);

    return this.obterConfiguracoes(quadroId);
  }

  async arquivar(quadroId) {
    const sql = `
      UPDATE quadros
      SET arquivado = 1,
          atualizado_em = NOW()
      WHERE id = ?
    `;

    await db.query(sql, [quadroId]);
    return this.obterPorId(quadroId);
  }

  async desarquivar(quadroId) {
    const sql = `
      UPDATE quadros
      SET arquivado = 0,
          atualizado_em = NOW()
      WHERE id = ?
    `;

    await db.query(sql, [quadroId]);
    return this.obterPorId(quadroId);
  }
}

module.exports = new QuadroRepository();
