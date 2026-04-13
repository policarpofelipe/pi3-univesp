const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

class CartaoChecklistRepository {
  async listarChecklists(cartaoId) {
    const [rows] = await db.query(
      `
      SELECT id, cartao_id AS cartaoId, titulo, posicao
      FROM cartao_checklists
      WHERE cartao_id = ?
        AND removido_em IS NULL
      ORDER BY posicao ASC, id ASC
      `,
      [cartaoId]
    );
    return rows;
  }

  async listarItens(checklistIds = []) {
    if (!checklistIds.length) return [];
    const placeholders = checklistIds.map(() => "?").join(",");
    const [rows] = await db.query(
      `
      SELECT
        id,
        checklist_id AS checklistId,
        titulo,
        posicao,
        concluido
      FROM cartao_checklist_itens
      WHERE checklist_id IN (${placeholders})
        AND removido_em IS NULL
      ORDER BY posicao ASC, id ASC
      `,
      checklistIds
    );
    return rows;
  }

  async criarChecklist({ cartaoId, titulo, usuarioId }) {
    const [maxRows] = await db.query(
      "SELECT COALESCE(MAX(posicao), 0) AS maxPos FROM cartao_checklists WHERE cartao_id = ? AND removido_em IS NULL",
      [cartaoId]
    );
    const pos = Number(maxRows[0]?.maxPos || 0) + 1;

    const [result] = await db.query(
      `
      INSERT INTO cartao_checklists (cartao_id, titulo, posicao, criado_por_usuario_id, criado_em, atualizado_em)
      VALUES (?, ?, ?, ?, NOW(), NOW())
      `,
      [cartaoId, titulo, pos, usuarioId]
    );
    return result.insertId;
  }

  async atualizarChecklist(checklistId, titulo) {
    await db.query(
      "UPDATE cartao_checklists SET titulo = ?, atualizado_em = NOW() WHERE id = ? AND removido_em IS NULL",
      [titulo, checklistId]
    );
  }

  async removerChecklist(checklistId) {
    const [result] = await db.query(
      "UPDATE cartao_checklists SET removido_em = NOW(), atualizado_em = NOW() WHERE id = ? AND removido_em IS NULL",
      [checklistId]
    );
    return result.affectedRows > 0;
  }

  async obterChecklist(cartaoId, checklistId) {
    const [rows] = await db.query(
      "SELECT id, cartao_id AS cartaoId, titulo FROM cartao_checklists WHERE cartao_id = ? AND id = ? AND removido_em IS NULL LIMIT 1",
      [cartaoId, checklistId]
    );
    return rows[0] || null;
  }

  async criarItem(checklistId, titulo) {
    const [maxRows] = await db.query(
      "SELECT COALESCE(MAX(posicao), 0) AS maxPos FROM cartao_checklist_itens WHERE checklist_id = ? AND removido_em IS NULL",
      [checklistId]
    );
    const pos = Number(maxRows[0]?.maxPos || 0) + 1;
    const [result] = await db.query(
      `
      INSERT INTO cartao_checklist_itens (checklist_id, titulo, posicao, concluido, criado_em, atualizado_em)
      VALUES (?, ?, ?, 0, NOW(), NOW())
      `,
      [checklistId, titulo, pos]
    );
    return result.insertId;
  }

  async obterItem(checklistId, itemId) {
    const [rows] = await db.query(
      `
      SELECT id, checklist_id AS checklistId, titulo, concluido, posicao
      FROM cartao_checklist_itens
      WHERE checklist_id = ? AND id = ? AND removido_em IS NULL
      LIMIT 1
      `,
      [checklistId, itemId]
    );
    return rows[0] || null;
  }

  async atualizarItem(itemId, dados = {}) {
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
      campos.push("concluido_por_usuario_id = ?");
      params.push(dados.concluido ? dados.usuarioId || null : null);
    }
    if (!campos.length) return;
    params.push(itemId);
    await db.query(
      `UPDATE cartao_checklist_itens SET ${campos.join(", ")}, atualizado_em = NOW() WHERE id = ? AND removido_em IS NULL`,
      params
    );
  }

  async removerItem(itemId) {
    const [result] = await db.query(
      "UPDATE cartao_checklist_itens SET removido_em = NOW(), atualizado_em = NOW() WHERE id = ? AND removido_em IS NULL",
      [itemId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new CartaoChecklistRepository();

