const cartaoComentarioService = require("../services/cartaoComentarioService");

const cartaoComentarioController = {
  async listar(req, res, next) {
    try {
      const data = await cartaoComentarioService.listar(
        req.params.quadroId,
        req.params.cartaoId
      );
      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Cartão não encontrado.",
        });
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
      const data = await cartaoComentarioService.criar(
        req.params.quadroId,
        req.params.cartaoId,
        req.body?.texto,
        req.usuario
      );
      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Cartão não encontrado.",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Comentário adicionado.",
        data,
      });
    } catch (error) {
      return next(error);
    }
  },

  async remover(req, res, next) {
    try {
      const removed = await cartaoComentarioService.remover(
        req.params.quadroId,
        req.params.cartaoId,
        req.params.comentarioId,
        req.usuario
      );
      if (removed === null) {
        return res.status(404).json({
          success: false,
          message: "Cartão não encontrado.",
        });
      }
      if (removed === false) {
        return res.status(404).json({
          success: false,
          message: "Comentário não encontrado.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Comentário removido.",
        data: { id: Number(req.params.comentarioId) },
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = cartaoComentarioController;
