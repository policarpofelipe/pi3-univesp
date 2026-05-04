export function limparCnpj(cnpj) {
  return String(cnpj || "").replace(/\D/g, "");
}

export function validarCnpjBasico(cnpj) {
  return limparCnpj(cnpj).length === 14;
}

export function formatarCnpj(cnpj) {
  const d = limparCnpj(cnpj);
  if (d.length !== 14) return d;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
}

/** Máscara progressiva enquanto o usuário digita (máx. 14 dígitos). */
export function formatarCnpjDigitando(valor) {
  const d = limparCnpj(valor).slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12)
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export function limparCep(cep) {
  return String(cep || "").replace(/\D/g, "");
}

export function validarCepBasico(cep) {
  return limparCep(cep).length === 8;
}

export function formatarCep(cep) {
  const d = limparCep(cep);
  if (d.length !== 8) return d;
  return `${d.slice(0, 5)}-${d.slice(5, 8)}`;
}

export function formatarCepDigitando(valor) {
  const d = limparCep(valor).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}
