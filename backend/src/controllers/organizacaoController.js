const organizacaoService = require("../services/organizacaoService");
const organizacaoRepository = require("../repositories/OrganizacaoRepository");

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
        ativo: ativo === undefined ? true : Boolean(ativo),
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

  async listarMembros(req, res, next) {
    try {
      const organizacaoId = parseId(req.params.organizacaoId);

      if (!organizacaoId) {
        return res.status(400).json({
          success: false,
          message: "ID da organização inválido.",
        });
      }

      const data = await organizacaoRepository.listarMembros(organizacaoId, {
        status: req.query.status,
        busca: req.query.busca || "",
      });

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      return next(error);
    }
  },

  async obterMembroPorId(req, res, next) {
    try {
      const organizacaoId = parseId(req.params.organizacaoId);
      const membroId = parseId(req.params.membroId);

      if (!organizacaoId || !membroId) {
        return res.status(400).json({
          success: false,
          message: "IDs informados são inválidos.",
        });
      }

      const data = await organizacaoRepository.obterMembroPorId(
        organizacaoId,
        membroId
      );

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Membro da organização não encontrado.",
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

  async convidarMembro(req, res, next) {
    try {
      const organizacaoId = parseId(req.params.organizacaoId);
      const { usuarioId, papel, status } = req.body;

      if (!organizacaoId) {
        return res.status(400).json({
          success: false,
          message: "ID da organização inválido.",
        });
      }

      if (!usuarioId) {
        return res.status(400).json({
          success: false,
          message: "O usuário do vínculo é obrigatório.",
        });
      }

      const data = await organizacaoRepository.adicionarMembro({
        organizacaoId,
        usuarioId: Number(usuarioId),
        papel: papel || "membro",
        status: status || "ativo",
      });

      return res.status(201).json({
        success: true,
        message: "Membro vinculado à organização com sucesso.",
        data,
      });
    } catch (error) {
      return next(error);
    }
  },

  async atualizarMembro(req, res, next) {
    try {
      const organizacaoId = parseId(req.params.organizacaoId);
      const membroId = parseId(req.params.membroId);

      if (!organizacaoId || !membroId) {
        return res.status(400).json({
          success: false,
          message: "IDs informados são inválidos.",
        });
      }

      const payload = {};

      if (req.body.papel !== undefined) {
        payload.papel = req.body.papel;
      }

      if (req.body.status !== undefined) {
        payload.status = req.body.status;
      }

      const data = await organizacaoRepository.atualizarMembro(
        organizacaoId,
        membroId,
        payload
      );

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Membro da organização não encontrado.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Membro atualizado com sucesso.",
        data,
      });
    } catch (error) {
      return next(error);
    }
  },

  async removerMembro(req, res, next) {
    try {
      const organizacaoId = parseId(req.params.organizacaoId);
      const membroId = parseId(req.params.membroId);

      if (!organizacaoId || !membroId) {
        return res.status(400).json({
          success: false,
          message: "IDs informados são inválidos.",
        });
      }

      const removido = await organizacaoRepository.removerMembro(
        organizacaoId,
        membroId
      );

      if (!removido) {
        return res.status(404).json({
          success: false,
          message: "Membro da organização não encontrado.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Membro removido com sucesso.",
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = organizacaoController;
