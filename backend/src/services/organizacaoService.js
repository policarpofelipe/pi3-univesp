// services/organizacaoService.js

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

/*
Função base para requisições
Centraliza:
- headers
- tratamento de erro
- parsing de resposta
*/
async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Erro na requisição");
    }

    return data;
  } catch (error) {
    console.error("organizacaoService error:", error);
    throw error;
  }
}

/*
===========================
ORGANIZAÇÕES
===========================
*/

// Listar organizações do usuário
export async function listarOrganizacoes() {
  return request("/organizacoes");
}

// Buscar uma organização por ID
export async function buscarOrganizacaoPorId(id) {
  if (!id) throw new Error("ID da organização é obrigatório");
  return request(`/organizacoes/${id}`);
}

// Criar nova organização
export async function criarOrganizacao(payload) {
  return request("/organizacoes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Atualizar organização
export async function atualizarOrganizacao(id, payload) {
  if (!id) throw new Error("ID da organização é obrigatório");

  return request(`/organizacoes/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// Excluir organização
export async function excluirOrganizacao(id) {
  if (!id) throw new Error("ID da organização é obrigatório");

  return request(`/organizacoes/${id}`, {
    method: "DELETE",
  });
}

/*
===========================
MEMBROS DA ORGANIZAÇÃO
===========================
*/

// Listar membros da organização
export async function listarMembrosOrganizacao(organizacaoId) {
  if (!organizacaoId) throw new Error("organizacaoId é obrigatório");

  return request(`/organizacoes/${organizacaoId}/membros`);
}

// Convidar membro para organização
export async function convidarMembro(organizacaoId, payload) {
  if (!organizacaoId) throw new Error("organizacaoId é obrigatório");

  return request(`/organizacoes/${organizacaoId}/membros`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Atualizar papel do membro
export async function atualizarMembro(organizacaoId, membroId, payload) {
  if (!organizacaoId || !membroId) {
    throw new Error("organizacaoId e membroId são obrigatórios");
  }

  return request(`/organizacoes/${organizacaoId}/membros/${membroId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// Remover membro da organização
export async function removerMembro(organizacaoId, membroId) {
  if (!organizacaoId || !membroId) {
    throw new Error("organizacaoId e membroId são obrigatórios");
  }

  return request(`/organizacoes/${organizacaoId}/membros/${membroId}`, {
    method: "DELETE",
  });
}

/*
===========================
CONFIGURAÇÕES
===========================
*/

// Buscar configurações da organização
export async function buscarConfiguracoes(organizacaoId) {
  if (!organizacaoId) throw new Error("organizacaoId é obrigatório");

  return request(`/organizacoes/${organizacaoId}/configuracoes`);
}

// Atualizar configurações da organização
export async function atualizarConfiguracoes(organizacaoId, payload) {
  if (!organizacaoId) throw new Error("organizacaoId é obrigatório");

  return request(`/organizacoes/${organizacaoId}/configuracoes`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}