const cartaoCampoValorService = require("../services/cartaoCampoValorService");

const cartaoCampoValorController = {
  async listar(req, res, next) {
    try {
      const data = await cartaoCampoValorService.listar(
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

  async definir(req, res, next) {
    try {
      const data = await cartaoCampoValorService.definir(
        req.params.quadroId,
        req.params.cartaoId,
        req.params.campoId,
        req.body || {},
        req.usuario?.id || null
      );
      if (!data) {
        return res
          .status(404)
          .json({ success: false, message: "Cartão não encontrado." });
      }
      return res.status(200).json({
        success: true,
        message: "Valor de campo atualizado.",
        data,
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = cartaoCampoValorController;
