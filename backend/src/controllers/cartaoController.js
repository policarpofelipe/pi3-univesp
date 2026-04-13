const cartaoService = require("../services/cartaoService");

const cartaoController = {
  async listar(req, res, next) {
    try {
      const sorted = await cartaoService.listar(req.params.quadroId, req.query || {});

      return res.status(200).json({
        success: true,
        data: sorted,
      });
    } catch (error) {
      return next(error);
    }
  },

  async obterPorId(req, res, next) {
    try {
      const cartao = await cartaoService.obterPorId(
        req.params.quadroId,
        req.params.cartaoId
      );

      if (!cartao) {
        return res.status(404).json({
          success: false,
          message: "Cartão não encontrado.",
        });
      }

      return res.status(200).json({
        success: true,
        data: cartao,
      });
    } catch (error) {
      return next(error);
    }
  },

  async criar(req, res, next) {
    try {
      const novo = await cartaoService.criar(
        req.params.quadroId,
        req.body || {},
        req.usuario?.id || null
      );

      return res.status(201).json({
        success: true,
        message: "Cartão criado com sucesso.",
        data: novo,
      });
    } catch (error) {
      return next(error);
    }
  },

  async atualizar(req, res, next) {
    try {
      const cartao = await cartaoService.atualizar(
        req.params.quadroId,
        req.params.cartaoId,
        req.body || {}
      );

      if (!cartao) {
        return res.status(404).json({
          success: false,
          message: "Cartão não encontrado.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Cartão atualizado com sucesso.",
        data: cartao,
      });
    } catch (error) {
      return next(error);
    }
  },

  async mover(req, res, next) {
    try {
      const cartao = await cartaoService.mover(
        req.params.quadroId,
        req.params.cartaoId,
        req.body || {}
      );

      if (!cartao) {
        return res.status(404).json({
          success: false,
          message: "Cartão não encontrado.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Cartão movido com sucesso.",
        data: cartao,
      });
    } catch (error) {
      return next(error);
    }
  },

  async remover(req, res, next) {
    try {
      const removido = await cartaoService.remover(
        req.params.quadroId,
        req.params.cartaoId
      );
      if (!removido) {
        return res.status(404).json({
          success: false,
          message: "Cartão não encontrado.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Cartão removido com sucesso.",
        data: { id: Number(req.params.cartaoId), quadroId: Number(req.params.quadroId) },
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = cartaoController;
