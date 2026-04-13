const visaoService = require("../services/visaoService");

const visaoController = {
  async listar(req, res, next) {
    try {
      const data = await visaoService.listar(req.params.quadroId);
      if (!data) return res.status(404).json({ success: false, message: "Quadro não encontrado." });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  },

  async criar(req, res, next) {
    try {
      const data = await visaoService.criar(req.params.quadroId, req.body || {});
      if (!data) return res.status(404).json({ success: false, message: "Quadro não encontrado." });
      return res.status(201).json({ success: true, message: "Visão criada.", data });
    } catch (error) {
      return next(error);
    }
  },

  async atualizar(req, res, next) {
    try {
      const data = await visaoService.atualizar(
        req.params.quadroId,
        req.params.visaoId,
        req.body || {}
      );
      if (!data) return res.status(404).json({ success: false, message: "Visão não encontrada." });
      return res.status(200).json({ success: true, message: "Visão atualizada.", data });
    } catch (error) {
      return next(error);
    }
  },

  async remover(req, res, next) {
    try {
      const removed = await visaoService.remover(req.params.quadroId, req.params.visaoId);
      if (!removed) return res.status(404).json({ success: false, message: "Visão não encontrada." });
      return res.status(200).json({ success: true, message: "Visão removida.", data: { id: Number(req.params.visaoId) } });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = visaoController;

