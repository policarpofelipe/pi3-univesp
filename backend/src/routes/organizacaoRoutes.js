const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const organizacaoController = require("../controllers/organizacaoController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", organizacaoController.listar);
router.get("/:organizacaoId", organizacaoController.obterPorId);
router.post("/", organizacaoController.criar);
router.put("/:organizacaoId", organizacaoController.atualizar);
router.delete("/:organizacaoId", organizacaoController.remover);

router.get(
  "/:organizacaoId/configuracoes",
  organizacaoController.obterConfiguracoes
);

router.put(
  "/:organizacaoId/configuracoes",
  organizacaoController.atualizarConfiguracoes
);

// router.get("/:organizacaoId/membros", organizacaoController.listarMembros);
// router.get("/:organizacaoId/membros/:membroId", organizacaoController.obterMembroPorId);
// router.post("/:organizacaoId/membros", organizacaoController.convidarMembro);
// router.put("/:organizacaoId/membros/:membroId", organizacaoController.atualizarMembro);
// router.delete("/:organizacaoId/membros/:membroId", organizacaoController.removerMembro);

module.exports = router;
