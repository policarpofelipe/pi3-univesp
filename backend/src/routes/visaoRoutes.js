const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { ensureQuadroMemberParam } = require("../middlewares/permissionMiddleware");
const visaoController = require("../controllers/visaoController");

const router = express.Router();

router.use(authMiddleware);
router.param("quadroId", ensureQuadroMemberParam);

router.get("/:quadroId/visoes", visaoController.listar);
router.post("/:quadroId/visoes", visaoController.criar);
router.put("/:quadroId/visoes/:visaoId", visaoController.atualizar);
router.delete("/:quadroId/visoes/:visaoId", visaoController.remover);

module.exports = router;

