const cartaoAnexoService = require("../services/cartaoAnexoService");

const cartaoAnexoController = {
  async listar(req, res, next) {
    try {
      const data = await cartaoAnexoService.listar(
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

  async obterPorId(req, res, next) {
    try {
      const data = await cartaoAnexoService.obterPorId(
        req.params.quadroId,
        req.params.cartaoId,
        req.params.anexoId
      );
      if (data === null) {
        return res.status(404).json({
          success: false,
          message: "Cartão não encontrado.",
        });
      }
      if (data === false) {
        return res.status(404).json({
          success: false,
          message: "Anexo não encontrado.",
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
      const data = await cartaoAnexoService.criar(
        req.params.quadroId,
        req.params.cartaoId,
        req.body || {},
        req.usuario?.id || null
      );
      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Cartão não encontrado.",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Anexo adicionado.",
        data,
      });
    } catch (error) {
      return next(error);
    }
  },

  async remover(req, res, next) {
    try {
      const removed = await cartaoAnexoService.remover(
        req.params.quadroId,
        req.params.cartaoId,
        req.params.anexoId,
        req.usuario?.id || null
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
          message: "Anexo não encontrado.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Anexo removido.",
        data: { id: Number(req.params.anexoId) },
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = cartaoAnexoController;
