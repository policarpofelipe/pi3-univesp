const bcrypt = require("bcryptjs");
const { pool } = require("../database/connection");
const UsuarioRepository = require("../repositories/UsuarioRepository");

function toPositiveInt(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

const UsuarioController = {
  async getMeuPerfil(req, res, next) {
    try {
      const usuarioId = toPositiveInt(req.usuario?.id);
      if (!usuarioId) {
        return res.status(401).json({ success: false, message: "Usuário não autenticado." });
      }

      const usuario = await UsuarioRepository.findById(usuarioId);
      if (!usuario) {
        return res.status(404).json({ success: false, message: "Usuário não encontrado." });
      }

      return res.status(200).json({
        success: true,
        data: {
          id: usuario.id,
          email: usuario.email,
          nomeExibicao: usuario.nome_exibicao || usuario.nomeExibicao || "",
          ativo: usuario.ativo,
          criadoEm: usuario.criado_em || usuario.criadoEm,
          atualizadoEm: usuario.atualizado_em || usuario.atualizadoEm,
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  async atualizarMeuPerfil(req, res, next) {
    try {
      const usuarioId = toPositiveInt(req.usuario?.id);
      if (!usuarioId) {
        return res.status(401).json({ success: false, message: "Usuário não autenticado." });
      }

      const nomeExibicao = String(req.body?.nomeExibicao || "").trim();
      if (!nomeExibicao) {
        return res.status(400).json({
          success: false,
          message: "nomeExibicao é obrigatório.",
        });
      }

      await pool.query(
        `
        UPDATE usuarios
        SET nome_exibicao = ?, atualizado_em = NOW()
        WHERE id = ?
        `,
        [nomeExibicao, usuarioId]
      );

      const atualizado = await UsuarioRepository.findById(usuarioId);
      return res.status(200).json({
        success: true,
        message: "Perfil atualizado com sucesso.",
        data: {
          id: atualizado.id,
          email: atualizado.email,
          nomeExibicao: atualizado.nome_exibicao || atualizado.nomeExibicao || "",
          ativo: atualizado.ativo,
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  async alterarMinhaSenha(req, res, next) {
    try {
      const usuarioId = toPositiveInt(req.usuario?.id);
      if (!usuarioId) {
        return res.status(401).json({ success: false, message: "Usuário não autenticado." });
      }

      const senhaAtual = String(req.body?.senhaAtual || "");
      const novaSenha = String(req.body?.novaSenha || "");

      if (!senhaAtual || !novaSenha) {
        return res.status(400).json({
          success: false,
          message: "senhaAtual e novaSenha são obrigatórias.",
        });
      }
      if (novaSenha.length < 6) {
        return res.status(400).json({
          success: false,
          message: "A nova senha deve ter ao menos 6 caracteres.",
        });
      }

      const [rows] = await pool.query(
        "SELECT id, senha_hash AS senhaHash FROM usuarios WHERE id = ? LIMIT 1",
        [usuarioId]
      );
      const usuario = rows[0];
      if (!usuario) {
        return res.status(404).json({ success: false, message: "Usuário não encontrado." });
      }

      const valida = await bcrypt.compare(senhaAtual, usuario.senhaHash);
      if (!valida) {
        return res.status(400).json({ success: false, message: "Senha atual inválida." });
      }

      const novaHash = await bcrypt.hash(novaSenha, 10);
      await pool.query(
        "UPDATE usuarios SET senha_hash = ?, atualizado_em = NOW() WHERE id = ?",
        [novaHash, usuarioId]
      );

      return res.status(200).json({
        success: true,
        message: "Senha alterada com sucesso.",
      });
    } catch (error) {
      return next(error);
    }
  },

  async listarUsuarios(req, res, next) {
    try {
      const busca = String(req.query?.busca || "").trim();
      const limit = Math.min(Number(req.query?.limit) || 20, 100);
      const params = [];
      let where = "";
      if (busca) {
        where = "WHERE nome_exibicao LIKE ? OR email LIKE ?";
        params.push(`%${busca}%`, `%${busca}%`);
      }

      const [rows] = await pool.query(
        `
        SELECT id, email, nome_exibicao AS nomeExibicao, ativo
        FROM usuarios
        ${where}
        ORDER BY nome_exibicao ASC, email ASC
        LIMIT ?
        `,
        [...params, limit]
      );

      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      return next(error);
    }
  },

  async buscarPorId(req, res, next) {
    try {
      const id = toPositiveInt(req.params.id);
      if (!id) {
        return res.status(400).json({ success: false, message: "ID inválido." });
      }
      const usuario = await UsuarioRepository.findById(id);
      if (!usuario) {
        return res.status(404).json({ success: false, message: "Usuário não encontrado." });
      }

      return res.status(200).json({
        success: true,
        data: {
          id: usuario.id,
          email: usuario.email,
          nomeExibicao: usuario.nome_exibicao || usuario.nomeExibicao || "",
          ativo: usuario.ativo,
          criadoEm: usuario.criado_em || usuario.criadoEm,
          atualizadoEm: usuario.atualizado_em || usuario.atualizadoEm,
        },
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = UsuarioController;
