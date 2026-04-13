const CartaoRepository = require("../repositories/CartaoRepository");
const CartaoRelacaoRepository = require("../repositories/CartaoRelacaoRepository");
const CartaoHistoricoService = require("./cartaoHistoricoService");

const TIPOS_RELACAO = new Set([
  "ORIGINOU",
  "DEPENDE_DE",
  "BLOQUEIA",
  "DUPLICADO_DE",
  "RELACIONADO_A",
]);

function toPositiveInt(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

class CartaoRelacaoService {
  async listar(quadroId, cartaoId) {
    const qId = toPositiveInt(quadroId);
    const cId = toPositiveInt(cartaoId);
    if (!qId || !cId) {
      throw Object.assign(new Error("IDs inválidos."), { statusCode: 400 });
    }

    const cartao = await CartaoRepository.obterPorId(qId, cId);
    if (!cartao) return null;

    return CartaoRelacaoRepository.listar(qId, cId);
  }

  async criar(quadroId, cartaoId, dados = {}, usuarioLogadoId = null) {
    const qId = toPositiveInt(quadroId);
    const cId = toPositiveInt(cartaoId);
    const cartaoDestinoId = toPositiveInt(
      dados.cartaoDestinoId || dados.cartaoRelacionadoId
    );
    const tipoRelacao = String(dados.tipoRelacao || "RELACIONADO_A")
      .trim()
      .toUpperCase();

    if (!qId || !cId || !cartaoDestinoId) {
      throw Object.assign(
        new Error("quadroId, cartaoId e cartaoDestinoId são obrigatórios."),
        { statusCode: 400 }
      );
    }
    if (!TIPOS_RELACAO.has(tipoRelacao)) {
      throw Object.assign(new Error("tipoRelacao inválido."), { statusCode: 400 });
    }
    if (cId === cartaoDestinoId) {
      throw Object.assign(
        new Error("Um cartão não pode se relacionar com ele mesmo."),
        { statusCode: 400 }
      );
    }

    const origem = await CartaoRepository.obterPorId(qId, cId);
    const destino = await CartaoRepository.obterPorId(qId, cartaoDestinoId);
    if (!origem || !destino) {
      throw Object.assign(
        new Error("Cartão de origem/destino não encontrado no quadro."),
        { statusCode: 404 }
      );
    }

    let relacaoId;
    try {
      relacaoId = await CartaoRelacaoRepository.criar({
        cartaoOrigemId: cId,
        cartaoDestinoId,
        tipoRelacao,
        criadoPorUsuarioId: usuarioLogadoId,
      });
    } catch (error) {
      if (error?.code === "ER_DUP_ENTRY") {
        throw Object.assign(new Error("Relação já cadastrada."), {
          statusCode: 409,
        });
      }
      throw error;
    }

    await CartaoHistoricoService.registrar({
      cartaoId: cId,
      usuarioId: usuarioLogadoId || null,
      tipoEvento: "RELACAO_CRIADA",
      dados: { relacaoId, cartaoDestinoId, tipoRelacao },
    });

    return CartaoRelacaoRepository.listar(qId, cId);
  }

  async remover(quadroId, cartaoId, relacaoId) {
    const qId = toPositiveInt(quadroId);
    const cId = toPositiveInt(cartaoId);
    const rId = toPositiveInt(relacaoId);
    if (!qId || !cId || !rId) {
      throw Object.assign(new Error("IDs inválidos."), { statusCode: 400 });
    }

    const origem = await CartaoRepository.obterPorId(qId, cId);
    if (!origem) return null;

    return CartaoRelacaoRepository.remover(rId, cId);
  }
}

module.exports = new CartaoRelacaoService();
