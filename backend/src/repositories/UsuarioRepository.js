const { pool } = require("../database/connection");

async function findByEmail(email) {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        email,
        nome_exibicao,
        senha_hash,
        ativo,
        criado_em,
        atualizado_em
      FROM usuarios
      WHERE email = ?
      LIMIT 1
    `,
    [email]
  );

  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        email,
        nome_exibicao,
        ativo,
        criado_em,
        atualizado_em
      FROM usuarios
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
}

async function create({ nomeExibicao, email, senhaHash }) {
  const [result] = await pool.query(
    `
      INSERT INTO usuarios (
        nome_exibicao,
        email,
        senha_hash
      )
      VALUES (?, ?, ?)
    `,
    [nomeExibicao || null, email, senhaHash]
  );

  return findById(result.insertId);
}

async function updateUltimoLogin(id) {
  try {
    await pool.query(
      `
        UPDATE usuarios
        SET ultimo_login_em = NOW()
        WHERE id = ?
      `,
      [id]
    );
  } catch (error) {
    console.error(
      "Falha ao atualizar ultimo_login_em do usuário:",
      error.message
    );
  }
}

module.exports = {
  findByEmail,
  findById,
  create,
  updateUltimoLogin,
};
