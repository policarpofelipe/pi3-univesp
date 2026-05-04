import { api } from "./authService";
import { limparCep, limparCnpj } from "../utils/documentos";

export async function consultarCnpj(cnpj) {
  const digits = limparCnpj(cnpj);
  const response = await api.get(`/consultas/cnpj/${digits}`);
  return response.data;
}

export async function consultarCep(cep) {
  const digits = limparCep(cep);
  const response = await api.get(`/consultas/cep/${digits}`);
  return response.data;
}
