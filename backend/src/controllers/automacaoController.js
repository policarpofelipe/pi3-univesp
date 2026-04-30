const automacaoService = require("../services/automacaoService");

function apiError(code, message) {
  return {
    success: false,
    error: { code, message },
  };
}

const automacaoController = {
  async listar(req, res, next) {
    try {
      const data = await automacaoService.listar(req.params.quadroId);
      if (!data) {
        return res
          .status(404)
          .json(apiError("AUTOMACAO_QUADRO_NOT_FOUND", "Quadro não encontrado."));
      }
      return res.status(200).json({
        success: true,
        data,
        message: "Automações listadas com sucesso.",
      });
    } catch (error) {
      if (error.statusCode) {
        return res
          .status(error.statusCode)
          .json(apiError(error.code || "AUTOMACAO_LISTAR_ERROR", error.message));
      }
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
      if (!data) {
        return res
          .status(404)
          .json(apiError("AUTOMACAO_QUADRO_NOT_FOUND", "Quadro não encontrado."));
      }
      return res.status(201).json({
        success: true,
        message: "Automação criada com sucesso.",
        data,
      });
    } catch (error) {
      if (error.statusCode) {
        return res
          .status(error.statusCode)
          .json(apiError(error.code || "AUTOMACAO_CRIAR_ERROR", error.message));
      }
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
      if (!data) {
        return res
          .status(404)
          .json(apiError("AUTOMACAO_NOT_FOUND", "Automação não encontrada."));
      }
      return res.status(200).json({
        success: true,
        message: "Automação atualizada com sucesso.",
        data,
      });
    } catch (error) {
      if (error.statusCode) {
        return res
          .status(error.statusCode)
          .json(apiError(error.code || "AUTOMACAO_ATUALIZAR_ERROR", error.message));
      }
      return next(error);
    }
  },

  async remover(req, res, next) {
    try {
      const removed = await automacaoService.remover(
        req.params.quadroId,
        req.params.automacaoId
      );
      if (!removed) {
        return res
          .status(404)
          .json(apiError("AUTOMACAO_NOT_FOUND", "Automação não encontrada."));
      }
      return res.status(200).json({
        success: true,
        message: "Automação removida com sucesso.",
        data: { id: Number(req.params.automacaoId) },
      });
    } catch (error) {
      if (error.statusCode) {
        return res
          .status(error.statusCode)
          .json(apiError(error.code || "AUTOMACAO_REMOVER_ERROR", error.message));
      }
      return next(error);
    }
  },
};

module.exports = automacaoController;

