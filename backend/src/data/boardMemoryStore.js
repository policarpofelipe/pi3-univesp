const { randomBytes } = require("crypto");

/** @type {Map<string, Array<object>>} */
const listasStore = new Map();

/** @type {Map<string, Array<object>>} */
const cartoesStore = new Map();

/** @type {Map<string, Array<object>>} chave `${quadroId}::${cartaoId}` */
const comentariosStore = new Map();

/** @type {Map<string, Array<object>>} checklists por cartão */
const checklistsStore = new Map();

function makeListaId() {
  return `lst_${randomBytes(6).toString("hex")}`;
}

function makeCartaoId() {
  return `crd_${randomBytes(6).toString("hex")}`;
}

function makeComentarioId() {
  return `cmt_${randomBytes(6).toString("hex")}`;
}

function makeChecklistId() {
  return `chk_${randomBytes(6).toString("hex")}`;
}

function makeChecklistItemId() {
  return `cki_${randomBytes(6).toString("hex")}`;
}

function cartaoEscopoKey(quadroId, cartaoId) {
  return `${quadroId}::${cartaoId}`;
}

function ensureListas(quadroId) {
  if (!listasStore.has(quadroId)) {
    listasStore.set(quadroId, [
      {
        id: makeListaId(),
        quadroId,
        nome: "A fazer",
        descricao: "",
        posicao: 0,
        limiteWip: null,
        totalCartoes: 0,
      },
      {
        id: makeListaId(),
        quadroId,
        nome: "Em andamento",
        descricao: "",
        posicao: 1,
        limiteWip: 5,
        totalCartoes: 0,
      },
      {
        id: makeListaId(),
        quadroId,
        nome: "Concluído",
        descricao: "",
        posicao: 2,
        limiteWip: null,
        totalCartoes: 0,
      },
    ]);
  }
  return listasStore.get(quadroId);
}

function getCartoes(quadroId) {
  if (!cartoesStore.has(quadroId)) {
    cartoesStore.set(quadroId, []);
  }
  return cartoesStore.get(quadroId);
}

function syncListaTotals(quadroId) {
  const listas = ensureListas(quadroId);
  const cartoes = getCartoes(quadroId);
  const counts = new Map();
  cartoes.forEach((c) => {
    const k = String(c.listaId);
    counts.set(k, (counts.get(k) || 0) + 1);
  });
  listas.forEach((l) => {
    l.totalCartoes = counts.get(String(l.id)) || 0;
  });
}

function sortedListas(quadroId) {
  syncListaTotals(quadroId);
  return [...ensureListas(quadroId)].sort(
    (a, b) => (a.posicao ?? 0) - (b.posicao ?? 0)
  );
}

function findLista(quadroId, listaId) {
  return ensureListas(quadroId).find(
    (l) => String(l.id) === String(listaId)
  );
}

function removeCartoesDaLista(quadroId, listaId) {
  const cartoes = getCartoes(quadroId);
  for (let i = cartoes.length - 1; i >= 0; i -= 1) {
    if (String(cartoes[i].listaId) === String(listaId)) {
      cartoes.splice(i, 1);
    }
  }
}

function cartoesNaListaOrdenados(quadroId, listaId) {
  return getCartoes(quadroId)
    .filter((c) => String(c.listaId) === String(listaId))
    .sort((a, b) => (a.posicao ?? 0) - (b.posicao ?? 0));
}

function renumerarPosicoesLista(quadroId, listaId) {
  const naLista = cartoesNaListaOrdenados(quadroId, listaId);
  naLista.forEach((c, i) => {
    c.posicao = i;
  });
}

function findCartao(quadroId, cartaoId) {
  return getCartoes(quadroId).find(
    (c) => String(c.id) === String(cartaoId)
  );
}

function getComentarios(quadroId, cartaoId) {
  const k = cartaoEscopoKey(quadroId, cartaoId);
  if (!comentariosStore.has(k)) {
    comentariosStore.set(k, []);
  }
  return comentariosStore.get(k);
}

function removeComentariosDoCartao(quadroId, cartaoId) {
  comentariosStore.delete(cartaoEscopoKey(quadroId, cartaoId));
}

function getChecklistsArray(quadroId, cartaoId) {
  const k = cartaoEscopoKey(quadroId, cartaoId);
  if (!checklistsStore.has(k)) {
    checklistsStore.set(k, []);
  }
  return checklistsStore.get(k);
}

function listChecklistsOrdenadas(quadroId, cartaoId) {
  const arr = getChecklistsArray(quadroId, cartaoId);
  const sorted = [...arr].sort((a, b) => (a.posicao ?? 0) - (b.posicao ?? 0));
  return sorted.map((cl) => ({
    ...cl,
    itens: [...(cl.itens || [])].sort(
      (i, j) => (i.posicao ?? 0) - (j.posicao ?? 0)
    ),
  }));
}

function findChecklist(quadroId, cartaoId, checklistId) {
  return getChecklistsArray(quadroId, cartaoId).find(
    (c) => String(c.id) === String(checklistId)
  );
}

function removeChecklistsDoCartao(quadroId, cartaoId) {
  checklistsStore.delete(cartaoEscopoKey(quadroId, cartaoId));
}

function renumerarPosicoesItens(itens) {
  const arr = itens || [];
  arr.sort((a, b) => (a.posicao ?? 0) - (b.posicao ?? 0));
  arr.forEach((it, idx) => {
    it.posicao = idx;
  });
}

module.exports = {
  makeListaId,
  makeCartaoId,
  makeComentarioId,
  makeChecklistId,
  makeChecklistItemId,
  ensureListas,
  sortedListas,
  findLista,
  findCartao,
  syncListaTotals,
  getCartoes,
  cartoesNaListaOrdenados,
  removeCartoesDaLista,
  renumerarPosicoesLista,
  getComentarios,
  removeComentariosDoCartao,
  getChecklistsArray,
  listChecklistsOrdenadas,
  findChecklist,
  removeChecklistsDoCartao,
  renumerarPosicoesItens,
};
