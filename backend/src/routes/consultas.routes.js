const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const consultasController = require("../controllers/consultasController");

const router = express.Router();

router.use(authMiddleware);

router.get("/cnpj/:cnpj", consultasController.consultarCnpj);
router.get("/cep/:cep", consultasController.consultarCep);

module.exports = router;
