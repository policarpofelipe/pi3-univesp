const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { ensureQuadroMemberParam } = require("../middlewares/permissionMiddleware");
const quadroPapelController = require("../controllers/quadroPapelController");

const router = express.Router();

/*
  Base sugerida de montagem:
  app.use("/api/quadros", quadroPapelRoutes);

  Responsabilidade deste arquivo:
  - listar papéis do quadro
  - obter papel específico
  - criar / atualizar / remover papel
  - atualizar permissões do papel
*/

router.use(authMiddleware);
router.param("quadroId", ensureQuadroMemberParam);

// Papéis do quadro
router.get("/:quadroId/papeis", quadroPapelController.listar);
router.get("/:quadroId/papeis/:papelId", quadroPapelController.obterPorId);

router.post("/:quadroId/papeis", quadroPapelController.criar);
router.put("/:quadroId/papeis/:papelId", quadroPapelController.atualizar);

router.patch(
  "/:quadroId/papeis/:papelId/permissoes",
  quadroPapelController.atualizarPermissoes
);

router.delete("/:quadroId/papeis/:papelId", quadroPapelController.remover);

module.exports = router;