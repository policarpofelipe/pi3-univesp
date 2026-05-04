const conviteService = require("../services/conviteService");

const conviteController = {
  async listarPendentes(req, res, next) {
    try {
      const data = await conviteService.listarPendentesParaUsuario(req.usuario.id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  },

  async obterPorId(req, res, next) {
    try {
      const data = await conviteService.obterDetalhe(
        req.params.conviteId,
        req.usuario.id
      );
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  },

  async aceitar(req, res, next) {
    try {
      const data = await conviteService.aceitar(
        req.params.conviteId,
        req.usuario.id
      );
      return res.status(200).json({
        success: true,
        message: "Convite aceito com sucesso.",
        data,
      });
    } catch (error) {
      return next(error);
    }
  },

  async recusar(req, res, next) {
    try {
      await conviteService.recusar(req.params.conviteId, req.usuario.id);
      return res.status(200).json({
        success: true,
        message: "Convite recusado.",
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = conviteController;
