import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import * as quadroMembroController from "../controllers/quadroMembroController.js";

const router = Router();

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

export default router;