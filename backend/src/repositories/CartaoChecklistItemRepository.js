const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

class CartaoChecklistItemRepository {
  async listar(checklistId) {
    const [rows] = await db.query(
      `
      SELECT
        id,
        checklist_id AS checklistId,
        titulo,
        posicao,
        prazo_em AS prazoEm,
        concluido,
        concluido_em AS concluidoEm,
        concluido_por_usuario_id AS concluidoPorUsuarioId,
        criado_em AS criadoEm,
        atualizado_em AS atualizadoEm,
        removido_em AS removidoEm
      FROM cartao_checklist_itens
      WHERE checklist_id = ?
        AND removido_em IS NULL
      ORDER BY posicao ASC, id ASC
      `,
      [checklistId]
    );
    return rows.map((row) => ({ ...row, concluido: Boolean(row.concluido) }));
  }

  async obterPorId(checklistId, itemId) {
    const [rows] = await db.query(
      `
      SELECT
        id,
        checklist_id AS checklistId,
        titulo,
        posicao,
        prazo_em AS prazoEm,
        concluido,
        concluido_em AS concluidoEm,
        concluido_por_usuario_id AS concluidoPorUsuarioId,
        criado_em AS criadoEm,
        atualizado_em AS atualizadoEm,
        removido_em AS removidoEm
      FROM cartao_checklist_itens
      WHERE checklist_id = ?
        AND id = ?
      LIMIT 1
      `,
      [checklistId, itemId]
    );
    const row = rows[0];
    return row ? { ...row, concluido: Boolean(row.concluido) } : null;
  }

  async criar(checklistId, titulo) {
    const [maxRows] = await db.query(
      "SELECT COALESCE(MAX(posicao), 0) AS maxPos FROM cartao_checklist_itens WHERE checklist_id = ? AND removido_em IS NULL",
      [checklistId]
    );
    const posicao = Number(maxRows[0]?.maxPos || 0) + 1;
    const [result] = await db.query(
      `
      INSERT INTO cartao_checklist_itens (
        checklist_id, titulo, posicao, criado_em, atualizado_em
      ) VALUES (?, ?, ?, NOW(), NOW())
      `,
      [checklistId, titulo, posicao]
    );
    return this.obterPorId(checklistId, result.insertId);
  }

  async atualizar(itemId, dados = {}) {
    const campos = [];
    const params = [];
    if (dados.titulo !== undefined) {
      campos.push("titulo = ?");
      params.push(dados.titulo);
    }
    if (dados.concluido !== undefined) {
      campos.push("concluido = ?");
      params.push(dados.concluido ? 1 : 0);
      campos.push("concluido_em = ?");
      params.push(dados.concluido ? new Date() : null);
    }
    if (dados.concluidoPorUsuarioId !== undefined) {
      campos.push("concluido_por_usuario_id = ?");
      params.push(dados.concluidoPorUsuarioId || null);
    }
    if (dados.prazoEm !== undefined) {
      campos.push("prazo_em = ?");
      params.push(dados.prazoEm || null);
    }
    if (!campos.length) return;
    params.push(itemId);
    await db.query(
      `UPDATE cartao_checklist_itens SET ${campos.join(", ")}, atualizado_em = NOW() WHERE id = ?`,
      params
    );
  }

  async remover(itemId) {
    const [result] = await db.query(
      "UPDATE cartao_checklist_itens SET removido_em = NOW(), atualizado_em = NOW() WHERE id = ? AND removido_em IS NULL",
      [itemId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new CartaoChecklistItemRepository();
