const store = require("../data/boardMemoryStore");

const cartaoComentarioController = {
  async listar(req, res, next) {
    try {
      const { quadroId, cartaoId } = req.params;

      if (!store.findCartao(quadroId, cartaoId)) {
        return res.status(404).json({
          success: false,
          message: "Cartão não encontrado.",
        });
      }

      const lista = store.getComentarios(quadroId, cartaoId);
      const sorted = [...lista].sort(
        (a, b) =>
          new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime()
      );

      return res.status(200).json({
        success: true,
        data: sorted,
      });
    } catch (error) {
      return next(error);
    }
  },

  async criar(req, res, next) {
    try {
      const { quadroId, cartaoId } = req.params;
      const { texto } = req.body;

      if (!store.findCartao(quadroId, cartaoId)) {
        return res.status(404).json({
          success: false,
          message: "Cartão não encontrado.",
        });
      }

      if (!texto || !String(texto).trim()) {
        return res.status(400).json({
          success: false,
          message: "O texto do comentário é obrigatório.",
        });
      }

      const usuario = req.usuario || {};
      const autorId = usuario.id != null ? String(usuario.id) : "";
      const autorNome =
        usuario.nomeExibicao ||
        usuario.nome_exibicao ||
        usuario.email ||
        "Usuário";

      const novo = {
        id: store.makeComentarioId(),
        quadroId: String(quadroId),
        cartaoId: String(cartaoId),
        texto: String(texto).trim(),
        autorId,
        autorNome: String(autorNome),
        criadoEm: new Date().toISOString(),
      };

      store.getComentarios(quadroId, cartaoId).push(novo);

      return res.status(201).json({
        success: true,
        message: "Comentário adicionado.",
        data: novo,
      });
    } catch (error) {
      return next(error);
    }
  },

  async remover(req, res, next) {
    try {
      const { quadroId, cartaoId, comentarioId } = req.params;

      if (!store.findCartao(quadroId, cartaoId)) {
        return res.status(404).json({
          success: false,
          message: "Cartão não encontrado.",
        });
      }

      const lista = store.getComentarios(quadroId, cartaoId);
      const idx = lista.findIndex(
        (c) => String(c.id) === String(comentarioId)
      );

      if (idx === -1) {
        return res.status(404).json({
          success: false,
          message: "Comentário não encontrado.",
        });
      }

      const autorId = req.usuario?.id != null ? String(req.usuario.id) : "";
      if (lista[idx].autorId && lista[idx].autorId !== autorId) {
        return res.status(403).json({
          success: false,
          message: "Você só pode excluir seus próprios comentários.",
        });
      }

      lista.splice(idx, 1);

      return res.status(200).json({
        success: true,
        message: "Comentário removido.",
        data: { id: comentarioId },
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = cartaoComentarioController;
