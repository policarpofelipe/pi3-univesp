const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

/*
  Convenção assumida de tabela:
  - quadro_membros

  Campos assumidos:
  - id
  - quadro_id
  - usuario_id
  - papel_id
  - email_convite
  - status                // ativo | pendente | removido
  - convidado_por
  - criado_em
  - atualizado_em

  Tabelas auxiliares assumidas:
  - usuarios (id, nome_exibicao, email)
  - quadro_papeis (id, nome)

  Ajuste os nomes caso sua modelagem real use outra convenção.
*/

class QuadroMembroRepository {
  async listar(quadroId, filtros = {}) {
    const { status, busca, limit, offset } = filtros;

    const where = ["qm.quadro_id = ?"];
    const params = [quadroId];

    if (status) {
      where.push("qm.status = ?");
      params.push(status);
    }

    if (busca) {
      where.push(`
        (
          u.nome_exibicao LIKE ?
          OR u.email LIKE ?
          OR qp.nome LIKE ?
          OR qm.email_convite LIKE ?
        )
      `);
      params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`, `%${busca}%`);
    }

    let sql = `
      SELECT
        qm.id,
        qm.quadro_id AS quadroId,
        qm.usuario_id AS usuarioId,
        qm.papel_id AS papelId,
        qm.email_convite AS emailConvite,
        qm.status,
        qm.convidado_por AS convidadoPor,
        qm.criado_em AS criadoEm,
        qm.atualizado_em AS atualizadoEm,
        u.nome_exibicao AS nome,
        u.email,
        qp.nome AS papel
      FROM quadro_membros qm
      LEFT JOIN usuarios u
        ON u.id = qm.usuario_id
      LEFT JOIN quadro_papeis qp
        ON qp.id = qm.papel_id
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
    return rows;
  }

  async obterPorId(quadroId, membroId) {
    const sql = `
      SELECT
        qm.id,
        qm.quadro_id AS quadroId,
        qm.usuario_id AS usuarioId,
        qm.papel_id AS papelId,
        qm.email_convite AS emailConvite,
        qm.status,
        qm.convidado_por AS convidadoPor,
        qm.criado_em AS criadoEm,
        qm.atualizado_em AS atualizadoEm,
        u.nome_exibicao AS nome,
        u.email,
        qp.nome AS papel
      FROM quadro_membros qm
      LEFT JOIN usuarios u
        ON u.id = qm.usuario_id
      LEFT JOIN quadro_papeis qp
        ON qp.id = qm.papel_id
      WHERE qm.quadro_id = ?
        AND qm.id = ?
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [quadroId, membroId]);
    return rows[0] || null;
  }

  async obterPorUsuarioId(quadroId, usuarioId) {
    const sql = `
      SELECT
        qm.id,
        qm.quadro_id AS quadroId,
        qm.usuario_id AS usuarioId,
        qm.papel_id AS papelId,
        qm.email_convite AS emailConvite,
        qm.status,
        qm.convidado_por AS convidadoPor,
        qm.criado_em AS criadoEm,
        qm.atualizado_em AS atualizadoEm
      FROM quadro_membros qm
      WHERE qm.quadro_id = ?
        AND qm.usuario_id = ?
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [quadroId, usuarioId]);
    return rows[0] || null;
  }

  async obterPorEmailConvite(quadroId, emailConvite) {
    const sql = `
      SELECT
        qm.id,
        qm.quadro_id AS quadroId,
        qm.usuario_id AS usuarioId,
        qm.papel_id AS papelId,
        qm.email_convite AS emailConvite,
        qm.status,
        qm.convidado_por AS convidadoPor,
        qm.criado_em AS criadoEm,
        qm.atualizado_em AS atualizadoEm
      FROM quadro_membros qm
      WHERE qm.quadro_id = ?
        AND qm.email_convite = ?
      LIMIT 1
    `;

    const [rows] = await db.query(sql, [quadroId, emailConvite]);
    return rows[0] || null;
  }

  async adicionar(dados) {
    const {
      quadroId,
      usuarioId = null,
      papelId = null,
      emailConvite = null,
      status = "ativo",
      convidadoPor = null,
    } = dados;

    const sql = `
      INSERT INTO quadro_membros (
        quadro_id,
        usuario_id,
        papel_id,
        email_convite,
        status,
        convidado_por,
        criado_em,
        atualizado_em
      )
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const [result] = await db.query(sql, [
      quadroId,
      usuarioId,
      papelId,
      emailConvite,
      status,
      convidadoPor,
    ]);

    return this.obterPorId(quadroId, result.insertId);
  }

  async convidar(dados) {
    return this.adicionar({
      ...dados,
      usuarioId: null,
      status: "pendente",
    });
  }

  async atualizar(quadroId, membroId, dados) {
    const campos = [];
    const params = [];

    if (dados.usuarioId !== undefined) {
      campos.push("usuario_id = ?");
      params.push(dados.usuarioId);
    }

    if (dados.papelId !== undefined) {
      campos.push("papel_id = ?");
      params.push(dados.papelId);
    }

    if (dados.emailConvite !== undefined) {
      campos.push("email_convite = ?");
      params.push(dados.emailConvite);
    }

    if (dados.status !== undefined) {
      campos.push("status = ?");
      params.push(dados.status);
    }

    if (dados.convidadoPor !== undefined) {
      campos.push("convidado_por = ?");
      params.push(dados.convidadoPor);
    }

    if (campos.length === 0) {
      return this.obterPorId(quadroId, membroId);
    }

    campos.push("atualizado_em = NOW()");
    params.push(quadroId, membroId);

    const sql = `
      UPDATE quadro_membros
      SET ${campos.join(", ")}
      WHERE quadro_id = ?
        AND id = ?
    `;

    await db.query(sql, params);
    return this.obterPorId(quadroId, membroId);
  }

  async atualizarPapel(quadroId, membroId, papelId) {
    const sql = `
      UPDATE quadro_membros
      SET papel_id = ?,
          atualizado_em = NOW()
      WHERE quadro_id = ?
        AND id = ?
    `;

    await db.query(sql, [papelId, quadroId, membroId]);
    return this.obterPorId(quadroId, membroId);
  }

  async reenviarConvite(quadroId, membroId) {
    const sql = `
      UPDATE quadro_membros
      SET atualizado_em = NOW()
      WHERE quadro_id = ?
        AND id = ?
        AND status = 'pendente'
    `;

    await db.query(sql, [quadroId, membroId]);
    return this.obterPorId(quadroId, membroId);
  }

  async remover(quadroId, membroId) {
    const sql = `
      DELETE FROM quadro_membros
      WHERE quadro_id = ?
        AND id = ?
    `;

    const [result] = await db.query(sql, [quadroId, membroId]);
