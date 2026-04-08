const organizacaoService = require("../services/organizacaoService");

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

const organizacaoController = {
  async listar(req, res, next) {
    try {
      const usuarioId = req.usuario?.id || req.user?.id || null;

      const resultado = await organizacaoService.listar({
        usuarioId,
        busca: req.query.busca || "",
        ativo:
          req.query.ativo === undefined
            ? undefined
            : String(req.query.ativo) === "true",
      });

      return res.status(200).json({
        success: true,
        data: resultado,
      });
    } catch (error) {
      return next(error);
    }
  },

  async obterPorId(req, res, next) {
    try {
      const organizacaoId = parseId(req.params.organizacaoId);

      if (!organizacaoId) {
        return res.status(400).json({
          success: false,
          message: "ID da organização inválido.",
        });
      }

      const resultado = await organizacaoService.obterPorId(organizacaoId);

      if (!resultado) {
        return res.status(404).json({
          success: false,
          message: "Organização não encontrada.",
        });
      }

      return res.status(200).json({
        success: true,
        data: resultado,
      });
    } catch (error) {
      return next(error);
    }
  },

  async criar(req, res, next) {
    try {
      const { nome, slug, ativo } = req.body;
      const criadoPorUsuarioId = req.usuario?.id || req.user?.id || null;

      if (!nome || String(nome).trim() === "") {
        return res.status(400).json({
          success: false,
          message: "O nome da organização é obrigatório.",
        });
      }

      if (!slug || String(slug).trim() === "") {
        return res.status(400).json({
          success: false,
          message: "O slug da organização é obrigatório.",
        });
      }

      const resultado = await organizacaoService.criar({
        nome: String(nome).trim(),
        slug: String(slug).trim(),
        ativo:
          ativo === undefined
            ? true
            : Boolean(ativo),
        criadoPorUsuarioId,
      });

      return res.status(201).json({
        success: true,
        message: "Organização criada com sucesso.",
        data: resultado,
      });
    } catch (error) {
      return next(error);
    }
  },

  async atualizar(req, res, next) {
    try {
      const organizacaoId = parseId(req.params.organizacaoId);

      if (!organizacaoId) {
        return res.status(400).json({
          success: false,
          message: "ID da organização inválido.",
        });
      }

      const payload = {};

      if (req.body.nome !== undefined) {
        payload.nome = String(req.body.nome).trim();
      }

      if (req.body.slug !== undefined) {
        payload.slug = String(req.body.slug).trim();
      }

      if (req.body.ativo !== undefined) {
        payload.ativo = Boolean(req.body.ativo);
      }

      const resultado = await organizacaoService.atualizar(
        organizacaoId,
        payload
      );

      if (!resultado) {
        return res.status(404).json({
          success: false,
          message: "Organização não encontrada.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Organização atualizada com sucesso.",
        data: resultado,
      });
    } catch (error) {
      return next(error);
    }
  },

  async remover(req, res, next) {
    try {
      const organizacaoId = parseId(req.params.organizacaoId);

      if (!organizacaoId) {
        return res.status(400).json({
          success: false,
          message: "ID da organização inválido.",
        });
      }

      const removida = await organizacaoService.remover(organizacaoId);

      if (!removida) {
        return res.status(404).json({
          success: false,
          message: "Organização não encontrada.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Organização removida com sucesso.",
      });
    } catch (error) {
      return next(error);
    }
  },

  async obterConfiguracoes(req, res, next) {
    try {
      return res.status(501).json({
        success: false,
        message:
          "Configurações de organização ainda não possuem modelagem persistente no schema atual.",
      });
    } catch (error) {
      return next(error);
    }
  },

  async atualizarConfiguracoes(req, res, next) {
    try {
      return res.status(501).json({
        success: false,
        message:
          "Configurações de organização ainda não possuem modelagem persistente no schema atual.",
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = organizacaoController;
