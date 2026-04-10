const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const cartaoComentarioController = require("../controllers/cartaoComentarioController");

const router = express.Router();

router.use(authMiddleware);

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
