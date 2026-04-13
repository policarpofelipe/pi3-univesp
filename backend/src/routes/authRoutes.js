const express = require("express");
const AuthController = require("../controllers/AuthController");
const authMiddleware = require("../middlewares/authMiddleware");
const authValidator = require("../validators/authValidator");

const router = express.Router();

// Autenticação
router.post("/login", authValidator.login(), AuthController.login);
router.post("/cadastro", authValidator.register(), AuthController.register);
router.post("/esqueci-senha", authValidator.forgotPassword(), AuthController.forgotPassword);
router.post("/redefinir-senha", AuthController.resetPassword);

// Sessão do usuário autenticado
router.get("/me", authMiddleware, AuthController.me);
router.post("/logout", authMiddleware, AuthController.logout);

module.exports = router;
