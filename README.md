# pi3-univesp
4º teste de deploy
Projeto Integrador 3 UNIVESP - Grupo 3 Alunos: 1. Isabella Aparecida Marzola 2. Julio Cesar Monteiro dos Santos 3. Edenilson Cordeiro Joares 4. Ana Flavia Damasceno Silva 5. Diogo Katto Mimatani 6. Felipe Martins Policarpo 7. Norma Terezinha da Silva 8. Jair Waldo Jara Palomino 9. Cesar Yukio Kato

## Créditos de ícones

- Ícone de acessibilidade baseado em “Accessibility logo (UN)”.
- Fonte: Wikimedia Commons — File:Accessibility_logo.svg.
- Crédito informado: Pablo Busatto, Public domain, via Wikimedia Commons.
- URL: [https://commons.wikimedia.org/wiki/File:Accessibility_logo.svg](https://commons.wikimedia.org/wiki/File:Accessibility_logo.svg)

## Consultas externas via API

O módulo **Gerenciar quadro** (configurações do quadro e aba **Geral** do painel lateral) inclui a seção **Consultas externas**, com atalhos para:

- `/quadros/:quadroId/consultas/cnpj` — consulta de CNPJ
- `/quadros/:quadroId/consultas/endereco` — consulta de endereço por CEP

O **frontend** chama apenas a API interna (`GET /api/consultas/cnpj/:cnpj` e `GET /api/consultas/cep/:cep`), autenticada com o mesmo token das demais rotas. As chamadas a serviços públicos ficam no **backend** (evita CORS, unifica erros e permite fallback).

**CNPJ:** ordem de tentativa BrasilAPI → Speedio (somente se `SPEEDIO_API_USER` e `SPEEDIO_API_PASSWORD` estiverem definidos) → ReceitaWS.

**CEP:** ViaCEP primeiro; se não houver resultado útil, fallback BrasilAPI CEP v2.

Variáveis de ambiente sugeridas estão em `backend/.env.example`. Não commite credenciais reais. **Google Maps** não está implementado nesta versão (exigiria chave e faturamento); há apenas comentário opcional no `.env.example` para evolução futura.
