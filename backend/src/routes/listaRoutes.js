const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { ensureQuadroMemberParam } = require("../middlewares/permissionMiddleware");
const listaValidator = require("../validators/listaValidator");
const listaController = require("../controllers/listaController");

const router = express.Router();

/*
  Montagem:
  app.use("/api/quadros", listaRoutes);

  Rotas aninhadas por quadro.
*/

router.use(authMiddleware);
router.param("quadroId", ensureQuadroMemberParam);

router.patch(
  "/:quadroId/listas/reordenar",
  listaValidator.reordenar(),
  listaController.reordenar
);

router.get("/:quadroId/listas", listaController.listar);
router.post("/:quadroId/listas", listaValidator.criar(), listaController.criar);
router.get("/:quadroId/listas/:listaId", listaController.obterPorId);
router.put(
  "/:quadroId/listas/:listaId",
  listaValidator.atualizar(),
  listaController.atualizar
);
router.delete("/:quadroId/listas/:listaId", listaController.remover);

module.exports = router;
