const quadroService = require("../services/quadroService");

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

const quadroController = {
  async listar(req, res, next) {
    try {
      const data = await quadroService.listar({
        organizacaoId: req.query.organizacaoId,
        arquivado: req.query.arquivado,
        busca: req.query.busca,
        limit: req.query.limit,
        offset: req.query.offset,
      });

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
      const quadroId = parseId(req.params.quadroId);
      if (!quadroId) {
        return res.status(400).json({
          success: false,
          message: "ID do quadro inválido.",
        });
      }

      const data = await quadroService.obterPorId(quadroId);
      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Quadro não encontrado.",
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
      const data = await quadroService.criar({
        nome: req.body.nome,
        descricao: req.body.descricao,
        organizacaoId: req.body.organizacaoId,
        criadoPorUsuarioId: req.usuario?.id,
      });

      return res.status(201).json({
        success: true,
        message: "Quadro criado com sucesso.",
        data,
      });
    } catch (error) {
      return next(error);
    }
  },

  async atualizar(req, res, next) {
    try {
      const quadroId = parseId(req.params.quadroId);
      if (!quadroId) {
        return res.status(400).json({
          success: false,
          message: "ID do quadro inválido.",
        });
      }

      const data = await quadroService.atualizar(quadroId, {
        nome: req.body.nome,
        descricao: req.body.descricao,
      });
      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Quadro não encontrado.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Quadro atualizado com sucesso.",
        data,
      });
    } catch (error) {
      return next(error);
    }
  },

  async remover(req, res, next) {
    try {
      const quadroId = parseId(req.params.quadroId);
      if (!quadroId) {
        return res.status(400).json({
          success: false,
          message: "ID do quadro inválido.",
        });
      }

      const removido = await quadroService.remover(quadroId);
      if (!removido) {
        return res.status(404).json({
          success: false,
          message: "Quadro não encontrado.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Quadro removido com sucesso.",
        data: { id: quadroId },
      });
    } catch (error) {
      return next(error);
    }
  },

  async obterConfiguracoes(req, res, next) {
    try {
      const quadroId = parseId(req.params.quadroId);
      if (!quadroId) {
        return res.status(400).json({
          success: false,
          message: "ID do quadro inválido.",
        });
      }

      const data = await quadroService.obterConfiguracoes(quadroId, req.usuario?.id);
      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Quadro não encontrado.",
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

  async atualizarConfiguracoes(req, res, next) {
    try {
      const quadroId = parseId(req.params.quadroId);
      if (!quadroId) {
        return res.status(400).json({
          success: false,
          message: "ID do quadro inválido.",
        });
      }

      const data = await quadroService.atualizarConfiguracoes(
        quadroId,
        req.usuario?.id,
        req.body || {}
      );
      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Quadro não encontrado.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Configurações do quadro atualizadas com sucesso.",
        data,
      });
    } catch (error) {
      return next(error);
    }
  },

  async arquivar(req, res, next) {
    try {
      const quadroId = parseId(req.params.quadroId);
      if (!quadroId) {
        return res.status(400).json({
          success: false,
          message: "ID do quadro inválido.",
        });
      }

      const data = await quadroService.arquivar(quadroId);
      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Quadro não encontrado.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Quadro arquivado com sucesso.",
        data,
      });
    } catch (error) {
      return next(error);
    }
  },

  async desarquivar(req, res, next) {
    try {
      const quadroId = parseId(req.params.quadroId);
      if (!quadroId) {
        return res.status(400).json({
          success: false,
          message: "ID do quadro inválido.",
        });
      }

      const data = await quadroService.desarquivar(quadroId);
      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Quadro não encontrado.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Quadro desarquivado com sucesso.",
        data,
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = quadroController;