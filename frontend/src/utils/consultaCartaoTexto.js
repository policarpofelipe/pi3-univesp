import { formatarCnpj, formatarCep } from "./documentos";

const MAX_TITULO = 220;

/**
 * Descrição longa com todos os campos da consulta CNPJ (cartão).
 */
export function montarDescricaoCartaoCnpj(payload) {
  if (!payload?.success || !payload.data) return "";
  const d = payload.data;
  const e = d.endereco || {};
  const sec =
    Array.isArray(d.atividadesSecundarias) && d.atividadesSecundarias.length
      ? d.atividadesSecundarias.map((x) => `• ${x}`).join("\n")
      : "—";

  return [
    "Dados da consulta de CNPJ",
    `Fonte: ${payload.fonte || "—"}`,
    "",
    `Razão social: ${d.razaoSocial || "—"}`,
    `Nome fantasia: ${d.nomeFantasia || "—"}`,
    `CNPJ: ${d.cnpjFormatado || formatarCnpj(d.cnpj)}`,
    `Situação cadastral: ${d.situacao || "—"}`,
    `Data de abertura: ${d.dataAbertura || "—"}`,
    `Natureza jurídica: ${d.naturezaJuridica || "—"}`,
    `Porte: ${d.porte || "—"}`,
    `CNAE principal: ${d.cnaePrincipal || "—"}`,
    "",
    "Atividades secundárias:",
    sec,
    "",
    "Endereço:",
    `  Logradouro: ${e.logradouro || "—"}`,
    `  Número: ${e.numero || "—"}`,
    `  Complemento: ${e.complemento || "—"}`,
    `  Bairro: ${e.bairro || "—"}`,
    `  Município: ${e.municipio || "—"}`,
    `  UF: ${e.uf || "—"}`,
    `  CEP: ${e.cep || "—"}`,
    "",
    `Telefone: ${d.telefone || "—"}`,
    `E-mail: ${d.email || "—"}`,
  ].join("\n");
}

export function tituloCartaoCnpj(payload) {
  if (!payload?.success || !payload.data) return "Consulta CNPJ";
  const d = payload.data;
  const t =
    (d.razaoSocial || "").trim() ||
    (d.nomeFantasia || "").trim() ||
    `CNPJ ${d.cnpjFormatado || formatarCnpj(d.cnpj)}`;
  return t.length > MAX_TITULO ? t.slice(0, MAX_TITULO - 1).trimEnd() + "…" : t;
}

export function montarDescricaoCartaoCep(payload) {
  if (!payload?.success || !payload.data) return "";
  const d = payload.data;
  return [
    "Dados da consulta de CEP",
    `Fonte: ${payload.fonte || "—"}`,
    "",
    `CEP: ${d.cepFormatado || formatarCep(d.cep)}`,
    `Logradouro: ${d.logradouro || "—"}`,
    `Complemento: ${d.complemento || "—"}`,
    `Bairro: ${d.bairro || "—"}`,
    `Cidade: ${d.cidade || "—"}`,
    `UF: ${d.uf || "—"}`,
    `Código IBGE: ${d.ibge || "—"}`,
    `DDD: ${d.ddd || "—"}`,
  ].join("\n");
}

export function tituloCartaoCep(payload) {
  if (!payload?.success || !payload.data) return "Consulta CEP";
  const d = payload.data;
  const rua = (d.logradouro || "").trim();
  if (rua) {
    return rua.length > MAX_TITULO
      ? rua.slice(0, MAX_TITULO - 1).trimEnd() + "…"
      : rua;
  }
  const cidadeUf = [d.cidade, d.uf].filter(Boolean).join(" / ").trim();
  if (cidadeUf) {
    return cidadeUf.length > MAX_TITULO
      ? cidadeUf.slice(0, MAX_TITULO - 1).trimEnd() + "…"
      : cidadeUf;
  }
  const cep = d.cepFormatado || formatarCep(d.cep);
  return `Endereço — ${cep}`.slice(0, MAX_TITULO);
}
