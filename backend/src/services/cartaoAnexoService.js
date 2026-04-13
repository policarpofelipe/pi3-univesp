const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const CartaoRepository = require("../repositories/CartaoRepository");
const CartaoAnexoRepository = require("../repositories/CartaoAnexoRepository");
const CartaoHistoricoService = require("./cartaoHistoricoService");

const MAX_BYTES = 5 * 1024 * 1024;
const UPLOAD_DIR = path.resolve(__dirname, "../../uploads/cartoes");

function toPositiveInt(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

function sanitizeFilename(name) {
  return String(name).replace(/[<>:"/\\|?*\x00-\x1F]/g, "_");
}

class CartaoAnexoService {
  async listar(quadroId, cartaoId) {
    const qId = toPositiveInt(quadroId);
    const cId = toPositiveInt(cartaoId);
    if (!qId || !cId) throw Object.assign(new Error("IDs inválidos."), { statusCode: 400 });
    const cartao = await CartaoRepository.obterPorId(qId, cId);
    if (!cartao) return null;
    return CartaoAnexoRepository.listar(cId);
  }

  async obterPorId(quadroId, cartaoId, anexoId) {
    const qId = toPositiveInt(quadroId);
    const cId = toPositiveInt(cartaoId);
    const aId = toPositiveInt(anexoId);
    if (!qId || !cId || !aId) throw Object.assign(new Error("IDs inválidos."), { statusCode: 400 });
    const cartao = await CartaoRepository.obterPorId(qId, cId);
    if (!cartao) return null;
    const anexo = await CartaoAnexoRepository.obterPorId(cId, aId);
    if (!anexo) return false;
    const fullPath = path.resolve(UPLOAD_DIR, anexo.caminhoArquivo);
    const buffer = await fs.readFile(fullPath);
    return { ...anexo, dadosBase64: buffer.toString("base64") };
  }

  async criar(quadroId, cartaoId, payload = {}, usuarioId = null) {
    const qId = toPositiveInt(quadroId);
    const cId = toPositiveInt(cartaoId);
    if (!qId || !cId) throw Object.assign(new Error("IDs inválidos."), { statusCode: 400 });
    const cartao = await CartaoRepository.obterPorId(qId, cId);
    if (!cartao) return null;

    const nomeArquivo = String(payload.nomeArquivo || "").trim();
    if (!nomeArquivo) throw Object.assign(new Error("nomeArquivo é obrigatório."), { statusCode: 400 });
    const b64 = String(payload.dadosBase64 || "").replace(/\s/g, "");
    if (!b64) throw Object.assign(new Error("dadosBase64 é obrigatório."), { statusCode: 400 });

    const buffer = Buffer.from(b64, "base64");
    if (!buffer.length) throw Object.assign(new Error("O arquivo está vazio."), { statusCode: 400 });
    if (buffer.length > MAX_BYTES) {
      throw Object.assign(new Error(`Arquivo excede o limite de ${MAX_BYTES / (1024 * 1024)} MB.`), {
        statusCode: 400,
      });
    }

    const safeName = sanitizeFilename(nomeArquivo);
    const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
    const relDir = path.join(String(cId));
    const relFile = path.join(relDir, `${Date.now()}_${safeName}`);
    const fullDir = path.resolve(UPLOAD_DIR, relDir);
    const fullPath = path.resolve(UPLOAD_DIR, relFile);
    await fs.mkdir(fullDir, { recursive: true });
    await fs.writeFile(fullPath, buffer);

    const id = await CartaoAnexoRepository.criar({
      cartaoId: cId,
      enviadoPorUsuarioId: usuarioId,
      nomeArquivo: safeName,
      tipoMime: payload.tipoMime || "application/octet-stream",
      tamanhoBytes: buffer.length,
      caminhoArquivo: relFile,
      sha256,
    });

    await CartaoHistoricoService.registrar({
      cartaoId: cId,
      usuarioId,
      tipoEvento: "ANEXO_ADICIONADO",
      dados: { anexoId: id, nomeArquivo: safeName },
    });

    return CartaoAnexoRepository.obterPorId(cId, id);
  }

  async remover(quadroId, cartaoId, anexoId, usuarioId = null) {
    const qId = toPositiveInt(quadroId);
    const cId = toPositiveInt(cartaoId);
    const aId = toPositiveInt(anexoId);
    if (!qId || !cId || !aId) throw Object.assign(new Error("IDs inválidos."), { statusCode: 400 });
    const cartao = await CartaoRepository.obterPorId(qId, cId);
    if (!cartao) return null;
    const anexo = await CartaoAnexoRepository.obterPorId(cId, aId);
    if (!anexo) return false;

    const removed = await CartaoAnexoRepository.remover(cId, aId);
    if (removed) {
      await CartaoHistoricoService.registrar({
        cartaoId: cId,
        usuarioId,
        tipoEvento: "ANEXO_REMOVIDO",
        dados: { anexoId: aId, nomeArquivo: anexo.nomeArquivo },
      });
    }
    return removed;
  }
}

module.exports = new CartaoAnexoService();

