const quadroMembroService = require("../services/quadroMembroService");

const quadroMembroController = {
  async listar(req, res, next) {
    try {
      const data = await quadroMembroService.listar(req.params.quadroId, req.query);

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
      const data = await quadroMembroService.obterPorId(
        req.params.quadroId,
        req.params.membroId
      );
      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Membro do quadro não encontrado.",
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

  async adicionar(req, res, next) {
    try {
      const data = await quadroMembroService.adicionar(req.params.quadroId, req.body || {});

      return res.status(201).json({
        success: true,
        message: "Membro adicionado ao quadro com sucesso.",
        data,
      });
    } catch (error) {
      return next(error);
    }
  },

  async convidar(req, res, next) {
    try {
      const data = await quadroMembroService.convidar(req.params.quadroId, req.body || {});

      return res.status(201).json({
        success: true,
        message: "Convite enviado com sucesso.",
        data,
      });
    } catch (error) {
      return next(error);
    }
  },

  async atualizar(req, res, next) {
    try {
      const data = await quadroMembroService.atualizar(
        req.params.quadroId,
        req.params.membroId,
        req.body || {}
      );
      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Membro do quadro não encontrado.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Membro do quadro atualizado com sucesso.",
        data,
      });
    } catch (error) {
      return next(error);
    }
  },

  async atualizarPapel(req, res, next) {
    try {
      const data = await quadroMembroService.atualizarPapelPorNome(
        req.params.quadroId,
        req.params.membroId,
        req.body?.papel
      );
      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Membro do quadro não encontrado.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Papel do membro atualizado com sucesso.",
        data,
      });
    } catch (error) {
      return next(error);
    }
  },

  async reenviarConvite(req, res, next) {
    try {
      const data = await quadroMembroService.obterPorId(
        req.params.quadroId,
        req.params.membroId
      );
      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Membro do quadro não encontrado.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Convite reenviado com sucesso.",
        data,
      });
    } catch (error) {
      return next(error);
    }
  },

  async remover(req, res, next) {
    try {
      const removido = await quadroMembroService.remover(
        req.params.quadroId,
        req.params.membroId
      );
      if (!removido) {
        return res.status(404).json({
          success: false,
          message: "Membro do quadro não encontrado.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Membro removido do quadro com sucesso.",
        data: {
          id: Number(req.params.membroId),
          quadroId: Number(req.params.quadroId),
        },
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = quadroMembroController;