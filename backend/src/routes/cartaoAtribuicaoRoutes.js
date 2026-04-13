const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { ensureQuadroMemberParam } = require("../middlewares/permissionMiddleware");
const cartaoAtribuicaoController = require("../controllers/cartaoAtribuicaoController");

const router = express.Router();

router.use(authMiddleware);
router.param("quadroId", ensureQuadroMemberParam);

router.get(
  "/:quadroId/cartoes/:cartaoId/atribuicoes",
  cartaoAtribuicaoController.listar
);
router.post(
  "/:quadroId/cartoes/:cartaoId/atribuicoes",
  cartaoAtribuicaoController.criar
);
router.delete(
  "/:quadroId/cartoes/:cartaoId/atribuicoes/:usuarioId",
  cartaoAtribuicaoController.remover
);

module.exports = router;
