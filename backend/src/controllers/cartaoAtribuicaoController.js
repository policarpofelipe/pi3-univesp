const cartaoAtribuicaoService = require("../services/cartaoAtribuicaoService");

const cartaoAtribuicaoController = {
  async listar(req, res, next) {
    try {
      const data = await cartaoAtribuicaoService.listar(
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
      const data = await cartaoAtribuicaoService.adicionar(
        req.params.quadroId,
        req.params.cartaoId,
        req.body || {},
        req.usuario?.id || null
      );
      if (!data) {
        return res
          .status(404)
          .json({ success: false, message: "Cartão não encontrado." });
      }
      return res.status(201).json({
        success: true,
        message: "Atribuição adicionada.",
        data,
      });
    } catch (error) {
      return next(error);
    }
  },

  async remover(req, res, next) {
    try {
      const removed = await cartaoAtribuicaoService.remover(
        req.params.quadroId,
        req.params.cartaoId,
        req.params.usuarioId,
        req.usuario?.id || null
      );
      if (removed === null) {
        return res
          .status(404)
          .json({ success: false, message: "Cartão não encontrado." });
      }
      if (!removed) {
        return res
          .status(404)
          .json({ success: false, message: "Atribuição não encontrada." });
      }
      return res.status(200).json({
        success: true,
        message: "Atribuição removida.",
        data: {
          cartaoId: Number(req.params.cartaoId),
          usuarioId: Number(req.params.usuarioId),
        },
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = cartaoAtribuicaoController;
