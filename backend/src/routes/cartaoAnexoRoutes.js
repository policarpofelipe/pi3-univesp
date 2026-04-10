const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const cartaoAnexoController = require("../controllers/cartaoAnexoController");

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/:quadroId/cartoes/:cartaoId/anexos/:anexoId",
  cartaoAnexoController.obterPorId
);
router.delete(
  "/:quadroId/cartoes/:cartaoId/anexos/:anexoId",
  cartaoAnexoController.remover
);
router.get(
  "/:quadroId/cartoes/:cartaoId/anexos",
  cartaoAnexoController.listar
);
router.post(
  "/:quadroId/cartoes/:cartaoId/anexos",
  cartaoAnexoController.criar
);

module.exports = router;
