const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const notificacaoController = require("../controllers/notificacaoController");

const router = express.Router();

router.use(authMiddleware);

router.get("/nao-lidas/total", notificacaoController.contarNaoLidas);
router.get("/", notificacaoController.listar);
router.patch("/:notificacaoId/lida", notificacaoController.marcarComoLida);

module.exports = router;
