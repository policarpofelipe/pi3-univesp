const store = require("../data/boardMemoryStore");

const MAX_BYTES = 5 * 1024 * 1024;

function resumoAnexo(a) {
  return {
    id: a.id,
    nomeArquivo: a.nomeArquivo,
    tipoMime: a.tipoMime,
    tamanhoBytes: a.tamanhoBytes,
    criadoEm: a.criadoEm,
  };
}

const cartaoAnexoController = {
  async listar(req, res, next) {
    try {
      const { quadroId, cartaoId } = req.params;

      if (!store.findCartao(quadroId, cartaoId)) {
        return res.status(404).json({
          success: false,
          message: "Cartão não encontrado.",
        });
      }

      const lista = store.getAnexos(quadroId, cartaoId);
      const sorted = [...lista].sort(
        (a, b) =>
          new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime()
      );

      return res.status(200).json({
        success: true,
        data: sorted.map(resumoAnexo),
      });
    } catch (error) {
      return next(error);
    }
  },

  async obterPorId(req, res, next) {
    try {
      const { quadroId, cartaoId, anexoId } = req.params;

      if (!store.findCartao(quadroId, cartaoId)) {
        return res.status(404).json({
          success: false,
          message: "Cartão não encontrado.",
        });
      }

      const anexo = store.findAnexo(quadroId, cartaoId, anexoId);
      if (!anexo) {
        return res.status(404).json({
          success: false,
          message: "Anexo não encontrado.",
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          ...resumoAnexo(anexo),
          dadosBase64: anexo.dadosBase64,
        },
      });
    } catch (error) {
      return next(error);
    }
  },

  async criar(req, res, next) {
    try {
      const { quadroId, cartaoId } = req.params;
      const { nomeArquivo, tipoMime, dadosBase64 } = req.body;

      if (!store.findCartao(quadroId, cartaoId)) {
        return res.status(404).json({
          success: false,
          message: "Cartão não encontrado.",
        });
      }

      if (!nomeArquivo || !String(nomeArquivo).trim()) {
        return res.status(400).json({
          success: false,
          message: "nomeArquivo é obrigatório.",
        });
      }

      if (!dadosBase64 || typeof dadosBase64 !== "string") {
        return res.status(400).json({
          success: false,
          message: "dadosBase64 é obrigatório (string base64 pura, sem prefixo data:).",
        });
      }

      const b64 = String(dadosBase64).replace(/\s/g, "");
      let buffer;
      try {
        buffer = Buffer.from(b64, "base64");
      } catch {
        return res.status(400).json({
          success: false,
          message: "Base64 inválido.",
        });
      }

      if (!buffer.length) {
        return res.status(400).json({
          success: false,
          message: "O arquivo está vazio.",
        });
      }

      if (buffer.length > MAX_BYTES) {
        return res.status(400).json({
          success: false,
          message: `Arquivo excede o limite de ${MAX_BYTES / (1024 * 1024)} MB.`,
        });
      }

      const mime =
        tipoMime && String(tipoMime).trim()
          ? String(tipoMime).trim()
          : "application/octet-stream";

      const novo = {
        id: store.makeAnexoId(),
        quadroId: String(quadroId),
        cartaoId: String(cartaoId),
        nomeArquivo: String(nomeArquivo).trim(),
        tipoMime: mime,
        tamanhoBytes: buffer.length,
        dadosBase64: b64,
        criadoEm: new Date().toISOString(),
      };

      store.getAnexos(quadroId, cartaoId).push(novo);

      store.appendCartaoHistorico(req, quadroId, cartaoId, {
        tipo: "anexo_adicionado",
        descricao: `Anexou o arquivo "${novo.nomeArquivo}".`,
      });

      return res.status(201).json({
        success: true,
        message: "Anexo adicionado.",
        data: resumoAnexo(novo),
      });
    } catch (error) {
      return next(error);
    }
  },

  async remover(req, res, next) {
    try {
      const { quadroId, cartaoId, anexoId } = req.params;

      if (!store.findCartao(quadroId, cartaoId)) {
        return res.status(404).json({
          success: false,
          message: "Cartão não encontrado.",
        });
      }

      const lista = store.getAnexos(quadroId, cartaoId);
      const idx = lista.findIndex((a) => String(a.id) === String(anexoId));
      if (idx === -1) {
        return res.status(404).json({
          success: false,
          message: "Anexo não encontrado.",
        });
      }

      const nomeArquivo = lista[idx].nomeArquivo || "arquivo";
      lista.splice(idx, 1);

      store.appendCartaoHistorico(req, quadroId, cartaoId, {
        tipo: "anexo_removido",
        descricao: `Removeu o anexo "${nomeArquivo}".`,
      });

      return res.status(200).json({
        success: true,
        message: "Anexo removido.",
        data: { id: anexoId },
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = cartaoAnexoController;
