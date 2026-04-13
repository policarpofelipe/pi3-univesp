const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { ensureQuadroMemberParam } = require("../middlewares/permissionMiddleware");
const cartaoValidator = require("../validators/cartaoValidator");
const cartaoController = require("../controllers/cartaoController");
const { validarMovimentacaoCartao } = require("../middlewares/listaGateMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.param("quadroId", ensureQuadroMemberParam);

router.get("/:quadroId/cartoes", cartaoController.listar);
router.post("/:quadroId/cartoes", cartaoValidator.criar(), cartaoController.criar);
router.get("/:quadroId/cartoes/:cartaoId", cartaoController.obterPorId);
router.put(
  "/:quadroId/cartoes/:cartaoId",
  cartaoValidator.atualizar(),
  cartaoController.atualizar
);
router.patch(
  "/:quadroId/cartoes/:cartaoId/mover",
  cartaoValidator.mover(),
  validarMovimentacaoCartao,
  cartaoController.mover
);
router.delete("/:quadroId/cartoes/:cartaoId", cartaoController.remover);

module.exports = router;
