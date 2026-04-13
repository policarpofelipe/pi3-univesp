const cartaoRelacaoService = require("../services/cartaoRelacaoService");

const cartaoRelacaoController = {
  async listar(req, res, next) {
    try {
      const data = await cartaoRelacaoService.listar(
        req.params.quadroId,
        req.params.cartaoId
      );
      if (!data) {
        return res
          .status(404)
          .json({ success: false, message: "Cartão não encontrado." });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  },

  async criar(req, res, next) {
    try {
      const data = await cartaoRelacaoService.criar(
        req.params.quadroId,
        req.params.cartaoId,
        req.body || {},
        req.usuario?.id || null
      );
      return res.status(201).json({
        success: true,
        message: "Relação criada.",
        data,
      });
    } catch (error) {
      return next(error);
    }
  },

  async remover(req, res, next) {
    try {
      const removed = await cartaoRelacaoService.remover(
        req.params.quadroId,
        req.params.cartaoId,
        req.params.relacaoId
      );
      if (removed === null) {
        return res
          .status(404)
          .json({ success: false, message: "Cartão não encontrado." });
      }
      if (!removed) {
        return res
          .status(404)
          .json({ success: false, message: "Relação não encontrada." });
      }
      return res.status(200).json({
        success: true,
        message: "Relação removida.",
        data: { relacaoId: Number(req.params.relacaoId) },
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = cartaoRelacaoController;
