const { randomBytes } = require("crypto");

/** @type {Map<string, Array<object>>} */
const listasStore = new Map();

/** @type {Map<string, Array<object>>} */
const cartoesStore = new Map();

function makeListaId() {
  return `lst_${randomBytes(6).toString("hex")}`;
}

function makeCartaoId() {
  return `crd_${randomBytes(6).toString("hex")}`;
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

module.exports = {
  makeListaId,
  makeCartaoId,
  ensureListas,
  sortedListas,
  findLista,
  syncListaTotals,
  getCartoes,
  cartoesNaListaOrdenados,
  removeCartoesDaLista,
  renumerarPosicoesLista,
};
