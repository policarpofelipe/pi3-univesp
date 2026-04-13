const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { ensureQuadroMemberParam } = require("../middlewares/permissionMiddleware");
const quadroMembroController = require("../controllers/quadroMembroController");

const router = express.Router();

/*
  Base sugerida de montagem:
  app.use("/api/quadros", quadroMembroRoutes);

  Responsabilidade deste arquivo:
  - listar membros do quadro
  - obter membro específico no contexto do quadro
  - adicionar / convidar membro
  - atualizar vínculo / papel
  - reenviar convite
  - remover membro
*/

router.use(authMiddleware);
router.param("quadroId", ensureQuadroMemberParam);

// Membros do quadro
router.get("/:quadroId/membros", quadroMembroController.listar);
router.get("/:quadroId/membros/:membroId", quadroMembroController.obterPorId);

router.post("/:quadroId/membros", quadroMembroController.adicionar);
router.post("/:quadroId/membros/convites", quadroMembroController.convidar);

router.put("/:quadroId/membros/:membroId", quadroMembroController.atualizar);
router.patch(
  "/:quadroId/membros/:membroId/papel",
  quadroMembroController.atualizarPapel
);

router.post(
  "/:quadroId/membros/:membroId/reenviar-convite",
  quadroMembroController.reenviarConvite
);

router.delete("/:quadroId/membros/:membroId", quadroMembroController.remover);

module.exports = router;