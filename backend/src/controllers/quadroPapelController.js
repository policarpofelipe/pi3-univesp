const quadroPapelService = require("../services/quadroPapelService");

const quadroPapelController = {
  async listar(req, res, next) {
    try {
      const data = await quadroPapelService.listar(req.params.quadroId, req.query);

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
      const data = await quadroPapelService.obterPorId(
        req.params.quadroId,
        req.params.papelId
      );
      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Papel não encontrado.",
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

  async criar(req, res, next) {
    try {
      const data = await quadroPapelService.criar(req.params.quadroId, req.body || {});

      return res.status(201).json({
        success: true,
        message: "Papel criado com sucesso.",
        data,
      });
    } catch (error) {
      return next(error);
    }
  },

  async atualizar(req, res, next) {
    try {
      const data = await quadroPapelService.atualizar(
        req.params.quadroId,
        req.params.papelId,
        req.body || {}
      );
      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Papel não encontrado.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Papel atualizado com sucesso.",
        data,
      });
    } catch (error) {
      return next(error);
    }
  },

  async atualizarPermissoes(req, res, next) {
    try {
      const data = await quadroPapelService.atualizarPermissoes(
        req.params.quadroId,
        req.params.papelId,
        req.body?.permissoes || {}
      );
      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Papel não encontrado.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Permissões do papel atualizadas com sucesso.",
        data,
      });
    } catch (error) {
      return next(error);
    }
  },

  async remover(req, res, next) {
    try {
      const removido = await quadroPapelService.remover(
        req.params.quadroId,
        req.params.papelId
      );
      if (!removido) {
        return res.status(404).json({
          success: false,
          message: "Papel não encontrado.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Papel removido com sucesso.",
        data: {
          id: Number(req.params.papelId),
          quadroId: Number(req.params.quadroId),
        },
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = quadroPapelController;