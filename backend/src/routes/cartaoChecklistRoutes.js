const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const cartaoChecklistController = require("../controllers/cartaoChecklistController");

const router = express.Router();

router.use(authMiddleware);

router.patch(
  "/:quadroId/cartoes/:cartaoId/checklists/:checklistId/itens/:itemId",
  cartaoChecklistController.atualizarItem
);
router.delete(
  "/:quadroId/cartoes/:cartaoId/checklists/:checklistId/itens/:itemId",
  cartaoChecklistController.removerItem
);
router.post(
  "/:quadroId/cartoes/:cartaoId/checklists/:checklistId/itens",
  cartaoChecklistController.criarItem
);
router.put(
  "/:quadroId/cartoes/:cartaoId/checklists/:checklistId",
  cartaoChecklistController.atualizar
);
router.delete(
  "/:quadroId/cartoes/:cartaoId/checklists/:checklistId",
  cartaoChecklistController.remover
);
router.get(
  "/:quadroId/cartoes/:cartaoId/checklists",
  cartaoChecklistController.listar
);
router.post(
  "/:quadroId/cartoes/:cartaoId/checklists",
  cartaoChecklistController.criar
);

module.exports = router;
