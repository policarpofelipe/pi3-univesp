const bcrypt = require("bcryptjs");
const { pool } = require("../database/connection");
const UsuarioRepository = require("../repositories/UsuarioRepository");

function toPositiveInt(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

class UsuarioService {
  async listar(filtros = {}) {
    const busca = String(filtros.busca || "").trim();
    const limit = Math.min(Number(filtros.limit) || 20, 100);
    const params = [];
    let where = "";
    if (busca) {
      where = "WHERE nome_exibicao LIKE ? OR email LIKE ?";
      params.push(`%${busca}%`, `%${busca}%`);
    }

    const [rows] = await pool.query(
      `
      SELECT id, email, nome_exibicao AS nomeExibicao, ativo, criado_em AS criadoEm, atualizado_em AS atualizadoEm
      FROM usuarios
      ${where}
      ORDER BY nome_exibicao ASC, email ASC
      LIMIT ?
      `,
      [...params, limit]
    );
    return rows;
  }

  async obterPorId(id) {
    const usuarioId = toPositiveInt(id);
    if (!usuarioId) throw Object.assign(new Error("ID inválido."), { statusCode: 400 });
    return UsuarioRepository.findById(usuarioId);
  }

  async atualizarPerfil(usuarioId, dados = {}) {
    const id = toPositiveInt(usuarioId);
    if (!id) throw Object.assign(new Error("ID inválido."), { statusCode: 400 });
    const nomeExibicao = String(dados.nomeExibicao || "").trim();
    if (!nomeExibicao) {
      throw Object.assign(new Error("nomeExibicao é obrigatório."), { statusCode: 400 });
    }
    await pool.query(
      "UPDATE usuarios SET nome_exibicao = ?, atualizado_em = NOW() WHERE id = ?",
      [nomeExibicao, id]
    );
    return UsuarioRepository.findById(id);
  }

  async alterarSenha(usuarioId, senhaAtual, novaSenha) {
    const id = toPositiveInt(usuarioId);
    if (!id) throw Object.assign(new Error("ID inválido."), { statusCode: 400 });
    if (!senhaAtual || !novaSenha) {
      throw Object.assign(new Error("senhaAtual e novaSenha são obrigatórias."), {
        statusCode: 400,
      });
    }
    if (String(novaSenha).length < 6) {
      throw Object.assign(new Error("A nova senha deve ter ao menos 6 caracteres."), {
        statusCode: 400,
      });
    }

    const [rows] = await pool.query(
      "SELECT id, senha_hash AS senhaHash FROM usuarios WHERE id = ? LIMIT 1",
      [id]
    );
    const usuario = rows[0];
    if (!usuario) return null;

    const valida = await bcrypt.compare(String(senhaAtual), usuario.senhaHash);
    if (!valida) {
      throw Object.assign(new Error("Senha atual inválida."), { statusCode: 400 });
    }

    const novaHash = await bcrypt.hash(String(novaSenha), 10);
    await pool.query(
      "UPDATE usuarios SET senha_hash = ?, atualizado_em = NOW() WHERE id = ?",
      [novaHash, id]
    );
    return true;
  }
}

module.exports = new UsuarioService();
