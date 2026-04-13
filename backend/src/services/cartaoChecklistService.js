const CartaoRepository = require("../repositories/CartaoRepository");
const CartaoChecklistRepository = require("../repositories/CartaoChecklistRepository");

function toPositiveInt(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

class CartaoChecklistService {
  async listar(quadroId, cartaoId) {
    const qId = toPositiveInt(quadroId);
    const cId = toPositiveInt(cartaoId);
    if (!qId || !cId) throw Object.assign(new Error("IDs inválidos."), { statusCode: 400 });

    const cartao = await CartaoRepository.obterPorId(qId, cId);
    if (!cartao) return null;

    const checklists = await CartaoChecklistRepository.listarChecklists(cId);
    const itens = await CartaoChecklistRepository.listarItens(checklists.map((c) => c.id));
    const itensByChecklist = itens.reduce((acc, item) => {
      if (!acc[item.checklistId]) acc[item.checklistId] = [];
      acc[item.checklistId].push({
        id: item.id,
        titulo: item.titulo,
        concluido: Boolean(item.concluido),
        posicao: item.posicao,
      });
      return acc;
    }, {});
    return checklists.map((c) => ({
      id: c.id,
      quadroId: qId,
      cartaoId: cId,
      titulo: c.titulo,
      posicao: c.posicao,
      itens: itensByChecklist[c.id] || [],
    }));
  }

  async criarChecklist(quadroId, cartaoId, titulo, usuarioId) {
    const qId = toPositiveInt(quadroId);
    const cId = toPositiveInt(cartaoId);
    if (!qId || !cId) throw Object.assign(new Error("IDs inválidos."), { statusCode: 400 });
    const cartao = await CartaoRepository.obterPorId(qId, cId);
    if (!cartao) return null;
    const txt = titulo && String(titulo).trim() ? String(titulo).trim() : "Checklist";
    const id = await CartaoChecklistRepository.criarChecklist({
      cartaoId: cId,
      titulo: txt,
      usuarioId: usuarioId || null,
    });
    const lista = await this.listar(qId, cId);
    return lista.find((c) => c.id === id) || null;
  }

  async atualizarChecklist(quadroId, cartaoId, checklistId, titulo) {
    const checklist = await CartaoChecklistRepository.obterChecklist(
      Number(cartaoId),
      Number(checklistId)
    );
    if (!checklist) return null;
    const txt = String(titulo || "").trim();
    if (!txt) throw Object.assign(new Error("O título não pode ser vazio."), { statusCode: 400 });
    await CartaoChecklistRepository.atualizarChecklist(Number(checklistId), txt);
    const lista = await this.listar(quadroId, cartaoId);
    return lista.find((c) => c.id === Number(checklistId)) || null;
  }

  async removerChecklist(quadroId, cartaoId, checklistId) {
    const checklist = await CartaoChecklistRepository.obterChecklist(
      Number(cartaoId),
      Number(checklistId)
    );
    if (!checklist) return false;
    return CartaoChecklistRepository.removerChecklist(Number(checklistId));
  }

  async criarItem(quadroId, cartaoId, checklistId, titulo) {
    const checklist = await CartaoChecklistRepository.obterChecklist(
      Number(cartaoId),
      Number(checklistId)
    );
    if (!checklist) return null;
    const txt = String(titulo || "").trim();
    if (!txt) throw Object.assign(new Error("O título do item é obrigatório."), { statusCode: 400 });
    const id = await CartaoChecklistRepository.criarItem(Number(checklistId), txt);
    return CartaoChecklistRepository.obterItem(Number(checklistId), id);
  }

  async atualizarItem(quadroId, cartaoId, checklistId, itemId, payload, usuarioId) {
    const item = await CartaoChecklistRepository.obterItem(Number(checklistId), Number(itemId));
    if (!item) return null;
    const dados = {};
    if (payload.titulo !== undefined) {
      const txt = String(payload.titulo).trim();
      if (!txt) throw Object.assign(new Error("O título não pode ser vazio."), { statusCode: 400 });
      dados.titulo = txt;
    }
    if (payload.concluido !== undefined) {
      dados.concluido = Boolean(payload.concluido);
      dados.usuarioId = usuarioId || null;
    }
    await CartaoChecklistRepository.atualizarItem(Number(itemId), dados);
    const updated = await CartaoChecklistRepository.obterItem(Number(checklistId), Number(itemId));
    return {
      id: updated.id,
      titulo: updated.titulo,
      concluido: Boolean(updated.concluido),
      posicao: updated.posicao,
    };
  }

  async removerItem(quadroId, cartaoId, checklistId, itemId) {
    const item = await CartaoChecklistRepository.obterItem(Number(checklistId), Number(itemId));
    if (!item) return false;
    return CartaoChecklistRepository.removerItem(Number(itemId));
  }
}

module.exports = new CartaoChecklistService();

