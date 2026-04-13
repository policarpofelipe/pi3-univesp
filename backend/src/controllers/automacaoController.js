const automacaoService = require("../services/automacaoService");

const automacaoController = {
  async listar(req, res, next) {
    try {
      const data = await automacaoService.listar(req.params.quadroId);
      if (!data) return res.status(404).json({ success: false, message: "Quadro não encontrado." });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  },

  async criar(req, res, next) {
    try {
      const data = await automacaoService.criar(
        req.params.quadroId,
        req.body || {},
        req.usuario?.id || null
      );
      if (!data) return res.status(404).json({ success: false, message: "Quadro não encontrado." });
      return res.status(201).json({ success: true, message: "Automação criada.", data });
    } catch (error) {
      return next(error);
    }
  },

  async atualizar(req, res, next) {
    try {
      const data = await automacaoService.atualizar(
        req.params.quadroId,
        req.params.automacaoId,
        req.body || {}
      );
      if (!data) return res.status(404).json({ success: false, message: "Automação não encontrada." });
      return res.status(200).json({ success: true, message: "Automação atualizada.", data });
    } catch (error) {
      return next(error);
    }
  },

  async remover(req, res, next) {
    try {
      const removed = await automacaoService.remover(
        req.params.quadroId,
        req.params.automacaoId
      );
      if (!removed) return res.status(404).json({ success: false, message: "Automação não encontrada." });
      return res.status(200).json({ success: true, message: "Automação removida.", data: { id: Number(req.params.automacaoId) } });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = automacaoController;

