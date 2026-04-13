const { pool } = require("../database/connection");
const QuadroRepository = require("../repositories/QuadroRepository");

function toPositiveInt(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

class TagService {
  async listar(quadroId) {
    const qId = toPositiveInt(quadroId);
    if (!qId) throw Object.assign(new Error("ID de quadro inválido."), { statusCode: 400 });
    const quadro = await QuadroRepository.obterPorId(qId);
    if (!quadro) return null;

    const [rows] = await pool.query(
      `
      SELECT id, quadro_id AS quadroId, nome, cor, criado_em AS criadoEm
      FROM tags
      WHERE quadro_id = ?
      ORDER BY nome ASC, id ASC
      `,
      [qId]
    );
    return rows;
  }

  async criar(quadroId, dados = {}) {
    const qId = toPositiveInt(quadroId);
    if (!qId) throw Object.assign(new Error("ID de quadro inválido."), { statusCode: 400 });
    const quadro = await QuadroRepository.obterPorId(qId);
    if (!quadro) return null;

    const nome = String(dados.nome || "").trim();
    const cor = String(dados.cor || "#64748b").trim();
    if (!nome) throw Object.assign(new Error("O nome da tag é obrigatório."), { statusCode: 400 });
    if (!/^#[0-9A-Fa-f]{6}$/.test(cor)) {
      throw Object.assign(new Error("Cor inválida. Use formato hexadecimal #RRGGBB."), {
        statusCode: 400,
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO tags (quadro_id, nome, cor, criado_em)
      VALUES (?, ?, ?, NOW())
      `,
      [qId, nome, cor]
    );
    const [rows] = await pool.query(
      "SELECT id, quadro_id AS quadroId, nome, cor, criado_em AS criadoEm FROM tags WHERE id = ? LIMIT 1",
      [result.insertId]
    );
    return rows[0] || null;
  }

  async remover(quadroId, tagId) {
    const qId = toPositiveInt(quadroId);
    const tId = toPositiveInt(tagId);
    if (!qId || !tId) throw Object.assign(new Error("IDs inválidos."), { statusCode: 400 });

    const [result] = await pool.query(
      "DELETE FROM tags WHERE quadro_id = ? AND id = ?",
      [qId, tId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new TagService();
