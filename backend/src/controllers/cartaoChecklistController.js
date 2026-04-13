const cartaoChecklistService = require("../services/cartaoChecklistService");

const cartaoChecklistController = {
  async listar(req, res, next) {
    try {
      const data = await cartaoChecklistService.listar(
        req.params.quadroId,
        req.params.cartaoId
      );
      if (!data) {
        return res.status(404).json({ success: false, message: "Cartão não encontrado." });
      }

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      return next(error);
    }
  },

  async criar(req, res, next) {
    try {
      const novo = await cartaoChecklistService.criarChecklist(
        req.params.quadroId,
        req.params.cartaoId,
        req.body?.titulo,
        req.usuario?.id || null
      );
      if (!novo) return res.status(404).json({ success: false, message: "Cartão não encontrado." });

      return res.status(201).json({
        success: true,
        message: "Checklist criada.",
        data: novo,
      });
    } catch (error) {
      return next(error);
    }
  },

  async atualizar(req, res, next) {
    try {
      const cl = await cartaoChecklistService.atualizarChecklist(
        req.params.quadroId,
        req.params.cartaoId,
        req.params.checklistId,
        req.body?.titulo
      );
      if (!cl) {
        return res.status(404).json({
          success: false,
          message: "Checklist não encontrada.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Checklist atualizada.",
        data: cl,
      });
    } catch (error) {
      return next(error);
    }
  },

  async remover(req, res, next) {
    try {
      const removed = await cartaoChecklistService.removerChecklist(
        req.params.quadroId,
        req.params.cartaoId,
        req.params.checklistId
      );
      if (!removed) {
        return res.status(404).json({
          success: false,
          message: "Checklist não encontrada.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Checklist removida.",
        data: { id: Number(req.params.checklistId) },
      });
    } catch (error) {
      return next(error);
    }
  },

  async criarItem(req, res, next) {
    try {
      const item = await cartaoChecklistService.criarItem(
        req.params.quadroId,
        req.params.cartaoId,
        req.params.checklistId,
        req.body?.titulo,
        req.usuario?.id || null
      );
      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Checklist não encontrada.",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Item adicionado.",
        data: item,
      });
    } catch (error) {
      return next(error);
    }
  },

  async atualizarItem(req, res, next) {
    try {
      const item = await cartaoChecklistService.atualizarItem(
        req.params.quadroId,
        req.params.cartaoId,
        req.params.checklistId,
        req.params.itemId,
        req.body || {},
        req.usuario?.id || null
      );
      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Item não encontrado.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Item atualizado.",
        data: item,
      });
    } catch (error) {
      return next(error);
    }
  },

  async removerItem(req, res, next) {
    try {
      const removed = await cartaoChecklistService.removerItem(
        req.params.quadroId,
        req.params.cartaoId,
        req.params.checklistId,
        req.params.itemId
      );
      if (!removed) {
        return res.status(404).json({
          success: false,
          message: "Item não encontrado.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Item removido.",
        data: { id: Number(req.params.itemId) },
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = cartaoChecklistController;
