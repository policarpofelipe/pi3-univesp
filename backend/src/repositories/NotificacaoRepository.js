const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

function parseDadosJson(raw) {
  if (raw == null) return null;
  if (typeof raw === "object") return raw;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return null;
}

class NotificacaoRepository {
  mapRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      usuarioId: row.usuarioId,
      tipo: row.tipo,
      titulo: row.titulo,
      mensagem: row.mensagem,
      link: row.link,
      dadosJson: parseDadosJson(row.dadosJson),
      lidaEm: row.lidaEm,
      criadoEm: row.criadoEm,
    };
  }

  /**
   * @param {import("mysql2/promise").PoolConnection} [conn]
   */
  async criar(
    { usuarioId, tipo, titulo, mensagem, link = null, dadosJson = null },
    conn = null
  ) {
    const runner = conn || db;
    const payloadJson =
      dadosJson === null || dadosJson === undefined
        ? null
        : JSON.stringify(dadosJson);

    const [result] = await runner.query(
      `
      INSERT INTO notificacoes (
        usuario_id,
        tipo,
        titulo,
        mensagem,
        link,
        dados_json,
        criado_em
      )
      VALUES (?, ?, ?, ?, ?, ?, NOW())
      `,
      [usuarioId, tipo, titulo, mensagem, link, payloadJson]
    );

    return this.obterPorId(result.insertId, usuarioId, conn);
  }

  /**
   * @param {import("mysql2/promise").PoolConnection} [conn]
   */
  async obterPorId(id, usuarioId, conn = null) {
    const runner = conn || db;
    const [rows] = await runner.query(
      `
      SELECT
        id,
        usuario_id AS usuarioId,
        tipo,
        titulo,
        mensagem,
        link,
        dados_json AS dadosJson,
        lida_em AS lidaEm,
        criado_em AS criadoEm
      FROM notificacoes
      WHERE id = ?
        AND usuario_id = ?
      LIMIT 1
      `,
      [id, usuarioId]
    );
    return this.mapRow(rows[0] || null);
  }

  async listarPorUsuario(usuarioId, filtros = {}) {
    const limit = Math.min(
      Math.max(Number(filtros.limit) || 20, 1),
      100
    );
    const somenteNaoLidas = String(filtros.somenteNaoLidas || "").toLowerCase() === "true";

    const where = ["usuario_id = ?"];
    const params = [usuarioId];
    if (somenteNaoLidas) {
      where.push("lida_em IS NULL");
    }

    const [rows] = await db.query(
      `
      SELECT
        id,
        usuario_id AS usuarioId,
        tipo,
        titulo,
        mensagem,
        link,
        dados_json AS dadosJson,
        lida_em AS lidaEm,
        criado_em AS criadoEm
      FROM notificacoes
      WHERE ${where.join(" AND ")}
      ORDER BY criado_em DESC
      LIMIT ?
      `,
      [...params, limit]
    );

    return rows.map((r) => this.mapRow(r));
  }

  async contarNaoLidas(usuarioId) {
    const [rows] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM notificacoes
      WHERE usuario_id = ?
        AND lida_em IS NULL
      `,
      [usuarioId]
    );
    return Number(rows[0]?.total || 0);
  }

  async marcarComoLida(notificacaoId, usuarioId) {
    const [result] = await db.query(
      `
      UPDATE notificacoes
      SET lida_em = NOW()
      WHERE id = ?
        AND usuario_id = ?
        AND lida_em IS NULL
      `,
      [notificacaoId, usuarioId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Marca como lida a notificação de convite recebido para um convite específico.
   * @param {import("mysql2/promise").PoolConnection} [conn]
   */
  async marcarConviteRecebidoComoLida(usuarioId, conviteId, conn = null) {
    const runner = conn || db;
    const [result] = await runner.query(
      `
      UPDATE notificacoes
      SET lida_em = NOW()
      WHERE usuario_id = ?
        AND tipo = 'CONVITE_QUADRO_RECEBIDO'
        AND lida_em IS NULL
        AND JSON_UNQUOTE(JSON_EXTRACT(dados_json, '$.conviteId')) = ?
      `,
      [usuarioId, String(conviteId)]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new NotificacaoRepository();
