const automacaoService = require("./automacaoService");
const AutomacaoAcaoRepository = require("../repositories/AutomacaoAcaoRepository");
const AutomacaoExecucaoRepository = require("../repositories/AutomacaoExecucaoRepository");
const CartaoRepository = require("../repositories/CartaoRepository");
const CartaoHistoricoService = require("./cartaoHistoricoService");

function contextoPermiteAutomacao(automacao, gatilho, ctx = {}) {
  const g = String(gatilho).toUpperCase();

  if (g === "AO_CRIAR_CARTAO") {
    if (automacao.listaOrigemId != null && ctx.listaId != null) {
      return Number(automacao.listaOrigemId) === Number(ctx.listaId);
    }
    // Compatibilidade: em automações antigas sem listaOrigemId, considera listaDestinoId.
    if (automacao.listaDestinoId != null && ctx.listaId != null) {
      return Number(automacao.listaDestinoId) === Number(ctx.listaId);
    }
    return true;
  }

  if (g === "AO_ENTRAR_NA_LISTA") {
    if (automacao.listaDestinoId != null && ctx.listaDestinoId != null) {
      return Number(automacao.listaDestinoId) === Number(ctx.listaDestinoId);
    }
    return true;
  }

  if (g === "AO_SAIR_DA_LISTA") {
    if (automacao.listaOrigemId != null && ctx.listaOrigemId != null) {
      return Number(automacao.listaOrigemId) === Number(ctx.listaOrigemId);
    }
    return true;
  }

  if (g === "AO_ATUALIZAR_CAMPO") {
    if (automacao.campoId != null && ctx.campoId != null) {
      return Number(automacao.campoId) === Number(ctx.campoId);
    }
    return true;
  }

  return true;
}

class AutomacaoExecutorService {
  async executarMoverCartao({ quadroId, cartaoId, configJson = {} }) {
    const listaDestinoId = Number(configJson.listaDestinoId);
    if (!Number.isInteger(listaDestinoId) || listaDestinoId <= 0) {
      throw new Error("Configuração inválida para MOVER_CARTAO.");
    }
    const atual = await CartaoRepository.obterPorId(quadroId, cartaoId);
    if (!atual) throw new Error("Cartão não encontrado.");
    if (Number(atual.listaId) === listaDestinoId) {
      return { ignored: true, reason: "already_in_destination" };
    }
    await CartaoRepository.mover(quadroId, cartaoId, listaDestinoId, null);
    return { movedToListaId: listaDestinoId };
  }

  async executarAdicionarTag({ quadroId, cartaoId, configJson = {} }) {
    const tagId = Number(configJson.tagId);
    if (!Number.isInteger(tagId) || tagId <= 0) {
      throw new Error("Configuração inválida para ADICIONAR_TAG.");
    }
    const cartao = await CartaoRepository.obterPorId(quadroId, cartaoId);
    if (!cartao) throw new Error("Cartão não encontrado.");
    const novosTagIds = new Set([...(cartao.tagIds || []).map(Number), tagId]);
    await CartaoRepository.atualizar(quadroId, cartaoId, { tagIds: [...novosTagIds] });
    return { tagId };
  }

  async executarAcao({ automacao, acao, quadroId, cartaoId, usuarioId }) {
    const tipo = String(acao.tipoAcao || "").toUpperCase();
    if (tipo === "MOVER_CARTAO") {
      return this.executarMoverCartao({ quadroId, cartaoId, configJson: acao.configJson });
    }
    if (tipo === "ADICIONAR_TAG") {
      return this.executarAdicionarTag({ quadroId, cartaoId, configJson: acao.configJson });
    }
    return { ignored: true, reason: "unsupported_action" };
  }

  async executarPorGatilho({ quadroId, gatilho, contexto = {} }) {
    const automacoes = await automacaoService.listar(quadroId);
    if (!automacoes) return null;

    const g = String(gatilho).toUpperCase();
    const candidatas = automacoes.filter(
      (item) =>
        item.ativo &&
        String(item.gatilho).toUpperCase() === g &&
        contextoPermiteAutomacao(item, g, contexto)
    );

    let executadas = 0;
    const cartaoId = Number(contexto.cartaoId);
    const usuarioId = contexto.usuarioId || null;
    const resultados = [];

    for (const automacao of candidatas) {
      const acoes = await AutomacaoAcaoRepository.listarPorAutomacao(automacao.id);
      for (const acao of acoes) {
        if (!Number.isInteger(cartaoId) || cartaoId <= 0) {
          continue;
        }
        if (automacao.executaUmaVezPorCartao) {
          const jaExecutada = await AutomacaoExecucaoRepository.obter(
            automacao.id,
            acao.id,
            cartaoId
          );
          if (jaExecutada) {
            continue;
          }
        }
        try {
          const resultado = await this.executarAcao({
            automacao,
            acao,
            quadroId,
            cartaoId,
            usuarioId,
          });
          await AutomacaoExecucaoRepository.registrar({
            automacaoId: automacao.id,
            acaoId: acao.id,
            cartaoId,
            statusExecucao: "sucesso",
            resultadoJson: JSON.stringify(resultado || {}),
          });
          await CartaoHistoricoService.registrar({
            cartaoId,
            usuarioId,
            tipoEvento: "AUTOMACAO_EXECUTADA",
            dados: {
              automacaoId: automacao.id,
              acaoId: acao.id,
              tipoAcao: acao.tipoAcao,
              gatilho: automacao.gatilho,
              resultado,
            },
          });
          executadas += 1;
          resultados.push({
            automacaoId: automacao.id,
            acaoId: acao.id,
            status: "sucesso",
            resultado,
          });
        } catch (error) {
          await AutomacaoExecucaoRepository.registrar({
            automacaoId: automacao.id,
            acaoId: acao.id,
            cartaoId,
            statusExecucao: "erro",
            resultadoJson: JSON.stringify({ message: error.message || "Falha na execução da ação." }),
          });
          resultados.push({
            automacaoId: automacao.id,
            acaoId: acao.id,
            status: "erro",
            message: error.message || "Falha na execução da ação.",
          });
        }
      }
    }

    return {
      executadas,
      candidatas: candidatas.length,
      contexto,
      automacoes: candidatas,
      resultados,
    };
  }
}

module.exports = new AutomacaoExecutorService();
