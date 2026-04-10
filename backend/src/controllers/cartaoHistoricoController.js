const store = require("../data/boardMemoryStore");

const cartaoHistoricoController = {
  async listar(req, res, next) {
    try {
      const { quadroId, cartaoId } = req.params;

      if (!store.findCartao(quadroId, cartaoId)) {
        return res.status(404).json({
          success: false,
          message: "Cartão não encontrado.",
        });
      }

      return res.status(200).json({
        success: true,
        data: store.listHistoricoOrdenado(quadroId, cartaoId),
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = cartaoHistoricoController;
