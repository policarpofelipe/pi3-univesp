const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

class ConviteRepository {
  async findPendentePorQuadroEUsuario(quadroId, usuarioConvidadoId) {
    const [rows] = await db.query(
      `
      SELECT id
      FROM quadro_convites
      WHERE quadro_id = ?
        AND usuario_convidado_id = ?
        AND status = 'pendente'
      LIMIT 1
      `,
      [quadroId, usuarioConvidadoId]
    );
    return rows[0] ? Number(rows[0].id) : null;
  }

  async obterPorId(conviteId) {
    const [rows] = await db.query(
      `
      SELECT
        qc.id,
        qc.quadro_id AS quadroId,
        qc.usuario_convidado_id AS usuarioConvidadoId,
        qc.email_convidado AS emailConvidado,
        qc.convidado_por_usuario_id AS convidadoPorUsuarioId,
        qc.status,
        qc.mensagem,
        qc.criado_em AS criadoEm,
        qc.respondido_em AS respondidoEm,
        qc.expira_em AS expiraEm
      FROM quadro_convites qc
      WHERE qc.id = ?
      LIMIT 1
      `,
      [conviteId]
    );
    return rows[0] || null;
  }

  async listarPapeisPorConviteId(conviteId) {
    const [rows] = await db.query(
      `
      SELECT
        qp.id,
        qp.nome
      FROM quadro_convite_papeis qcp
      INNER JOIN quadro_papeis qp
        ON qp.id = qcp.papel_id
      WHERE qcp.convite_id = ?
      ORDER BY qp.nome ASC
      `,
      [conviteId]
    );
    return rows.map((r) => ({ id: Number(r.id), nome: r.nome }));
  }

  async listarPendentesPorUsuarioId(usuarioId) {
    const [rows] = await db.query(
      `
      SELECT
        qc.id,
        qc.quadro_id AS quadroId,
        qc.usuario_convidado_id AS usuarioConvidadoId,
        qc.email_convidado AS emailConvidado,
        qc.convidado_por_usuario_id AS convidadoPorUsuarioId,
        qc.status,
        qc.mensagem,
        qc.criado_em AS criadoEm,
        qc.respondido_em AS respondidoEm,
        qc.expira_em AS expiraEm
      FROM quadro_convites qc
      WHERE qc.usuario_convidado_id = ?
        AND qc.status = 'pendente'
      ORDER BY qc.criado_em DESC
      `,
      [usuarioId]
    );
    return rows;
  }

  async listarPorQuadroId(quadroId, statuses = []) {
    const allowed = new Set(["pendente", "recusado", "aceito", "cancelado", "expirado"]);
    const list = Array.isArray(statuses)
      ? statuses.filter((s) => allowed.has(String(s || "").toLowerCase()))
      : [];
    const whereStatus = list.length
      ? `AND qc.status IN (${list.map(() => "?").join(", ")})`
      : "";

    const [rows] = await db.query(
      `
      SELECT
        qc.id,
        qc.quadro_id AS quadroId,
        qc.usuario_convidado_id AS usuarioConvidadoId,
        qc.email_convidado AS emailConvidado,
        qc.convidado_por_usuario_id AS convidadoPorUsuarioId,
        qc.status,
        qc.mensagem,
        qc.criado_em AS criadoEm,
        qc.respondido_em AS respondidoEm,
        qc.expira_em AS expiraEm,
        uv.nome_exibicao AS convidadoNomeExibicao,
        uc.nome_exibicao AS remetenteNomeExibicao
      FROM quadro_convites qc
      INNER JOIN usuarios uv ON uv.id = qc.usuario_convidado_id
      LEFT JOIN usuarios uc ON uc.id = qc.convidado_por_usuario_id
      WHERE qc.quadro_id = ?
      ${whereStatus}
      ORDER BY qc.criado_em DESC
      `,
      [quadroId, ...list]
    );
    return rows;
  }

  /**
   * @param {import("mysql2/promise").PoolConnection} conn
   */
  async inserirConviteEPapeis(
    conn,
    {
      quadroId,
      usuarioConvidadoId,
      emailConvidado,
      convidadoPorUsuarioId,
      mensagem,
      papelIds,
    }
  ) {
    const [ins] = await conn.query(
      `
      INSERT INTO quadro_convites (
        quadro_id,
        usuario_convidado_id,
        email_convidado,
        convidado_por_usuario_id,
        status,
        mensagem,
        criado_em
      )
      VALUES (?, ?, ?, ?, 'pendente', ?, NOW())
      `,
      [
        quadroId,
        usuarioConvidadoId,
        emailConvidado,
        convidadoPorUsuarioId,
        mensagem || null,
      ]
    );
    const conviteId = ins.insertId;

    if (Array.isArray(papelIds) && papelIds.length) {
      const values = papelIds.map((papelId) => [conviteId, papelId, new Date()]);
      await conn.query(
        `
        INSERT INTO quadro_convite_papeis (convite_id, papel_id, criado_em)
        VALUES ?
        `,
        [values]
      );
    }

    return conviteId;
  }

  /**
   * @param {import("mysql2/promise").PoolConnection} [conn]
   */
  async finalizarConvite(conviteId, status, conn = null) {
    const runner = conn || db;
    await runner.query(
      `
      UPDATE quadro_convites
      SET status = ?,
          respondido_em = NOW()
      WHERE id = ?
      `,
      [status, conviteId]
    );
  }

  async removerPorIdEQuadro(conviteId, quadroId, conn = null) {
    const runner = conn || db;
    const [result] = await runner.query(
      `
      DELETE FROM quadro_convites
      WHERE id = ?
        AND quadro_id = ?
      `,
      [conviteId, quadroId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new ConviteRepository();
