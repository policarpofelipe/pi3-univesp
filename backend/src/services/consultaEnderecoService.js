const {
  limparCep,
  validarCepBasico,
  formatarCep,
} = require("../utils/documentos");

const DEFAULT_VIACEP =
  process.env.VIACEP_BASE_URL || "https://viacep.com.br/ws";
const DEFAULT_BRASILAPI =
  process.env.BRASILAPI_BASE_URL || "https://brasilapi.com.br/api";

const FETCH_TIMEOUT_MS = 15000;

function logTecnico(msg, err) {
  if (process.env.NODE_ENV === "test") return;
  // eslint-disable-next-line no-console
  console.error(`[consultaCep] ${msg}`, err?.message || err || "");
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
    return { ok: res.ok, status: res.status, data };
  } finally {
    clearTimeout(t);
  }
}

function normalizarRespostaEndereco(payload) {
  const cep = limparCep(payload.cep);
  return {
    cep,
    cepFormatado: formatarCep(cep),
    logradouro: payload.logradouro || "",
    complemento: payload.complemento || "",
    bairro: payload.bairro || "",
    cidade: payload.cidade || "",
    uf: payload.uf || "",
    ibge: payload.ibge != null && payload.ibge !== "" ? String(payload.ibge) : "",
    ddd: payload.ddd != null && payload.ddd !== "" ? String(payload.ddd) : "",
  };
}

async function consultarViaCep(cepLimpo) {
  const base = DEFAULT_VIACEP.replace(/\/$/, "");
  const url = `${base}/${cepLimpo}/json/`;
  const { ok, data } = await fetchJson(url);
  if (!ok || !data) return { erro: "falha" };
  if (data.erro === true) return { erro: "nao_encontrado" };
  const mapped = normalizarRespostaEndereco({
    cep: data.cep,
    logradouro: data.logradouro,
    complemento: data.complemento,
    bairro: data.bairro,
    cidade: data.localidade,
    uf: data.uf,
    ibge: data.ibge,
    ddd: data.ddd,
  });
  return { data: mapped };
}

async function consultarBrasilApiCep(cepLimpo) {
  const base = DEFAULT_BRASILAPI.replace(/\/$/, "");
  const url = `${base}/cep/v2/${cepLimpo}`;
  const { ok, status, data } = await fetchJson(url);
  if (status === 404) return { erro: "nao_encontrado" };
  if (!ok || !data) return { erro: "falha" };
  const mapped = normalizarRespostaEndereco({
    cep: data.cep,
    logradouro: data.street || "",
    complemento: "",
    bairro: data.neighborhood || "",
    cidade: data.city || "",
    uf: data.state || "",
    ibge: typeof data.ibge !== "undefined" && data.ibge !== null ? data.ibge : "",
    ddd: "",
  });
  return { data: mapped };
}

async function consultarCep(cepBruto) {
  const cep = limparCep(cepBruto);
  if (!validarCepBasico(cep)) {
    const err = new Error("Informe um CEP com 8 dígitos.");
    err.code = "CEP_INVALIDO";
    err.statusCode = 400;
    throw err;
  }

  let viaNaoEncontrado = false;

  try {
    const via = await consultarViaCep(cep);
    if (via.data) {
      return { success: true, fonte: "ViaCEP", data: via.data };
    }
    if (via.erro === "nao_encontrado") viaNaoEncontrado = true;
  } catch (e) {
    logTecnico("ViaCEP", e);
  }

  let br = { erro: "falha" };
  try {
    br = await consultarBrasilApiCep(cep);
    if (br.data) {
      const d = br.data;
      if (d.logradouro || d.bairro || d.cidade || d.uf) {
        return { success: true, fonte: "BrasilAPI", data: d };
      }
    }
    if (br.erro === "nao_encontrado" && viaNaoEncontrado) {
      const err = new Error("Não encontramos endereço para este CEP.");
      err.code = "CEP_NAO_ENCONTRADO";
      err.statusCode = 404;
      throw err;
    }
  } catch (e) {
    if (e.statusCode) throw e;
    logTecnico("BrasilAPI CEP", e);
  }

  if (viaNaoEncontrado) {
    const err = new Error("Não encontramos endereço para este CEP.");
    err.code = "CEP_NAO_ENCONTRADO";
    err.statusCode = 404;
    throw err;
  }

  const err = new Error(
    "O serviço de consulta de endereço está indisponível no momento. Tente novamente mais tarde."
  );
  err.code = "CEP_SERVICO_INDISPONIVEL";
  err.statusCode = 502;
  throw err;
}

module.exports = {
  consultarCep,
  consultarViaCep,
  consultarBrasilApiCep,
  normalizarRespostaEndereco,
  limparCep,
  validarCepBasico,
};
