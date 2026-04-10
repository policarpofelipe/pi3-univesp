const { randomBytes } = require("crypto");

/** @type {Map<string, Array<object>>} */
const listasStore = new Map();

/** @type {Map<string, Array<object>>} */
const cartoesStore = new Map();

/** @type {Map<string, Array<object>>} chave `${quadroId}::${cartaoId}` */
const comentariosStore = new Map();

/** @type {Map<string, Array<object>>} checklists por cartão */
const checklistsStore = new Map();

/** @type {Map<string, Array<object>>} tags por quadro */
const tagsStore = new Map();

/** @type {Map<string, Array<object>>} anexos por cartão `${quadroId}::${cartaoId}` */
const anexosStore = new Map();

/** @type {Map<string, Array<object>>} histórico por cartão */
const historicoStore = new Map();

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

function makeTagId() {
  return `tag_${randomBytes(6).toString("hex")}`;
}

function makeAnexoId() {
  return `anx_${randomBytes(6).toString("hex")}`;
}

function makeHistoricoId() {
  return `his_${randomBytes(6).toString("hex")}`;
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

function getTags(quadroId) {
  if (!tagsStore.has(quadroId)) {
    tagsStore.set(quadroId, []);
  }
  return tagsStore.get(quadroId);
}

function findTag(quadroId, tagId) {
  return getTags(quadroId).find((t) => String(t.id) === String(tagId));
}

function removerTagDoQuadro(quadroId, tagId) {
  const arr = getTags(quadroId);
  const idx = arr.findIndex((t) => String(t.id) === String(tagId));
  if (idx >= 0) {
    arr.splice(idx, 1);
  }
  getCartoes(quadroId).forEach((c) => {
    if (!Array.isArray(c.tagIds)) return;
    c.tagIds = c.tagIds.filter((id) => String(id) !== String(tagId));
  });
}

/**
 * @returns {{ skip?: boolean, invalid?: boolean, unknown?: string, value?: string[] }}
 */
function normalizarTagIdsParaCartao(quadroId, val) {
  if (val === undefined) {
    return { skip: true };
  }
  if (!Array.isArray(val)) {
    return { invalid: true };
  }
  const validIds = new Set(getTags(quadroId).map((t) => String(t.id)));
  const raw = val.map((id) => String(id));
  for (let i = 0; i < raw.length; i += 1) {
    if (!validIds.has(raw[i])) {
      return { invalid: true, unknown: raw[i] };
    }
  }
  const seen = new Set();
  const out = [];
  raw.forEach((id) => {
    if (!seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  });
  return { value: out };
}

function getAnexos(quadroId, cartaoId) {
  const k = cartaoEscopoKey(quadroId, cartaoId);
  if (!anexosStore.has(k)) {
    anexosStore.set(k, []);
  }
  return anexosStore.get(k);
}

function findAnexo(quadroId, cartaoId, anexoId) {
  return getAnexos(quadroId, cartaoId).find(
    (a) => String(a.id) === String(anexoId)
  );
}

function removeAnexosDoCartao(quadroId, cartaoId) {
  anexosStore.delete(cartaoEscopoKey(quadroId, cartaoId));
}

function getHistorico(quadroId, cartaoId) {
  const k = cartaoEscopoKey(quadroId, cartaoId);
  if (!historicoStore.has(k)) {
    historicoStore.set(k, []);
  }
  return historicoStore.get(k);
}

function appendCartaoHistorico(req, quadroId, cartaoId, { tipo, descricao }) {
  const u = req.usuario || {};
  getHistorico(quadroId, cartaoId).push({
    id: makeHistoricoId(),
    tipo: String(tipo || "evento"),
    descricao: String(descricao || ""),
    criadoEm: new Date().toISOString(),
    autorId: u.id != null ? String(u.id) : "",
    autorNome:
      u.nomeExibicao || u.nome_exibicao || u.email || "Usuário",
  });
}

function listHistoricoOrdenado(quadroId, cartaoId) {
  const arr = getHistorico(quadroId, cartaoId);
  return [...arr].sort(
    (a, b) =>
      new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
  );
}

function removeHistoricoDoCartao(quadroId, cartaoId) {
  historicoStore.delete(cartaoEscopoKey(quadroId, cartaoId));
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
  makeTagId,
  getTags,
  findTag,
  removerTagDoQuadro,
  normalizarTagIdsParaCartao,
  makeAnexoId,
  getAnexos,
  findAnexo,
  removeAnexosDoCartao,
  makeHistoricoId,
  getHistorico,
  appendCartaoHistorico,
  listHistoricoOrdenado,
  removeHistoricoDoCartao,
};
