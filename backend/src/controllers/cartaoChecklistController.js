const store = require("../data/boardMemoryStore");

function garantirCartao(quadroId, cartaoId, res) {
  if (!store.findCartao(quadroId, cartaoId)) {
    res.status(404).json({
      success: false,
      message: "Cartão não encontrado.",
    });
    return false;
  }
  return true;
}

function renumerarChecklists(quadroId, cartaoId) {
  const arr = store.getChecklistsArray(quadroId, cartaoId);
  arr.sort((a, b) => (a.posicao ?? 0) - (b.posicao ?? 0));
  arr.forEach((cl, i) => {
    cl.posicao = i;
  });
}

const cartaoChecklistController = {
  async listar(req, res, next) {
    try {
      const { quadroId, cartaoId } = req.params;
      if (!garantirCartao(quadroId, cartaoId, res)) return;

      return res.status(200).json({
        success: true,
        data: store.listChecklistsOrdenadas(quadroId, cartaoId),
      });
    } catch (error) {
      return next(error);
    }
  },

  async criar(req, res, next) {
    try {
      const { quadroId, cartaoId } = req.params;
      const { titulo } = req.body;

      if (!garantirCartao(quadroId, cartaoId, res)) return;

      const arr = store.getChecklistsArray(quadroId, cartaoId);
      const maxPos = arr.reduce((m, c) => Math.max(m, c.posicao ?? 0), -1);
      const t = titulo != null && String(titulo).trim() ? String(titulo).trim() : "Checklist";

      const novo = {
        id: store.makeChecklistId(),
        quadroId: String(quadroId),
        cartaoId: String(cartaoId),
        titulo: t,
        posicao: maxPos + 1,
        itens: [],
      };
      arr.push(novo);

      return res.status(201).json({
        success: true,
        message: "Checklist criada.",
        data: { ...novo, itens: [] },
      });
    } catch (error) {
      return next(error);
    }
  },

  async atualizar(req, res, next) {
    try {
      const { quadroId, cartaoId, checklistId } = req.params;
      const { titulo } = req.body;

      if (!garantirCartao(quadroId, cartaoId, res)) return;

      const cl = store.findChecklist(quadroId, cartaoId, checklistId);
      if (!cl) {
        return res.status(404).json({
          success: false,
          message: "Checklist não encontrada.",
        });
      }

      if (titulo != null) {
        if (!String(titulo).trim()) {
          return res.status(400).json({
            success: false,
            message: "O título não pode ser vazio.",
          });
        }
        cl.titulo = String(titulo).trim();
      }

      return res.status(200).json({
        success: true,
        message: "Checklist atualizada.",
        data: {
          ...cl,
          itens: [...(cl.itens || [])].sort(
            (a, b) => (a.posicao ?? 0) - (b.posicao ?? 0)
          ),
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  async remover(req, res, next) {
    try {
      const { quadroId, cartaoId, checklistId } = req.params;

      if (!garantirCartao(quadroId, cartaoId, res)) return;

      const arr = store.getChecklistsArray(quadroId, cartaoId);
      const idx = arr.findIndex((c) => String(c.id) === String(checklistId));
      if (idx === -1) {
        return res.status(404).json({
          success: false,
          message: "Checklist não encontrada.",
        });
      }
      arr.splice(idx, 1);
      renumerarChecklists(quadroId, cartaoId);

      return res.status(200).json({
        success: true,
        message: "Checklist removida.",
        data: { id: checklistId },
      });
    } catch (error) {
      return next(error);
    }
  },

  async criarItem(req, res, next) {
    try {
      const { quadroId, cartaoId, checklistId } = req.params;
      const { titulo } = req.body;

      if (!garantirCartao(quadroId, cartaoId, res)) return;

      const cl = store.findChecklist(quadroId, cartaoId, checklistId);
      if (!cl) {
        return res.status(404).json({
          success: false,
          message: "Checklist não encontrada.",
        });
      }

      if (!titulo || !String(titulo).trim()) {
        return res.status(400).json({
          success: false,
          message: "O título do item é obrigatório.",
        });
      }

      if (!Array.isArray(cl.itens)) {
        cl.itens = [];
      }

      const maxPos = cl.itens.reduce((m, it) => Math.max(m, it.posicao ?? 0), -1);
      const item = {
        id: store.makeChecklistItemId(),
        titulo: String(titulo).trim(),
        concluido: false,
        posicao: maxPos + 1,
      };
      cl.itens.push(item);

      return res.status(201).json({
        success: true,
        message: "Item adicionado.",
        data: item,
      });
    } catch (error) {
      return next(error);
    }
  },

  async atualizarItem(req, res, next) {
    try {
      const { quadroId, cartaoId, checklistId, itemId } = req.params;
      const { titulo, concluido } = req.body;

      if (!garantirCartao(quadroId, cartaoId, res)) return;

      const cl = store.findChecklist(quadroId, cartaoId, checklistId);
      if (!cl || !Array.isArray(cl.itens)) {
        return res.status(404).json({
          success: false,
          message: "Checklist não encontrada.",
        });
      }

      const item = cl.itens.find((it) => String(it.id) === String(itemId));
      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Item não encontrado.",
        });
      }

      if (titulo != null) {
        if (!String(titulo).trim()) {
          return res.status(400).json({
            success: false,
            message: "O título não pode ser vazio.",
          });
        }
        item.titulo = String(titulo).trim();
      }

      if (concluido !== undefined) {
        item.concluido = Boolean(concluido);
      }

      return res.status(200).json({
        success: true,
        message: "Item atualizado.",
        data: item,
      });
    } catch (error) {
      return next(error);
    }
  },

  async removerItem(req, res, next) {
    try {
      const { quadroId, cartaoId, checklistId, itemId } = req.params;

      if (!garantirCartao(quadroId, cartaoId, res)) return;

      const cl = store.findChecklist(quadroId, cartaoId, checklistId);
      if (!cl || !Array.isArray(cl.itens)) {
        return res.status(404).json({
          success: false,
          message: "Checklist não encontrada.",
        });
      }

      const idx = cl.itens.findIndex((it) => String(it.id) === String(itemId));
      if (idx === -1) {
        return res.status(404).json({
          success: false,
          message: "Item não encontrado.",
        });
      }

      cl.itens.splice(idx, 1);
      store.renumerarPosicoesItens(cl.itens);

      return res.status(200).json({
        success: true,
        message: "Item removido.",
        data: { id: itemId },
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = cartaoChecklistController;
