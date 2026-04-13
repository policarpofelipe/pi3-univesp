const { pool } = require("../database/connection");

class BuscaService {
  async buscarNoQuadro(quadroId, termo, limit = 20) {
    const qId = Number(quadroId);
    if (!Number.isInteger(qId) || qId <= 0) {
      throw Object.assign(new Error("ID de quadro inválido."), { statusCode: 400 });
    }
    const busca = String(termo || "").trim();
    if (!busca) return { cartoes: [], listas: [] };

    const max = Math.min(Number(limit) || 20, 100);

    const [cartoes] = await pool.query(
      `
      SELECT c.id, c.titulo, c.lista_id AS listaId
      FROM cartoes c
      INNER JOIN listas l ON l.id = c.lista_id
      WHERE l.quadro_id = ?
        AND c.arquivado_em IS NULL
        AND (c.titulo LIKE ? OR c.descricao LIKE ?)
      ORDER BY c.atualizado_em DESC
      LIMIT ?
      `,
      [qId, `%${busca}%`, `%${busca}%`, max]
    );

    const [listas] = await pool.query(
      `
      SELECT id, nome
      FROM listas
      WHERE quadro_id = ?
        AND nome LIKE ?
      ORDER BY posicao ASC
      LIMIT ?
      `,
      [qId, `%${busca}%`, max]
    );

    return { cartoes, listas };
  }
}

module.exports = new BuscaService();
