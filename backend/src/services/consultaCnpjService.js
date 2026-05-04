const {
  limparCnpj,
  validarCnpjBasico,
  formatarCnpj,
  limparCep,
} = require("../utils/documentos");

const DEFAULT_BRASILAPI =
  process.env.BRASILAPI_BASE_URL || "https://brasilapi.com.br/api";
const DEFAULT_RECEITAWS =
  process.env.RECEITAWS_BASE_URL || "https://www.receitaws.com.br/v1/cnpj";
const DEFAULT_SPEEDIO_BASE =
  process.env.SPEEDIO_BASE_URL || "https://api-get-leads.speedio.com.br";

const FETCH_TIMEOUT_MS = 18000;

function logTecnico(msg, err) {
  if (process.env.NODE_ENV === "test") return;
  // eslint-disable-next-line no-console
  console.error(`[consultaCnpj] ${msg}`, err?.message || err || "");
}

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(options.headers || {}),
      },
    });
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }
    return { ok: res.ok, status: res.status, data, raw: text };
  } finally {
    clearTimeout(t);
  }
}

function montarEnderecoPadrao(p) {
  return {
    logradouro: p.logradouro || "",
    numero: p.numero || "",
    complemento: p.complemento || "",
    bairro: p.bairro || "",
    municipio: p.municipio || "",
    uf: p.uf || "",
    cep: p.cep ? limparCep(p.cep) : "",
  };
}

function normalizarRespostaCnpj(payload) {
  return {
    cnpj: payload.cnpj,
    cnpjFormatado: payload.cnpjFormatado || formatarCnpj(payload.cnpj),
    razaoSocial: payload.razaoSocial || "",
    nomeFantasia: payload.nomeFantasia || "",
    situacao: payload.situacao || "",
    dataAbertura: payload.dataAbertura || "",
    naturezaJuridica: payload.naturezaJuridica || "",
    porte: payload.porte || "",
    cnaePrincipal: payload.cnaePrincipal || "",
    atividadesSecundarias: Array.isArray(payload.atividadesSecundarias)
      ? payload.atividadesSecundarias
      : [],
    endereco: montarEnderecoPadrao(payload.endereco || {}),
    telefone: payload.telefone || "",
    email: payload.email || "",
  };
}

function mapBrasilApi(j) {
  if (!j || typeof j !== "object") return null;
  if (j.message && j.type) return null;
  const cnpj = limparCnpj(j.cnpj);
  if (!validarCnpjBasico(cnpj)) return null;
  const sec = Array.isArray(j.cnaes_secundarios)
    ? j.cnaes_secundarios.map((x) =>
        typeof x === "object" && x
          ? `${x.codigo || ""} — ${x.descricao || ""}`.trim()
          : String(x)
      )
    : [];
  return normalizarRespostaCnpj({
    cnpj,
    cnpjFormatado: formatarCnpj(cnpj),
    razaoSocial: j.razao_social || "",
    nomeFantasia: j.nome_fantasia || "",
    situacao: j.descricao_situacao_cadastral || "",
    dataAbertura: j.data_inicio_atividade || "",
    naturezaJuridica: j.natureza_juridica || "",
    porte: j.porte || "",
    cnaePrincipal: j.cnae_fiscal_descricao || "",
    atividadesSecundarias: sec,
    endereco: {
      logradouro: j.logradouro || "",
      numero: j.numero || "",
      complemento: j.complemento || "",
      bairro: j.bairro || "",
      municipio: j.municipio || "",
      uf: j.uf || "",
      cep: j.cep || "",
    },
    telefone: [j.ddd_telefone_1, j.ddd_telefone_2].filter(Boolean).join(" / "),
    email: j.email || "",
  });
}

function mapReceitaWs(j) {
  if (!j || typeof j !== "object") return null;
  if (j.status === "ERROR" || j.erro) return null;
  const cnpj = limparCnpj(j.cnpj);
  if (!validarCnpjBasico(cnpj)) return null;
  const principal = Array.isArray(j.atividade_principal)
    ? j.atividade_principal[0]
    : null;
  const sec = Array.isArray(j.atividades_secundarias)
    ? j.atividades_secundarias.map((x) => (typeof x === "object" ? x.text || "" : String(x)))
    : [];
  return normalizarRespostaCnpj({
    cnpj,
    cnpjFormatado: formatarCnpj(cnpj),
    razaoSocial: j.nome || "",
    nomeFantasia: j.fantasia || "",
    situacao: j.situacao || "",
    dataAbertura: j.abertura || "",
    naturezaJuridica: j.natureza_juridica || "",
    porte: j.porte || "",
    cnaePrincipal: principal?.text || principal?.code || "",
    atividadesSecundarias: sec.filter(Boolean),
    endereco: {
      logradouro: j.logradouro || "",
      numero: j.numero || "",
      complemento: j.complemento || "",
      bairro: j.bairro || "",
      municipio: j.municipio || "",
      uf: j.uf || "",
      cep: j.cep || "",
    },
    telefone: j.telefone || "",
    email: j.email || "",
  });
}

function mapSpeedioGenerico(j, cnpjLimpo) {
  if (!j || typeof j !== "object") return null;
  const item =
    (Array.isArray(j.data) && j.data[0]) ||
    (Array.isArray(j.leads) && j.leads[0]) ||
    (Array.isArray(j.result) && j.result[0]) ||
    j.company ||
    j;
  if (!item || typeof item !== "object") return null;
  const cnpj =
    limparCnpj(item.cnpj || item.document || cnpjLimpo) || cnpjLimpo;
  if (!validarCnpjBasico(cnpj)) return null;
  const end = item.endereco || item.address || {};
  return normalizarRespostaCnpj({
    cnpj,
    cnpjFormatado: formatarCnpj(cnpj),
    razaoSocial: item.razao_social || item.name || item.razaoSocial || "",
    nomeFantasia: item.nome_fantasia || item.fantasia || "",
    situacao: item.situacao || item.situacao_cadastral || "",
    dataAbertura: item.data_abertura || item.abertura || "",
    naturezaJuridica: item.natureza_juridica || "",
    porte: item.porte || "",
    cnaePrincipal: item.cnae || item.atividade_principal || "",
    atividadesSecundarias: [],
    endereco: {
      logradouro: end.logradouro || end.street || "",
      numero: end.numero || end.number || "",
      complemento: end.complemento || "",
      bairro: end.bairro || end.neighborhood || "",
      municipio: end.municipio || end.city || "",
      uf: end.uf || end.state || "",
      cep: end.cep || end.zip || "",
    },
    telefone: item.telefone || item.phone || "",
    email: item.email || "",
  });
}

async function consultarBrasilApi(cnpjLimpo) {
  const base = DEFAULT_BRASILAPI.replace(/\/$/, "");
  const url = `${base}/cnpj/v1/${cnpjLimpo}`;
  const { ok, status, data } = await fetchJson(url);
  if (status === 404) return { erro: "nao_encontrado" };
  if (!ok || !data) return { erro: "falha" };
  const mapped = mapBrasilApi(data);
  if (!mapped) return { erro: "invalido" };
  return { data: mapped };
}

async function consultarReceitaWs(cnpjLimpo) {
  const base = DEFAULT_RECEITAWS.replace(/\/$/, "");
  const url = `${base}/${cnpjLimpo}`;
  const { ok, data } = await fetchJson(url);
  if (!ok || !data) return { erro: "falha" };
  const mapped = mapReceitaWs(data);
  if (!mapped) return { erro: "nao_encontrado" };
  return { data: mapped };
}

async function consultarSpeedio(cnpjLimpo) {
  const user = process.env.SPEEDIO_API_USER || "";
  const pass = process.env.SPEEDIO_API_PASSWORD || "";
  if (!user || !pass) return { erro: "skip" };
  const base = DEFAULT_SPEEDIO_BASE.replace(/\/$/, "");
  const url = `${base}/search_enriched_leads/cnpj?cnpjs=${encodeURIComponent(
    JSON.stringify([cnpjLimpo])
  )}`;
  const auth = Buffer.from(`${user}:${pass}`, "utf8").toString("base64");
  const { ok, status, data } = await fetchJson(url, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (status === 401 || status === 403) {
    logTecnico("Speedio credenciais ou acesso", { status });
    return { erro: "falha" };
  }
  if (!ok || !data) return { erro: "falha" };
  const mapped = mapSpeedioGenerico(data, cnpjLimpo);
  if (!mapped) return { erro: "nao_encontrado" };
  return { data: mapped };
}

async function consultarCnpj(cnpjBruto) {
  const cnpj = limparCnpj(cnpjBruto);
  if (!validarCnpjBasico(cnpj)) {
    const err = new Error("Informe um CNPJ com 14 dígitos.");
    err.code = "CNPJ_INVALIDO";
    err.statusCode = 400;
    throw err;
  }

  const tentativas = [
    { nome: "BrasilAPI", fn: () => consultarBrasilApi(cnpj) },
    { nome: "Speedio", fn: () => consultarSpeedio(cnpj) },
    { nome: "ReceitaWS", fn: () => consultarReceitaWs(cnpj) },
  ];

  let ultimoErro = "falha";

  for (const t of tentativas) {
    try {
      const r = await t.fn();
      if (r.data) {
        return { success: true, fonte: t.nome, data: r.data };
      }
      if (r.erro === "nao_encontrado") ultimoErro = "nao_encontrado";
      if (r.erro === "skip") continue;
    } catch (e) {
      logTecnico(`Falha em ${t.nome}`, e);
      ultimoErro = "falha";
    }
  }

  if (ultimoErro === "nao_encontrado") {
    const err = new Error("Não encontramos dados para este CNPJ.");
    err.code = "CNPJ_NAO_ENCONTRADO";
    err.statusCode = 404;
    throw err;
  }
  const err = new Error(
    "O serviço de consulta está indisponível no momento. Tente novamente mais tarde."
  );
  err.code = "CNPJ_SERVICO_INDISPONIVEL";
  err.statusCode = 502;
  throw err;
}

module.exports = {
  consultarCnpj,
  consultarBrasilApi,
  consultarSpeedio,
  consultarReceitaWs,
  normalizarRespostaCnpj,
  limparCnpj,
  validarCnpjBasico,
};
