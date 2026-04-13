const cartaoHistoricoService = require("../services/cartaoHistoricoService");

const cartaoHistoricoController = {
  async listar(req, res, next) {
    try {
      const data = await cartaoHistoricoService.listar(
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
};

module.exports = cartaoHistoricoController;
