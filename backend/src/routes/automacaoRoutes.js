const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { ensureQuadroMemberParam } = require("../middlewares/permissionMiddleware");
const automacaoController = require("../controllers/automacaoController");

const router = express.Router();

router.use(authMiddleware);
router.param("quadroId", ensureQuadroMemberParam);

router.get("/:quadroId/automacoes", automacaoController.listar);
router.post("/:quadroId/automacoes", automacaoController.criar);
router.put("/:quadroId/automacoes/:automacaoId", automacaoController.atualizar);
router.delete("/:quadroId/automacoes/:automacaoId", automacaoController.remover);

module.exports = router;

