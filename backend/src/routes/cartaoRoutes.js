const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const cartaoController = require("../controllers/cartaoController");
const { validarMovimentacaoCartao } = require("../middlewares/listaGateMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/:quadroId/cartoes", cartaoController.listar);
router.post("/:quadroId/cartoes", cartaoController.criar);
router.get("/:quadroId/cartoes/:cartaoId", cartaoController.obterPorId);
router.put("/:quadroId/cartoes/:cartaoId", cartaoController.atualizar);
router.patch(
  "/:quadroId/cartoes/:cartaoId/mover",
  validarMovimentacaoCartao,
  cartaoController.mover
);
router.delete("/:quadroId/cartoes/:cartaoId", cartaoController.remover);

module.exports = router;
