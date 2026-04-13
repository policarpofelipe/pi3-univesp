const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { ensureQuadroMemberParam } = require("../middlewares/permissionMiddleware");
const cartaoCampoValorController = require("../controllers/cartaoCampoValorController");

const router = express.Router();

router.use(authMiddleware);
router.param("quadroId", ensureQuadroMemberParam);

router.get(
  "/:quadroId/cartoes/:cartaoId/campos-valores",
  cartaoCampoValorController.listar
);
router.put(
  "/:quadroId/cartoes/:cartaoId/campos-valores/:campoId",
  cartaoCampoValorController.definir
);

module.exports = router;
