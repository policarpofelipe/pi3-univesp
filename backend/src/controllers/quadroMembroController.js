const quadroMembroController = {
  async listar(req, res, next) {
    try {
      const { quadroId } = req.params;

      return res.status(200).json({
        success: true,
        data: [
          {
            id: "qmb-001",
            quadroId,
            usuarioId: "usr-001",
            nome: "Felipe Policarpo",
            email: "felipe@email.com",
            papel: "Administrador",
            status: "ativo",
            entrouEm: "2026-04-01",
          },
          {
            id: "qmb-002",
            quadroId,
            usuarioId: "usr-002",
            nome: "Ana Flávia",
            email: "ana@email.com",
            papel: "Colaboradora",
            status: "ativo",
            entrouEm: "2026-04-02",
          },
        ],
      });
    } catch (error) {
      return next(error);
    }
  },

  async obterPorId(req, res, next) {
    try {
      const { quadroId, membroId } = req.params;

      return res.status(200).json({
        success: true,
        data: {
          id: membroId,
          quadroId,
          usuarioId: "usr-001",
          nome: "Felipe Policarpo",
          email: "felipe@email.com",
          papel: "Administrador",
          status: "ativo",
          entrouEm: "2026-04-01",
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  async adicionar(req, res, next) {
    try {
      const { quadroId } = req.params;
      const { usuarioId, papel = "Colaborador" } = req.body;

      if (!usuarioId) {
        return res.status(400).json({
          success: false,
          message: "usuarioId é obrigatório.",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Membro adicionado ao quadro com sucesso.",
        data: {
          id: "qmb-novo",
          quadroId,
          usuarioId,
          papel,
          status: "ativo",
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  async convidar(req, res, next) {
    try {
      const { quadroId } = req.params;
      const { email, papel = "Colaborador" } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "E-mail é obrigatório para convite.",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Convite enviado com sucesso.",
        data: {
          id: "qmb-convite",
          quadroId,
          email,
          papel,
          status: "pendente",
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  async atualizar(req, res, next) {
    try {
      const { quadroId, membroId } = req.params;
      const { papel, status } = req.body;

      return res.status(200).json({
        success: true,
        message: "Membro do quadro atualizado com sucesso.",
        data: {
          id: membroId,
          quadroId,
          papel: papel || "Colaborador",
          status: status || "ativo",
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  async atualizarPapel(req, res, next) {
    try {
      const { quadroId, membroId } = req.params;
      const { papel } = req.body;

      if (!papel) {
        return res.status(400).json({
          success: false,
          message: "O papel é obrigatório.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Papel do membro atualizado com sucesso.",
        data: {
          id: membroId,
          quadroId,
          papel,
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  async reenviarConvite(req, res, next) {
    try {
      const { quadroId, membroId } = req.params;

      return res.status(200).json({
        success: true,
        message: "Convite reenviado com sucesso.",
        data: {
          id: membroId,
          quadroId,
          status: "pendente",
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  async remover(req, res, next) {
    try {
      const { quadroId, membroId } = req.params;

      return res.status(200).json({
        success: true,
        message: "Membro removido do quadro com sucesso.",
        data: {
          id: membroId,
          quadroId,
        },
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = quadroMembroController;