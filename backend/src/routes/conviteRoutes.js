const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const conviteController = require("../controllers/conviteController");

const router = express.Router();

router.use(authMiddleware);

router.get("/pendentes", conviteController.listarPendentes);
router.get("/:conviteId", conviteController.obterPorId);
router.post("/:conviteId/aceitar", conviteController.aceitar);
router.post("/:conviteId/recusar", conviteController.recusar);

module.exports = router;
