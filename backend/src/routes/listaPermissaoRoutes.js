const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const listaPermissaoController = require("../controllers/listaPermissaoController");

const router = express.Router();

router.use(authMiddleware);

router.get("/:quadroId/listas/:listaId/permissoes", listaPermissaoController.listar);
router.put("/:quadroId/listas/:listaId/permissoes", listaPermissaoController.definir);
router.delete(
  "/:quadroId/listas/:listaId/permissoes/:papelId",
  listaPermissaoController.remover
);

module.exports = router;

