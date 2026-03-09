const express = require("express");
const UsuarioController = require("../controllers/UsuarioController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * Todas as rotas de usuário exigem autenticação
 */
router.use(authMiddleware);

/**
 * Buscar perfil do usuário logado
 */
router.get("/me", UsuarioController.getMeuPerfil);

/**
 * Atualizar dados do usuário logado
 */
router.put("/me", UsuarioController.atualizarMeuPerfil);

/**
 * Alterar senha do usuário logado
 */
router.put("/me/senha", UsuarioController.alterarMinhaSenha);

/**
 * Listar usuários (usado em seleção de atribuição de cartões)
 */
router.get("/", UsuarioController.listarUsuarios);

/**
 * Buscar usuário por ID
 */
router.get("/:id", UsuarioController.buscarPorId);

module.exports = router;
