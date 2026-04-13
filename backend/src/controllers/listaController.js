const listaService = require("../services/listaService");

const listaController = {
  async listar(req, res, next) {
    try {
      const data = await listaService.listar(req.params.quadroId);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      return next(error);
    }
  },

  async obterPorId(req, res, next) {
    try {
      const lista = await listaService.obterPorId(
        req.params.quadroId,
        req.params.listaId
      );

      if (!lista) {
        return res.status(404).json({
          success: false,
          message: "Lista não encontrada.",
        });
      }

      return res.status(200).json({
        success: true,
        data: lista,
      });
    } catch (error) {
      return next(error);
    }
  },

  async criar(req, res, next) {
    try {
      const nova = await listaService.criar(req.params.quadroId, req.body || {});

      return res.status(201).json({
        success: true,
        message: "Lista criada com sucesso.",
        data: nova,
      });
    } catch (error) {
      return next(error);
    }
  },

  async atualizar(req, res, next) {
    try {
      const lista = await listaService.atualizar(
        req.params.quadroId,
        req.params.listaId,
        req.body || {}
      );

      if (!lista) {
        return res.status(404).json({
          success: false,
          message: "Lista não encontrada.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Lista atualizada com sucesso.",
        data: lista,
      });
    } catch (error) {
      return next(error);
    }
  },

  async remover(req, res, next) {
    try {
      const removida = await listaService.remover(
        req.params.quadroId,
        req.params.listaId
      );
      if (!removida) {
        return res.status(404).json({
          success: false,
          message: "Lista não encontrada.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Lista removida com sucesso.",
        data: { id: Number(req.params.listaId), quadroId: Number(req.params.quadroId) },
      });
    } catch (error) {
      return next(error);
    }
  },

  async reordenar(req, res, next) {
    try {
      const data = await listaService.reordenar(
        req.params.quadroId,
        req.body?.ids || []
      );

      return res.status(200).json({
        success: true,
        message: "Ordem das listas atualizada.",
        data,
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = listaController;
