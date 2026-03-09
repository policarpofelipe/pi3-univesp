const express = require("express");
const AuthController = require("../controllers/AuthController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Autenticação
router.post("/login", AuthController.login);
router.post("/cadastro", AuthController.register);
router.post("/esqueci-senha", AuthController.forgotPassword);
router.post("/redefinir-senha", AuthController.resetPassword);

// Sessão do usuário autenticado
router.get("/me", authMiddleware, AuthController.me);
router.post("/logout", authMiddleware, AuthController.logout);

module.exports = router;
