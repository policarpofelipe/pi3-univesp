import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import * as organizacaoController from "../controllers/organizacaoController.js";

const router = Router();


router.use(authMiddleware);

/* =========================
   CRUD DE ORGANIZAÇÃO
========================= */

// listar organizações do usuário
router.get("/", organizacaoController.listar);

// obter organização específica
router.get("/:organizacaoId", organizacaoController.obterPorId);

// criar organização
router.post("/", organizacaoController.criar);

// atualizar organização
router.put("/:organizacaoId", organizacaoController.atualizar);

// remover organização
router.delete("/:organizacaoId", organizacaoController.remover);

/* =========================
   CONFIGURAÇÕES
========================= */

// obter configurações
router.get(
  "/:organizacaoId/configuracoes",
  organizacaoController.obterConfiguracoes
);

// atualizar configurações
router.put(
  "/:organizacaoId/configuracoes",
  organizacaoController.atualizarConfiguracoes
);

export default router;
