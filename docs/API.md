# API REST do Sistema (mínima demonstrável)

## Visão geral

Esta documentação descreve uma API REST simplificada do sistema Kanban, focada em integrações práticas e demonstrações acadêmicas.

Exemplo de integração: um formulário externo envia dados para a API e cria um cartão automaticamente em um quadro.

## URL base

- Produção (exemplo): `https://SEU_DOMINIO/api`
- Desenvolvimento (comum): `http://localhost:3000/api`

## Autenticação (Bearer Token)

Todos os endpoints de dados internos exigem autenticação JWT.

### Login

`POST /api/auth/login`

Body:

```json
{
  "email": "usuario@email.com",
  "senha": "sua-senha"
}
```

Após o login, enviar o token no header:

`Authorization: Bearer SEU_TOKEN_AQUI`

## Padrão de resposta

Sucesso:

```json
{
  "success": true,
  "data": {}
}
```

Erro:

```json
{
  "success": false,
  "message": "Descrição do erro."
}
```

## Endpoints mínimos desta versão

### 1) Resumo do quadro

`GET /api/quadros/:quadroId/resumo`

Retorna:
- dados básicos do quadro
- total de listas
- total de cartões
- cartões por lista
- cartões por prioridade
- cartões vencidos

Exemplo:

```json
{
  "success": true,
  "data": {
    "quadro": {
      "id": 12,
      "nome": "Comercial",
      "descricao": "Pipeline de contatos"
    },
    "totalListas": 4,
    "totalCartoes": 12,
    "cartoesPorLista": [
      {
        "listaId": 31,
        "lista": "A fazer",
        "total": 5
      }
    ],
    "cartoesPorPrioridade": {
      "baixa": 2,
      "media": 6,
      "alta": 3,
      "urgente": 1
    },
    "cartoesVencidos": 2
  }
}
```

### 2) Listar listas do quadro

`GET /api/quadros/:quadroId/listas`

Uso típico: descobrir IDs de listas para criar cartões por integração.

### 3) Criar cartão no quadro

`POST /api/quadros/:quadroId/cartoes`

Headers:
- `Authorization: Bearer SEU_TOKEN_AQUI`
- `Content-Type: application/json`

Body de exemplo:

```json
{
  "listaId": 31,
  "titulo": "Contato recebido pelo formulário",
  "descricao": "Nome: Ana\nTelefone: (11) 99999-9999\nMensagem: Gostaria de um orçamento.",
  "prioridade": "media"
}
```

## Exemplo de integração com formulário externo

Fluxo recomendado:
1. Serviço externo autentica (`/api/auth/login`) e obtém token.
2. Serviço chama `GET /api/quadros/:quadroId/listas` para identificar a lista de destino.
3. Serviço chama `POST /api/quadros/:quadroId/cartoes` com os dados do formulário.

## Observações de segurança

- Não compartilhe o token.
- Use usuários com permissões mínimas necessárias.
- Revise acesso do usuário ao quadro antes de integrar sistemas externos.
- Endpoints de quadro só retornam dados para membros autorizados.

## Códigos de erro comuns

- `401` Não autenticado/token inválido
- `403` Sem acesso ao quadro/organização
- `404` Recurso não encontrado
- `422` Erro de validação de payload
- `500` Erro interno
