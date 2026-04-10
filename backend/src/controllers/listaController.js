const { randomBytes } = require("crypto");

/** @type {Map<string, Array<object>>} */
const store = new Map();

function makeId() {
  return `lst_${randomBytes(6).toString("hex")}`;
}

function ensureSeed(quadroId) {
  if (!store.has(quadroId)) {
    store.set(quadroId, [
      {
        id: makeId(),
        quadroId,
        nome: "A fazer",
        descricao: "",
        posicao: 0,
        limiteWip: null,
        totalCartoes: 0,
      },
      {
        id: makeId(),
        quadroId,
        nome: "Em andamento",
        descricao: "",
        posicao: 1,
        limiteWip: 5,
        totalCartoes: 0,
      },
      {
        id: makeId(),
        quadroId,
        nome: "Concluído",
        descricao: "",
        posicao: 2,
        limiteWip: null,
        totalCartoes: 0,
      },
    ]);
  }
  return store.get(quadroId);
}

function sorted(quadroId) {
  return [...ensureSeed(quadroId)].sort((a, b) => a.posicao - b.posicao);
}

const listaController = {
  async listar(req, res, next) {
    try {
      const { quadroId } = req.params;
      return res.status(200).json({
        success: true,
        data: sorted(quadroId),
      });
    } catch (error) {
      return next(error);
    }
  },

  async obterPorId(req, res, next) {
    try {
      const { quadroId, listaId } = req.params;
      const list = ensureSeed(quadroId);
      const lista = list.find((l) => String(l.id) === String(listaId));

      if (!lista) {
        return res.status(404).json({
          success: false,
          message: "Lista não encontrada.",
        });
      }

      return res.status(200).json({
        success: true,
        data: lista,
      });
    } catch (error) {
      return next(error);
    }
  },

  async criar(req, res, next) {
    try {
      const { quadroId } = req.params;
      const { nome, descricao = "", limiteWip = null } = req.body;

      if (!nome || !String(nome).trim()) {
        return res.status(400).json({
          success: false,
          message: "O nome da lista é obrigatório.",
        });
      }

      const list = ensureSeed(quadroId);
      const maxPos = list.reduce((m, l) => Math.max(m, l.posicao ?? 0), -1);
      const wip =
        limiteWip === "" || limiteWip === undefined || limiteWip === null
          ? null
          : Number(limiteWip);

      const nova = {
        id: makeId(),
        quadroId,
        nome: String(nome).trim(),
        descricao: String(descricao || "").trim(),
        posicao: maxPos + 1,
        limiteWip: Number.isFinite(wip) && wip > 0 ? wip : null,
        totalCartoes: 0,
      };

      list.push(nova);

      return res.status(201).json({
        success: true,
        message: "Lista criada com sucesso.",
        data: nova,
      });
    } catch (error) {
      return next(error);
    }
  },

  async atualizar(req, res, next) {
    try {
      const { quadroId, listaId } = req.params;
      const { nome, descricao, limiteWip } = req.body;

      const list = ensureSeed(quadroId);
      const lista = list.find((l) => String(l.id) === String(listaId));

      if (!lista) {
        return res.status(404).json({
          success: false,
          message: "Lista não encontrada.",
        });
      }

      if (nome != null) {
        if (!String(nome).trim()) {
          return res.status(400).json({
            success: false,
            message: "O nome da lista não pode ser vazio.",
          });
        }
        lista.nome = String(nome).trim();
      }

      if (descricao !== undefined) {
        lista.descricao = String(descricao || "").trim();
      }

      if (limiteWip !== undefined) {
        const wip =
          limiteWip === "" || limiteWip === null
            ? null
            : Number(limiteWip);
        lista.limiteWip =
          Number.isFinite(wip) && wip > 0 ? wip : null;
      }

      return res.status(200).json({
        success: true,
        message: "Lista atualizada com sucesso.",
        data: lista,
      });
    } catch (error) {
      return next(error);
    }
  },

  async remover(req, res, next) {
    try {
      const { quadroId, listaId } = req.params;
      const list = ensureSeed(quadroId);
      const idx = list.findIndex((l) => String(l.id) === String(listaId));

      if (idx === -1) {
        return res.status(404).json({
          success: false,
          message: "Lista não encontrada.",
        });
      }

      list.splice(idx, 1);
      list
        .sort((a, b) => (a.posicao ?? 0) - (b.posicao ?? 0))
        .forEach((l, i) => {
          l.posicao = i;
        });

      return res.status(200).json({
        success: true,
        message: "Lista removida com sucesso.",
        data: { id: listaId, quadroId },
      });
    } catch (error) {
      return next(error);
    }
  },

  async reordenar(req, res, next) {
    try {
      const { quadroId } = req.params;
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Envie um array ids com a nova ordem das listas.",
        });
      }

      const list = ensureSeed(quadroId);
      const byId = new Map(list.map((l) => [String(l.id), l]));

      ids.forEach((rawId, index) => {
        const id = String(rawId);
        if (byId.has(id)) {
          byId.get(id).posicao = index;
        }
      });

      return res.status(200).json({
        success: true,
        message: "Ordem das listas atualizada.",
        data: sorted(quadroId),
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = listaController;
