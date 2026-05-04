# pi3-univesp
4º teste de deploy
Projeto Integrador 3 UNIVESP - Grupo 3 Alunos: 1. Isabella Aparecida Marzola 2. Julio Cesar Monteiro dos Santos 3. Edenilson Cordeiro Joares 4. Ana Flavia Damasceno Silva 5. Diogo Katto Mimatani 6. Felipe Martins Policarpo 7. Norma Terezinha da Silva 8. Jair Waldo Jara Palomino 9. Cesar Yukio Kato

## Créditos de ícones

- Ícone de acessibilidade baseado em “Accessibility logo (UN)”.
- Fonte: Wikimedia Commons — File:Accessibility_logo.svg.
- Crédito informado: Pablo Busatto, Public domain, via Wikimedia Commons.
- URL: [https://commons.wikimedia.org/wiki/File:Accessibility_logo.svg](https://commons.wikimedia.org/wiki/File:Accessibility_logo.svg)

## Consultas externas via API

O módulo **Gerenciar quadro** (configurações do quadro e aba **Geral** do painel lateral) inclui a seção **Consultas externas**, com botões que abrem **dialog modal** sobre a tela atual (mesmo padrão do detalhe do cartão, com `state.background` no React Router). A URL continua sendo `/quadros/:quadroId/consultas/cnpj` ou `.../consultas/endereco`; acesso direto à URL sem `state.background` ainda abre a **página completa**.

O **frontend** chama apenas a API interna (`GET /api/consultas/cnpj/:cnpj` e `GET /api/consultas/cep/:cep`), autenticada com o mesmo token das demais rotas. As chamadas a serviços públicos ficam no **backend** (evita CORS, unifica erros e permite fallback).

**CNPJ:** ordem de tentativa BrasilAPI → Speedio (somente se `SPEEDIO_API_USER` e `SPEEDIO_API_PASSWORD` estiverem definidos) → ReceitaWS.

**CEP:** ViaCEP primeiro; se não houver resultado útil, fallback BrasilAPI CEP v2.

Variáveis de ambiente sugeridas estão em `backend/.env.example`. Não commite credenciais reais. **Google Maps** não está implementado nesta versão (exigiria chave e faturamento); há apenas comentário opcional no `.env.example` para evolução futura.

## Convites e notificações

Convites de participação em **quadro** usam as tabelas `quadro_convites` (status pendente até resposta) e `quadro_convite_papeis` (papéis propostos). O convidado precisa **aceitar** no app para virar membro ativo em `quadro_membros` e receber os papéis em `quadro_membro_papeis`. Ao convidar pelo **Gerenciar quadro**, se o usuário ainda não estiver em `organizacao_membros`, o sistema cria o vínculo na organização do quadro como **membro** em status **convidado**; ao **aceitar** o convite do quadro, esse vínculo passa a **ativo** (quando ainda estava como convidado na organização). Notificações ficam em `notificacoes` (ex.: convite recebido, aceite ou recusa); o remetente recebe feedback quando o convidado responde. Não há e-mail externo neste fluxo: tudo é in-app (sino na barra superior).
