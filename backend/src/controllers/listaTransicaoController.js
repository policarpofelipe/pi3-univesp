const listaTransicaoService = require("../services/listaTransicaoService");

const listaTransicaoController = {
  async listar(req, res, next) {
    try {
      const data = await listaTransicaoService.listar(
        req.params.quadroId,
        req.params.listaId
      );
      if (!data) return res.status(404).json({ success: false, message: "Lista de origem não encontrada." });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  },

  async criar(req, res, next) {
    try {
      const data = await listaTransicaoService.criar(
        req.params.quadroId,
        req.params.listaId,
        req.body || {}
      );
      return res.status(201).json({
        success: true,
        message: "Regra de transição criada.",
        data,
      });
    } catch (error) {
      return next(error);
    }
  },

  async remover(req, res, next) {
    try {
      const removed = await listaTransicaoService.remover(
        req.params.quadroId,
        req.params.listaId,
        req.params.regraId
      );
      if (removed === null) return res.status(404).json({ success: false, message: "Lista de origem não encontrada." });
      if (!removed) return res.status(404).json({ success: false, message: "Regra não encontrada." });
      return res.status(200).json({
        success: true,
        message: "Regra de transição removida.",
        data: { regraId: Number(req.params.regraId) },
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = listaTransicaoController;

