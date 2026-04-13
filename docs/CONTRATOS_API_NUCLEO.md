# Contratos da API - Nucleo Kanban (Etapa 1)

Objetivo: definir contratos estaveis para `quadros`, `membros`, `papeis`, `listas` e `cartoes` antes da migracao total para persistencia MySQL.

## 1) Padrao global de resposta

### 1.1 Sucesso

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "uuid-opcional",
    "timestamp": "2026-04-13T12:00:00.000Z"
  }
}
```

- `data` pode ser objeto ou array.
- `meta` e opcional, mas recomendado em listagens/paginacao.

### 1.2 Erro

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Campo titulo e obrigatorio.",
    "details": [
      {
        "field": "titulo",
        "issue": "required"
      }
    ]
  },
  "meta": {
    "requestId": "uuid-opcional",
    "timestamp": "2026-04-13T12:00:00.000Z"
  }
}
```

Codigos de erro padrao:
- `VALIDATION_ERROR` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `CONFLICT` (409)
- `INTERNAL_ERROR` (500)

## 2) Convencoes de dominio

- IDs: `INT UNSIGNED` (alinhado ao `database/schema.sql`).
- Datas: ISO 8601 UTC no JSON.
- Booleans: sempre boolean real (`true/false`), nunca `0/1`.
- Paginacao (quando aplicavel): `page`, `pageSize`, `total`.

## 3) Enums obrigatorios (schema.sql)

### 3.1 Organizacao membro
- `papel`: `dono | admin | membro | leitor`
- `status`: `ativo | convidado | suspenso`

### 3.2 Quadro membro
- `status`: `ativo | convidado | suspenso`

### 3.3 Cartao
- `prioridade`: `baixa | media | alta | urgente`

## 4) Contratos de endpoints - Nucleo

Base URL: `/api`

## 4.1 Quadros

### GET `/quadros`
- Query: `organizacaoId?`, `arquivado?`, `busca?`, `page?`, `pageSize?`
- `data[]`:
  - `id`, `organizacaoId`, `nome`, `descricao`, `criadoPorUsuarioId`
  - `arquivadoEm`, `criadoEm`, `atualizadoEm`

### GET `/quadros/:quadroId`
- `data` mesmo shape do item de listagem.

### POST `/quadros`
- Body:
```json
{
  "organizacaoId": 1,
  "nome": "Produto e Backlog",
  "descricao": "Quadro principal"
}
```

### PUT `/quadros/:quadroId`
- Body parcial:
```json
{
  "nome": "Novo nome",
  "descricao": "Nova descricao"
}
```

### DELETE `/quadros/:quadroId`
- Soft delete recomendado via `arquivadoEm` quando aplicavel.

### PATCH `/quadros/:quadroId/arquivar`
### PATCH `/quadros/:quadroId/desarquivar`

## 4.2 Membros de quadro

### GET `/quadros/:quadroId/membros`
- Query: `status?`, `busca?`
- `data[]`:
  - `id`, `quadroId`, `usuarioId`, `status`
  - `nomeExibicao`, `email`
  - `papeis[]` com `{ id, nome }`

### POST `/quadros/:quadroId/membros`
- Body:
```json
{
  "usuarioId": 5,
  "status": "ativo"
}
```

### POST `/quadros/:quadroId/membros/convites`
- Body:
```json
{
  "email": "membro@empresa.com"
}
```

### PATCH `/quadros/:quadroId/membros/:membroId/papel`
- Body:
```json
{
  "papelId": 3
}
```

### DELETE `/quadros/:quadroId/membros/:membroId`

## 4.3 Papeis de quadro

### GET `/quadros/:quadroId/papeis`
- `data[]`:
  - `id`, `quadroId`, `nome`, `descricao`, `ativo`
  - `podeGerenciarQuadro`, `podeGerenciarListas`, `podeGerenciarAutomacoes`
  - `podeGerenciarCampos`, `podeConvidarMembros`, `podeCriarCartao`

### POST `/quadros/:quadroId/papeis`
- Body:
```json
{
  "nome": "Colaborador",
  "descricao": "Operacao diaria",
  "podeGerenciarQuadro": false,
  "podeGerenciarListas": true,
  "podeGerenciarAutomacoes": false,
  "podeGerenciarCampos": false,
  "podeConvidarMembros": false,
  "podeCriarCartao": true
}
```

### PUT `/quadros/:quadroId/papeis/:papelId`
### PATCH `/quadros/:quadroId/papeis/:papelId/permissoes`
### DELETE `/quadros/:quadroId/papeis/:papelId`

## 4.4 Listas

### GET `/quadros/:quadroId/listas`
- `data[]`:
  - `id`, `quadroId`, `nome`, `descricao`, `cor`, `natureza`
  - `posicaoPadrao`, `usaControleAcesso`, `usaRegrasTransicao`
  - `limiteWip`, `ativa`, `totalCartoes`

### POST `/quadros/:quadroId/listas`
- Body:
```json
{
  "nome": "Em andamento",
  "descricao": "Execucao",
  "cor": "#2563eb",
  "limiteWip": 5
}
```

### PUT `/quadros/:quadroId/listas/:listaId`
### DELETE `/quadros/:quadroId/listas/:listaId`

### PATCH `/quadros/:quadroId/listas/reordenar`
- Body:
```json
{
  "ids": [12, 14, 10]
}
```

## 4.5 Cartoes

### GET `/quadros/:quadroId/cartoes`
- Query: `listaId?`, `busca?`, `prioridade?`, `arquivado?`
- `data[]`:
  - `id`, `listaId`, `titulo`, `descricao`, `prioridade`
  - `posicao`, `prazoEm`, `concluidoEm`, `criadoPorUsuarioId`
  - `arquivadoEm`, `criadoEm`, `atualizadoEm`
  - `tagIds[]`

### GET `/quadros/:quadroId/cartoes/:cartaoId`

### POST `/quadros/:quadroId/cartoes`
- Body:
```json
{
  "listaId": 10,
  "titulo": "Implementar API de papeis",
  "descricao": "Criar CRUD completo",
  "prioridade": "alta",
  "prazoEm": "2026-04-20T00:00:00.000Z",
  "tagIds": [7, 9]
}
```

### PUT `/quadros/:quadroId/cartoes/:cartaoId`
- Body parcial com os mesmos campos do POST.

### PATCH `/quadros/:quadroId/cartoes/:cartaoId/mover`
- Body:
```json
{
  "listaId": 11,
  "posicao": 2
}
```

### DELETE `/quadros/:quadroId/cartoes/:cartaoId`

## 5) Regras de validacao minima

- IDs de rota devem ser inteiros positivos.
- `nome` e `titulo` obrigatorios e sem string vazia.
- `prioridade` deve aceitar os 4 valores do schema (inclui `urgente`).
- `listaId` de cartao deve pertencer ao mesmo `quadroId` da rota.
- `papelId` vinculado ao membro deve pertencer ao mesmo quadro.
- Em movimentacao de cartao, validar transicao/permissao quando esses modulos forem ativados.

## 6) Compatibilidade e migracao

- Enquanto houver endpoints legados em memoria, manter o mesmo shape de resposta para evitar quebra no frontend.
- Toda nova implementacao persistida deve seguir este documento como contrato-fonte.
- Alteracao de contrato exige atualizacao deste arquivo e comunicacao no changelog do projeto.

