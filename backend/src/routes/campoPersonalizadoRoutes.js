const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const campoPersonalizadoController = require("../controllers/campoPersonalizadoController");

const router = express.Router();

router.use(authMiddleware);

router.get("/:quadroId/campos-personalizados", campoPersonalizadoController.listar);
router.post("/:quadroId/campos-personalizados", campoPersonalizadoController.criar);
router.put(
  "/:quadroId/campos-personalizados/:campoId",
  campoPersonalizadoController.atualizar
);
router.delete(
  "/:quadroId/campos-personalizados/:campoId",
  campoPersonalizadoController.remover
);

module.exports = router;

