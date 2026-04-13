const listaPermissaoService = require("../services/listaPermissaoService");

const listaPermissaoController = {
  async listar(req, res, next) {
    try {
      const data = await listaPermissaoService.listar(
        req.params.quadroId,
        req.params.listaId
      );
      if (!data) return res.status(404).json({ success: false, message: "Lista não encontrada." });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  },

  async definir(req, res, next) {
    try {
      const data = await listaPermissaoService.definir(
        req.params.quadroId,
        req.params.listaId,
        req.body || {}
      );
      if (!data) return res.status(404).json({ success: false, message: "Lista não encontrada." });
      return res.status(200).json({
        success: true,
        message: "Permissão de lista atualizada.",
        data,
      });
    } catch (error) {
      return next(error);
    }
  },

  async remover(req, res, next) {
    try {
      const removed = await listaPermissaoService.remover(
        req.params.quadroId,
        req.params.listaId,
        req.params.papelId
      );
      if (removed === null) return res.status(404).json({ success: false, message: "Lista não encontrada." });
      if (!removed) return res.status(404).json({ success: false, message: "Permissão não encontrada." });
      return res.status(200).json({
        success: true,
        message: "Permissão removida.",
        data: { listaId: Number(req.params.listaId), papelId: Number(req.params.papelId) },
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = listaPermissaoController;

