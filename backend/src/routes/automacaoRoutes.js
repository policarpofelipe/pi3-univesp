const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { ensureQuadroMemberParam } = require("../middlewares/permissionMiddleware");
const automacaoValidator = require("../validators/automacaoValidator");
const automacaoController = require("../controllers/automacaoController");

const router = express.Router();

router.use(authMiddleware);
router.param("quadroId", ensureQuadroMemberParam);

router.get("/:quadroId/automacoes", automacaoController.listar);
router.post(
  "/:quadroId/automacoes",
  automacaoValidator.criar(),
  automacaoController.criar
);
router.put(
  "/:quadroId/automacoes/:automacaoId",
  automacaoValidator.atualizar(),
  automacaoController.atualizar
);
router.delete("/:quadroId/automacoes/:automacaoId", automacaoController.remover);

module.exports = router;

