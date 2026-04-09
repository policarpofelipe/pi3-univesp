const quadroController = {
  async listar(req, res, next) {
    try {
      return res.status(200).json({
        success: true,
        data: [
          {
            id: "qdr-001",
            nome: "Produto e Backlog",
            descricao: "Quadro principal do sistema.",
            organizacaoId: "org-001",
            visibilidade: "privado",
            arquivado: false,
          },
        ],
      });
    } catch (error) {
      return next(error);
    }
  },

  async obterPorId(req, res, next) {
    try {
      const { quadroId } = req.params;

      return res.status(200).json({
        success: true,
        data: {
          id: quadroId,
          nome: "Produto e Backlog",
          descricao: "Quadro principal do sistema.",
          organizacaoId: "org-001",
          visibilidade: "privado",
          arquivado: false,
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  async criar(req, res, next) {
    try {
      const {
        nome,
        descricao,
        organizacaoId,
        visibilidade = "privado",
      } = req.body;

      if (!nome || !organizacaoId) {
        return res.status(400).json({
          success: false,
          message: "Nome e organizacaoId são obrigatórios.",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Quadro criado com sucesso.",
        data: {
          id: "qdr-novo",
          nome,
          descricao: descricao || "",
          organizacaoId,
          visibilidade,
          arquivado: false,
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  async atualizar(req, res, next) {
    try {
      const { quadroId } = req.params;
      const {
        nome,
        descricao,
        visibilidade,
      } = req.body;

      return res.status(200).json({
        success: true,
        message: "Quadro atualizado com sucesso.",
        data: {
          id: quadroId,
          nome: nome || "Produto e Backlog",
          descricao: descricao || "",
          visibilidade: visibilidade || "privado",
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  async remover(req, res, next) {
    try {
      const { quadroId } = req.params;

      return res.status(200).json({
        success: true,
        message: "Quadro removido com sucesso.",
        data: {
          id: quadroId,
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  async obterConfiguracoes(req, res, next) {
    try {
      const { quadroId } = req.params;

      return res.status(200).json({
        success: true,
        data: {
          quadroId,
          visibilidade: "privado",
          arquivado: false,
          permitirConvites: true,
          permitirComentarios: true,
          exigirPermissaoMoverCartoes: false,
          permitirTransicoesLivres: true,
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  async atualizarConfiguracoes(req, res, next) {
    try {
      const { quadroId } = req.params;
      const {
        visibilidade,
        arquivado,
        permitirConvites,
        permitirComentarios,
        exigirPermissaoMoverCartoes,
        permitirTransicoesLivres,
      } = req.body;

      return res.status(200).json({
        success: true,
        message: "Configurações do quadro atualizadas com sucesso.",
        data: {
          quadroId,
          visibilidade: visibilidade || "privado",
          arquivado: Boolean(arquivado),
          permitirConvites: Boolean(permitirConvites),
          permitirComentarios: Boolean(permitirComentarios),
          exigirPermissaoMoverCartoes: Boolean(exigirPermissaoMoverCartoes),
          permitirTransicoesLivres: Boolean(permitirTransicoesLivres),
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  async arquivar(req, res, next) {
    try {
      const { quadroId } = req.params;

      return res.status(200).json({
        success: true,
        message: "Quadro arquivado com sucesso.",
        data: {
          id: quadroId,
          arquivado: true,
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  async desarquivar(req, res, next) {
    try {
      const { quadroId } = req.params;

      return res.status(200).json({
        success: true,
        message: "Quadro desarquivado com sucesso.",
        data: {
          id: quadroId,
          arquivado: false,
        },
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = quadroController;