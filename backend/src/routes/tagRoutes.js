const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { ensureQuadroMemberParam } = require("../middlewares/permissionMiddleware");
const tagController = require("../controllers/tagController");

const router = express.Router();

router.use(authMiddleware);
router.param("quadroId", ensureQuadroMemberParam);

router.get("/:quadroId/tags", tagController.listar);
router.post("/:quadroId/tags", tagController.criar);
router.put("/:quadroId/tags/:tagId", tagController.atualizar);
router.patch("/:quadroId/tags/:tagId", tagController.atualizar);
router.delete("/:quadroId/tags/:tagId", tagController.remover);

module.exports = router;
