const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { ensureQuadroMemberParam } = require("../middlewares/permissionMiddleware");
const quadroValidator = require("../validators/quadroValidator");
const quadroController = require("../controllers/quadroController");

const router = express.Router();

/*
  Base sugerida de montagem:
  app.use("/api/quadros", quadroRoutes);

  Responsabilidade deste arquivo:
  - CRUD do quadro
  - configurações do quadro
  - arquivar / desarquivar

  Não colocar aqui:
  - membros
  - papéis
*/

router.use(authMiddleware);
router.param("quadroId", ensureQuadroMemberParam);

// CRUD
router.get("/", quadroController.listar);
router.get("/:quadroId", quadroController.obterPorId);
router.post("/", quadroValidator.criar(), quadroController.criar);
router.put("/:quadroId", quadroValidator.atualizar(), quadroController.atualizar);
router.delete("/:quadroId", quadroController.remover);

// Configurações
router.get("/:quadroId/configuracoes", quadroController.obterConfiguracoes);
router.put(
  "/:quadroId/configuracoes",
  quadroValidator.configuracoes(),
  quadroController.atualizarConfiguracoes
);

// Estado do quadro
router.patch("/:quadroId/arquivar", quadroController.arquivar);
router.patch("/:quadroId/desarquivar", quadroController.desarquivar);

module.exports = router;