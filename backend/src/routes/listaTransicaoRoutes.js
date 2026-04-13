const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const listaTransicaoController = require("../controllers/listaTransicaoController");

const router = express.Router();

router.use(authMiddleware);

router.get("/:quadroId/listas/:listaId/transicoes", listaTransicaoController.listar);
router.post("/:quadroId/listas/:listaId/transicoes", listaTransicaoController.criar);
router.delete(
  "/:quadroId/listas/:listaId/transicoes/:regraId",
  listaTransicaoController.remover
);

module.exports = router;

