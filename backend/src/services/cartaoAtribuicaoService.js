const CartaoRepository = require("../repositories/CartaoRepository");
const QuadroMembroRepository = require("../repositories/QuadroMembroRepository");
const UsuarioRepository = require("../repositories/UsuarioRepository");
const CartaoAtribuicaoRepository = require("../repositories/CartaoAtribuicaoRepository");
const CartaoHistoricoService = require("./cartaoHistoricoService");

const PAPEIS_NO_CARTAO = new Set(["responsavel", "participante"]);

function toPositiveInt(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

class CartaoAtribuicaoService {
  async listar(quadroId, cartaoId) {
    const qId = toPositiveInt(quadroId);
    const cId = toPositiveInt(cartaoId);
    if (!qId || !cId) {
      throw Object.assign(new Error("IDs inválidos."), { statusCode: 400 });
    }

    const cartao = await CartaoRepository.obterPorId(qId, cId);
    if (!cartao) return null;

    return CartaoAtribuicaoRepository.listar(qId, cId);
  }

  async adicionar(quadroId, cartaoId, dados = {}, usuarioLogadoId = null) {
    const qId = toPositiveInt(quadroId);
    const cId = toPositiveInt(cartaoId);
    const usuarioId = toPositiveInt(dados.usuarioId || dados.membroId);
    const papelNoCartao = String(
      dados.papelNoCartao || "participante"
    ).toLowerCase();

    if (!qId || !cId || !usuarioId) {
      throw Object.assign(
        new Error("quadroId, cartaoId e usuarioId/membroId são obrigatórios."),
        { statusCode: 400 }
      );
    }

    if (!PAPEIS_NO_CARTAO.has(papelNoCartao)) {
      throw Object.assign(
        new Error("papelNoCartao inválido. Use: responsavel ou participante."),
        { statusCode: 400 }
      );
    }

    const cartao = await CartaoRepository.obterPorId(qId, cId);
    if (!cartao) return null;

    const usuario = await UsuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw Object.assign(new Error("Usuário não encontrado."), { statusCode: 404 });
    }

    const membro = await QuadroMembroRepository.obterPorUsuarioId(qId, usuarioId);
    if (!membro || membro.status !== "ativo") {
      throw Object.assign(
        new Error("Usuário não é membro ativo deste quadro."),
        { statusCode: 400 }
      );
    }

    try {
      await CartaoAtribuicaoRepository.criar({
        cartaoId: cId,
        usuarioId,
        papelNoCartao,
        atribuidoPorUsuarioId: usuarioLogadoId,
      });
    } catch (error) {
      if (error?.code === "ER_DUP_ENTRY") {
        throw Object.assign(new Error("Usuário já atribuído neste cartão."), {
          statusCode: 409,
        });
      }
      throw error;
    }

    await CartaoHistoricoService.registrar({
      cartaoId: cId,
      usuarioId: usuarioLogadoId || null,
      tipoEvento: "ATRIBUIDO",
      dados: { usuarioId, papelNoCartao },
    });

    return CartaoAtribuicaoRepository.listar(qId, cId);
  }

  async remover(quadroId, cartaoId, usuarioId, usuarioLogadoId = null) {
    const qId = toPositiveInt(quadroId);
    const cId = toPositiveInt(cartaoId);
    const uId = toPositiveInt(usuarioId);
    if (!qId || !cId || !uId) {
      throw Object.assign(new Error("IDs inválidos."), { statusCode: 400 });
    }

    const cartao = await CartaoRepository.obterPorId(qId, cId);
    if (!cartao) return null;

    const removed = await CartaoAtribuicaoRepository.removerPorUsuario(cId, uId);
    if (removed) {
      await CartaoHistoricoService.registrar({
        cartaoId: cId,
        usuarioId: usuarioLogadoId || null,
        tipoEvento: "DESATRIBUIDO",
        dados: { usuarioId: uId },
      });
    }
    return removed;
  }
}

module.exports = new CartaoAtribuicaoService();
