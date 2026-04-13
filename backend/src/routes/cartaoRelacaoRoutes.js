const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { ensureQuadroMemberParam } = require("../middlewares/permissionMiddleware");
const cartaoRelacaoController = require("../controllers/cartaoRelacaoController");

const router = express.Router();

router.use(authMiddleware);
router.param("quadroId", ensureQuadroMemberParam);

router.get("/:quadroId/cartoes/:cartaoId/relacoes", cartaoRelacaoController.listar);
router.post("/:quadroId/cartoes/:cartaoId/relacoes", cartaoRelacaoController.criar);
router.delete(
  "/:quadroId/cartoes/:cartaoId/relacoes/:relacaoId",
  cartaoRelacaoController.remover
);

module.exports = router;
