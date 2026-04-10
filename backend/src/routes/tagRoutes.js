const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const tagController = require("../controllers/tagController");

const router = express.Router();

router.use(authMiddleware);

router.get("/:quadroId/tags", tagController.listar);
router.post("/:quadroId/tags", tagController.criar);
router.delete("/:quadroId/tags/:tagId", tagController.remover);

module.exports = router;
