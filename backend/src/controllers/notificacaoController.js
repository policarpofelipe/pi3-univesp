const notificacaoService = require("../services/notificacaoService");

const notificacaoController = {
  async listar(req, res, next) {
    try {
      const data = await notificacaoService.listar(req.usuario.id, req.query);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  },

  async contarNaoLidas(req, res, next) {
    try {
      const data = await notificacaoService.contarNaoLidas(req.usuario.id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  },

  async marcarComoLida(req, res, next) {
    try {
      await notificacaoService.marcarComoLida(
        req.params.notificacaoId,
        req.usuario.id
      );
      return res.status(200).json({
        success: true,
        message: "Notificação marcada como lida.",
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = notificacaoController;
