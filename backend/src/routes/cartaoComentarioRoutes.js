const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { ensureQuadroMemberParam } = require("../middlewares/permissionMiddleware");
const cartaoComentarioController = require("../controllers/cartaoComentarioController");

const router = express.Router();

router.use(authMiddleware);
router.param("quadroId", ensureQuadroMemberParam);

router.get(
  "/:quadroId/cartoes/:cartaoId/comentarios",
  cartaoComentarioController.listar
);
router.post(
  "/:quadroId/cartoes/:cartaoId/comentarios",
  cartaoComentarioController.criar
);
router.delete(
  "/:quadroId/cartoes/:cartaoId/comentarios/:comentarioId",
  cartaoComentarioController.remover
);

module.exports = router;
