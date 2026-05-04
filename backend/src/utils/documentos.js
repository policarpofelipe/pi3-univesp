/**
 * Utilitários para CNPJ e CEP (validação básica por tamanho e formatação).
 */

function apenasDigitos(valor) {
  return String(valor || "").replace(/\D/g, "");
}

function limparCnpj(cnpj) {
  return apenasDigitos(cnpj);
}

function validarCnpjBasico(cnpj) {
  const d = limparCnpj(cnpj);
  return d.length === 14;
}

function formatarCnpj(cnpj) {
  const d = limparCnpj(cnpj);
  if (d.length !== 14) return d;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
}

function limparCep(cep) {
  return apenasDigitos(cep);
}

function validarCepBasico(cep) {
  return limparCep(cep).length === 8;
}

function formatarCep(cep) {
  const d = limparCep(cep);
  if (d.length !== 8) return d;
  return `${d.slice(0, 5)}-${d.slice(5, 8)}`;
}

module.exports = {
  limparCnpj,
  validarCnpjBasico,
  formatarCnpj,
  limparCep,
  validarCepBasico,
  formatarCep,
};
