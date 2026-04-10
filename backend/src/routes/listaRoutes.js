const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const listaController = require("../controllers/listaController");

const router = express.Router();

/*
  Montagem:
  app.use("/api/quadros", listaRoutes);

  Rotas aninhadas por quadro.
*/

router.use(authMiddleware);

router.patch(
  "/:quadroId/listas/reordenar",
  listaController.reordenar
);

router.get("/:quadroId/listas", listaController.listar);
router.post("/:quadroId/listas", listaController.criar);
router.get("/:quadroId/listas/:listaId", listaController.obterPorId);
router.put("/:quadroId/listas/:listaId", listaController.atualizar);
router.delete("/:quadroId/listas/:listaId", listaController.remover);

module.exports = router;
