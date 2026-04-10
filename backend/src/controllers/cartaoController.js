const store = require("../data/boardMemoryStore");

const PRIORIDADES_CARTAO = new Set(["baixa", "media", "alta"]);

function normalizarPrioridade(val) {
  if (val === undefined) {
    return { skip: true };
  }
  if (val === null || val === "") {
    return { value: null };
  }
  const v = String(val).toLowerCase().trim();
  if (!PRIORIDADES_CARTAO.has(v)) {
    return { invalid: true };
  }
  return { value: v };
}

function normalizarPrazoEm(val) {
  if (val === undefined) {
    return { skip: true };
  }
  if (val === null || val === "") {
    return { value: null };
  }
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) {
    return { invalid: true };
  }
  return { value: d.toISOString() };
}

const cartaoController = {
  async listar(req, res, next) {
    try {
      const { quadroId } = req.params;
      const { listaId } = req.query;

      store.syncListaTotals(quadroId);
      let cartoes = store.getCartoes(quadroId);

      if (listaId) {
        cartoes = cartoes.filter(
          (c) => String(c.listaId) === String(listaId)
        );
      }

      const sorted = [...cartoes].sort((a, b) => {
        if (String(a.listaId) !== String(b.listaId)) {
          return String(a.listaId).localeCompare(String(b.listaId));
        }
        return (a.posicao ?? 0) - (b.posicao ?? 0);
      });

      return res.status(200).json({
        success: true,
        data: sorted,
      });
    } catch (error) {
      return next(error);
    }
  },

  async obterPorId(req, res, next) {
    try {
      const { quadroId, cartaoId } = req.params;
      const cartoes = store.getCartoes(quadroId);
      const cartao = cartoes.find((c) => String(c.id) === String(cartaoId));

      if (!cartao) {
        return res.status(404).json({
          success: false,
          message: "Cartão não encontrado.",
        });
      }

      return res.status(200).json({
        success: true,
        data: cartao,
      });
    } catch (error) {
      return next(error);
    }
  },

  async criar(req, res, next) {
    try {
      const { quadroId } = req.params;
      const {
        listaId,
        titulo,
        descricao = "",
        prazoEm,
        prioridade,
        tagIds,
      } = req.body;

      if (!listaId) {
        return res.status(400).json({
          success: false,
          message: "listaId é obrigatório.",
        });
      }

      if (!titulo || !String(titulo).trim()) {
        return res.status(400).json({
          success: false,
          message: "O título do cartão é obrigatório.",
        });
      }

      const lista = store.findLista(quadroId, listaId);
      if (!lista) {
        return res.status(404).json({
          success: false,
          message: "Lista não encontrada neste quadro.",
        });
      }

      const cartoes = store.getCartoes(quadroId);
      const naLista = store.cartoesNaListaOrdenados(quadroId, listaId);
      const maxPos = naLista.reduce((m, c) => Math.max(m, c.posicao ?? 0), -1);

      const novo = {
        id: store.makeCartaoId(),
        quadroId,
        listaId: String(listaId),
        titulo: String(titulo).trim(),
        descricao: String(descricao || "").trim(),
        posicao: maxPos + 1,
        criadoEm: new Date().toISOString(),
      };

      const prazo = normalizarPrazoEm(prazoEm);
      if (prazo.invalid) {
        return res.status(400).json({
          success: false,
          message: "Data de prazo inválida.",
        });
      }
      if (!prazo.skip && prazo.value != null) {
        novo.prazoEm = prazo.value;
      }

      const pri = normalizarPrioridade(prioridade);
      if (pri.invalid) {
        return res.status(400).json({
          success: false,
          message: "Prioridade inválida. Use: baixa, media ou alta.",
        });
      }
      if (!pri.skip && pri.value != null) {
        novo.prioridade = pri.value;
      }

      const tags = store.normalizarTagIdsParaCartao(quadroId, tagIds);
      if (tags.invalid) {
        return res.status(400).json({
          success: false,
          message: tags.unknown
            ? `Tag não encontrada neste quadro: ${tags.unknown}.`
            : "Lista de tags inválida.",
        });
      }
      if (!tags.skip) {
        novo.tagIds = tags.value;
      }

      cartoes.push(novo);
      store.syncListaTotals(quadroId);

      return res.status(201).json({
        success: true,
        message: "Cartão criado com sucesso.",
        data: novo,
      });
    } catch (error) {
      return next(error);
    }
  },

  async atualizar(req, res, next) {
    try {
      const { quadroId, cartaoId } = req.params;
      const { titulo, descricao, prazoEm, prioridade, tagIds } = req.body;

      const cartoes = store.getCartoes(quadroId);
      const cartao = cartoes.find((c) => String(c.id) === String(cartaoId));

      if (!cartao) {
        return res.status(404).json({
          success: false,
          message: "Cartão não encontrado.",
        });
      }

      if (titulo != null) {
        if (!String(titulo).trim()) {
          return res.status(400).json({
            success: false,
            message: "O título não pode ser vazio.",
          });
        }
        cartao.titulo = String(titulo).trim();
      }

      if (descricao !== undefined) {
        cartao.descricao = String(descricao || "").trim();
      }

      const prazo = normalizarPrazoEm(prazoEm);
      if (prazo.invalid) {
        return res.status(400).json({
          success: false,
          message: "Data de prazo inválida.",
        });
      }
      if (!prazo.skip) {
        if (prazo.value == null) {
          delete cartao.prazoEm;
        } else {
          cartao.prazoEm = prazo.value;
        }
      }

      const pri = normalizarPrioridade(prioridade);
      if (pri.invalid) {
        return res.status(400).json({
          success: false,
          message: "Prioridade inválida. Use: baixa, media ou alta.",
        });
      }
      if (!pri.skip) {
        if (pri.value == null) {
          delete cartao.prioridade;
        } else {
          cartao.prioridade = pri.value;
        }
      }

      const tags = store.normalizarTagIdsParaCartao(quadroId, tagIds);
      if (tags.invalid) {
        return res.status(400).json({
          success: false,
          message: tags.unknown
            ? `Tag não encontrada neste quadro: ${tags.unknown}.`
            : "Lista de tags inválida.",
        });
      }
      if (!tags.skip) {
        cartao.tagIds = tags.value;
      }

      return res.status(200).json({
        success: true,
        message: "Cartão atualizado com sucesso.",
        data: cartao,
      });
    } catch (error) {
      return next(error);
    }
  },

  async mover(req, res, next) {
    try {
      const { quadroId, cartaoId } = req.params;
      const { listaId, posicao } = req.body;

      if (!listaId) {
        return res.status(400).json({
          success: false,
          message: "listaId de destino é obrigatório.",
        });
      }

      if (!store.findLista(quadroId, listaId)) {
        return res.status(404).json({
          success: false,
          message: "Lista de destino não encontrada.",
        });
      }

      const cartoes = store.getCartoes(quadroId);
      const cartao = cartoes.find((c) => String(c.id) === String(cartaoId));

      if (!cartao) {
        return res.status(404).json({
          success: false,
          message: "Cartão não encontrado.",
        });
      }

      const origem = String(cartao.listaId);
      const dest = String(listaId);

      if (origem !== dest) {
        cartao.listaId = dest;
        const restantesOrigem = cartoes
          .filter((c) => String(c.listaId) === origem)
          .sort((a, b) => (a.posicao ?? 0) - (b.posicao ?? 0));
        restantesOrigem.forEach((c, i) => {
          c.posicao = i;
        });
      }

      let destCards = cartoes
        .filter((c) => String(c.listaId) === dest)
        .sort((a, b) => (a.posicao ?? 0) - (b.posicao ?? 0));

      const idx = destCards.findIndex((c) => String(c.id) === String(cartao.id));
      if (idx >= 0) {
        destCards.splice(idx, 1);
      }

      const insertAt =
        posicao === undefined || posicao === null
          ? destCards.length
          : Math.max(0, Math.min(Number(posicao), destCards.length));

      destCards.splice(insertAt, 0, cartao);
      destCards.forEach((c, i) => {
        c.posicao = i;
        c.listaId = dest;
      });

      store.syncListaTotals(quadroId);

      return res.status(200).json({
        success: true,
        message: "Cartão movido com sucesso.",
        data: cartao,
      });
    } catch (error) {
      return next(error);
    }
  },

  async remover(req, res, next) {
    try {
      const { quadroId, cartaoId } = req.params;
      const cartoes = store.getCartoes(quadroId);
      const idx = cartoes.findIndex((c) => String(c.id) === String(cartaoId));

      if (idx === -1) {
        return res.status(404).json({
          success: false,
          message: "Cartão não encontrado.",
        });
      }

      const listaId = cartoes[idx].listaId;
      cartoes.splice(idx, 1);
      store.removeComentariosDoCartao(quadroId, cartaoId);
      store.removeChecklistsDoCartao(quadroId, cartaoId);
      store.renumerarPosicoesLista(quadroId, listaId);
      store.syncListaTotals(quadroId);

      return res.status(200).json({
        success: true,
        message: "Cartão removido com sucesso.",
        data: { id: cartaoId, quadroId },
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = cartaoController;
