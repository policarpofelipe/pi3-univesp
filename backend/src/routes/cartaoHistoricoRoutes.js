const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { ensureQuadroMemberParam } = require("../middlewares/permissionMiddleware");
const cartaoHistoricoController = require("../controllers/cartaoHistoricoController");

const router = express.Router();

router.use(authMiddleware);
router.param("quadroId", ensureQuadroMemberParam);

router.get(
  "/:quadroId/cartoes/:cartaoId/historico",
  cartaoHistoricoController.listar
);

module.exports = router;
