const quadroPapelController = {
  async listar(req, res, next) {
    try {
      const { quadroId } = req.params;

      return res.status(200).json({
        success: true,
        data: [
          {
            id: "pap-001",
            quadroId,
            nome: "Administrador",
            descricao:
              "Papel com controle amplo sobre estrutura, membros, configurações e fluxo do quadro.",
            membros: 1,
            permissoes: {
              visualizarQuadro: true,
              editarQuadro: true,
              excluirQuadro: true,
              gerenciarMembros: true,
              moverCartoes: true,
              editarListas: true,
            },
          },
          {
            id: "pap-002",
            quadroId,
            nome: "Colaborador",
            descricao:
              "Papel operacional voltado para execução diária, edição de conteúdo e movimentação entre listas.",
            membros: 4,
            permissoes: {
              visualizarQuadro: true,
              editarQuadro: false,
              excluirQuadro: false,
              gerenciarMembros: false,
              moverCartoes: true,
              editarListas: true,
            },
          },
          {
            id: "pap-003",
            quadroId,
            nome: "Leitor",
            descricao:
              "Papel restrito à consulta do quadro, sem capacidade de alteração estrutural ou operacional.",
            membros: 2,
            permissoes: {
              visualizarQuadro: true,
              editarQuadro: false,
              excluirQuadro: false,
              gerenciarMembros: false,
              moverCartoes: false,
              editarListas: false,
            },
          },
        ],
      });
    } catch (error) {
      return next(error);
    }
  },

  async obterPorId(req, res, next) {
    try {
      const { quadroId, papelId } = req.params;

      return res.status(200).json({
        success: true,
        data: {
          id: papelId,
          quadroId,
          nome: "Administrador",
          descricao:
            "Papel com controle amplo sobre estrutura, membros, configurações e fluxo do quadro.",
          membros: 1,
          permissoes: {
            visualizarQuadro: true,
            editarQuadro: true,
            excluirQuadro: true,
            gerenciarMembros: true,
            moverCartoes: true,
            editarListas: true,
          },
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  async criar(req, res, next) {
    try {
      const { quadroId } = req.params;
      const { nome, descricao = "", permissoes = {} } = req.body;

      if (!nome) {
        return res.status(400).json({
          success: false,
          message: "O nome do papel é obrigatório.",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Papel criado com sucesso.",
        data: {
          id: "pap-novo",
          quadroId,
          nome,
          descricao,
          membros: 0,
          permissoes: {
            visualizarQuadro: Boolean(permissoes.visualizarQuadro),
            editarQuadro: Boolean(permissoes.editarQuadro),
            excluirQuadro: Boolean(permissoes.excluirQuadro),
            gerenciarMembros: Boolean(permissoes.gerenciarMembros),
            moverCartoes: Boolean(permissoes.moverCartoes),
            editarListas: Boolean(permissoes.editarListas),
          },
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  async atualizar(req, res, next) {
    try {
      const { quadroId, papelId } = req.params;
      const { nome, descricao } = req.body;

      return res.status(200).json({
        success: true,
        message: "Papel atualizado com sucesso.",
        data: {
          id: papelId,
          quadroId,
          nome: nome || "Papel sem nome",
          descricao: descricao || "",
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  async atualizarPermissoes(req, res, next) {
    try {
      const { quadroId, papelId } = req.params;
      const { permissoes } = req.body;

      if (!permissoes || typeof permissoes !== "object") {
        return res.status(400).json({
          success: false,
          message: "O objeto de permissões é obrigatório.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Permissões do papel atualizadas com sucesso.",
        data: {
          id: papelId,
          quadroId,
          permissoes: {
            visualizarQuadro: Boolean(permissoes.visualizarQuadro),
            editarQuadro: Boolean(permissoes.editarQuadro),
            excluirQuadro: Boolean(permissoes.excluirQuadro),
            gerenciarMembros: Boolean(permissoes.gerenciarMembros),
            moverCartoes: Boolean(permissoes.moverCartoes),
            editarListas: Boolean(permissoes.editarListas),
          },
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  async remover(req, res, next) {
    try {
      const { quadroId, papelId } = req.params;

      return res.status(200).json({
        success: true,
        message: "Papel removido com sucesso.",
        data: {
          id: papelId,
          quadroId,
        },
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = quadroPapelController;