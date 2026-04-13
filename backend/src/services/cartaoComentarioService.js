const CartaoRepository = require("../repositories/CartaoRepository");
const CartaoComentarioRepository = require("../repositories/CartaoComentarioRepository");
const CartaoHistoricoService = require("./cartaoHistoricoService");

function toPositiveInt(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

class CartaoComentarioService {
  async listar(quadroId, cartaoId) {
    const qId = toPositiveInt(quadroId);
    const cId = toPositiveInt(cartaoId);
    if (!qId || !cId) {
      const error = new Error("IDs informados são inválidos.");
      error.statusCode = 400;
      throw error;
    }

    const cartao = await CartaoRepository.obterPorId(qId, cId);
    if (!cartao) return null;
    return CartaoComentarioRepository.listar(cId);
  }

  async criar(quadroId, cartaoId, texto, usuario) {
    const qId = toPositiveInt(quadroId);
    const cId = toPositiveInt(cartaoId);
    if (!qId || !cId) {
      const error = new Error("IDs informados são inválidos.");
      error.statusCode = 400;
      throw error;
    }
    if (!texto || !String(texto).trim()) {
      const error = new Error("O texto do comentário é obrigatório.");
      error.statusCode = 400;
      throw error;
    }
    const cartao = await CartaoRepository.obterPorId(qId, cId);
    if (!cartao) return null;

    const comentarioId = await CartaoComentarioRepository.criar({
      cartaoId: cId,
      usuarioId: usuario?.id || null,
      texto: String(texto).trim(),
    });

    await CartaoHistoricoService.registrar({
      cartaoId: cId,
      usuarioId: usuario?.id || null,
      tipoEvento: "COMENTARIO_ADICIONADO",
      dados: { comentarioId, texto: String(texto).trim() },
    });

    return CartaoComentarioRepository.obterPorId(cId, comentarioId);
  }

  async remover(quadroId, cartaoId, comentarioId, usuario) {
    const qId = toPositiveInt(quadroId);
    const cId = toPositiveInt(cartaoId);
    const comId = toPositiveInt(comentarioId);
    if (!qId || !cId || !comId) {
      const error = new Error("IDs informados são inválidos.");
      error.statusCode = 400;
      throw error;
    }

    const cartao = await CartaoRepository.obterPorId(qId, cId);
    if (!cartao) return null;

    const comentario = await CartaoComentarioRepository.obterPorId(cId, comId);
    if (!comentario) return false;

    if (comentario.autorId && Number(comentario.autorId) !== Number(usuario?.id)) {
      const error = new Error("Você só pode excluir seus próprios comentários.");
      error.statusCode = 403;
      throw error;
    }

    const removed = await CartaoComentarioRepository.remover(cId, comId);
    if (removed) {
      await CartaoHistoricoService.registrar({
        cartaoId: cId,
        usuarioId: usuario?.id || null,
        tipoEvento: "COMENTARIO_REMOVIDO",
        dados: { comentarioId: comId, texto: comentario.texto },
      });
    }
    return removed;
  }
}

module.exports = new CartaoComentarioService();

