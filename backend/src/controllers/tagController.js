const store = require("../data/boardMemoryStore");

const HEX_COR = /^#[0-9A-Fa-f]{6}$/;
const COR_PADRAO = "#64748b";

function normalizarCor(cor) {
  if (cor == null || cor === "") {
    return COR_PADRAO;
  }
  const c = String(cor).trim();
  return HEX_COR.test(c) ? c : null;
}

const tagController = {
  async listar(req, res, next) {
    try {
      const { quadroId } = req.params;
      const tags = [...store.getTags(quadroId)].sort((a, b) =>
        String(a.nome || "").localeCompare(String(b.nome || ""), "pt")
      );
      return res.status(200).json({ success: true, data: tags });
    } catch (error) {
      return next(error);
    }
  },

  async criar(req, res, next) {
    try {
      const { quadroId } = req.params;
      const { nome, cor } = req.body;

      if (!nome || !String(nome).trim()) {
        return res.status(400).json({
          success: false,
          message: "O nome da tag é obrigatório.",
        });
      }

      const corOk = normalizarCor(cor);
      if (corOk === null) {
        return res.status(400).json({
          success: false,
          message: "Cor inválida. Use formato hexadecimal #RRGGBB.",
        });
      }

      const novo = {
        id: store.makeTagId(),
        quadroId: String(quadroId),
        nome: String(nome).trim(),
        cor: corOk,
        criadoEm: new Date().toISOString(),
      };

      store.getTags(quadroId).push(novo);

      return res.status(201).json({
        success: true,
        message: "Tag criada.",
        data: novo,
      });
    } catch (error) {
      return next(error);
    }
  },

  async remover(req, res, next) {
    try {
      const { quadroId, tagId } = req.params;

      if (!store.findTag(quadroId, tagId)) {
        return res.status(404).json({
          success: false,
          message: "Tag não encontrada.",
        });
      }

      store.removerTagDoQuadro(quadroId, tagId);

      return res.status(200).json({
        success: true,
        message: "Tag removida.",
        data: { id: tagId },
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = tagController;
