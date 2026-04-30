const tagService = require("../services/TagService");

function errorPayload(error, fallbackCode) {
  return {
    success: false,
    error: {
      code: error.code || fallbackCode,
      message: error.message || "Erro interno do servidor.",
    },
  };
}

const tagController = {
  async listar(req, res, next) {
    try {
      const data = await tagService.listar(req.params.quadroId);
      if (!data) {
        return res.status(404).json({
          success: false,
          error: {
            code: "TAG_QUADRO_NOT_FOUND",
            message: "Quadro não encontrado.",
          },
        });
      }
      return res.status(200).json({
        success: true,
        data,
        message: "Tags listadas com sucesso.",
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json(errorPayload(error, "TAG_LISTAR_ERROR"));
      }
      return next(error);
    }
  },

  async criar(req, res, next) {
    try {
      const data = await tagService.criar(req.params.quadroId, req.body || {});
      if (!data) {
        return res.status(404).json({
          success: false,
          error: {
            code: "TAG_QUADRO_NOT_FOUND",
            message: "Quadro não encontrado.",
          },
        });
      }
      return res.status(201).json({
        success: true,
        data,
        message: "Tag criada com sucesso.",
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json(errorPayload(error, "TAG_CRIAR_ERROR"));
      }
      return next(error);
    }
  },

  async atualizar(req, res, next) {
    try {
      const data = await tagService.atualizar(
        req.params.quadroId,
        req.params.tagId,
        req.body || {}
      );
      if (!data) {
        return res.status(404).json({
          success: false,
          error: {
            code: "TAG_NOT_FOUND",
            message: "Tag não encontrada.",
          },
        });
      }
      return res.status(200).json({
        success: true,
        data,
        message: "Tag atualizada com sucesso.",
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json(errorPayload(error, "TAG_ATUALIZAR_ERROR"));
      }
      return next(error);
    }
  },

  async remover(req, res, next) {
    try {
      const removed = await tagService.remover(req.params.quadroId, req.params.tagId);
      if (!removed) {
        return res.status(404).json({
          success: false,
          error: {
            code: "TAG_NOT_FOUND",
            message: "Tag não encontrada.",
          },
        });
      }
      return res.status(200).json({
        success: true,
        data: { id: Number(req.params.tagId) },
        message: "Tag desativada com sucesso.",
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json(errorPayload(error, "TAG_REMOVER_ERROR"));
      }
      return next(error);
    }
  },
};

module.exports = tagController;
