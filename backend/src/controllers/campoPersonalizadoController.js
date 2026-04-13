const campoPersonalizadoService = require("../services/campoPersonalizadoService");

const campoPersonalizadoController = {
  async listar(req, res, next) {
    try {
      const data = await campoPersonalizadoService.listar(req.params.quadroId);
      if (!data) return res.status(404).json({ success: false, message: "Quadro não encontrado." });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  },

  async criar(req, res, next) {
    try {
      const data = await campoPersonalizadoService.criar(req.params.quadroId, req.body || {});
      if (!data) return res.status(404).json({ success: false, message: "Quadro não encontrado." });
      return res.status(201).json({ success: true, message: "Campo personalizado criado.", data });
    } catch (error) {
      return next(error);
    }
  },

  async atualizar(req, res, next) {
    try {
      const data = await campoPersonalizadoService.atualizar(
        req.params.quadroId,
        req.params.campoId,
        req.body || {}
      );
      if (!data) return res.status(404).json({ success: false, message: "Campo não encontrado." });
      return res.status(200).json({ success: true, message: "Campo atualizado.", data });
    } catch (error) {
      return next(error);
    }
  },

  async remover(req, res, next) {
    try {
      const removed = await campoPersonalizadoService.remover(
        req.params.quadroId,
        req.params.campoId
      );
      if (!removed) return res.status(404).json({ success: false, message: "Campo não encontrado." });
      return res.status(200).json({ success: true, message: "Campo removido.", data: { id: Number(req.params.campoId) } });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = campoPersonalizadoController;

