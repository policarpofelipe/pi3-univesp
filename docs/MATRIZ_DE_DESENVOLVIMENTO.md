==================================================
0. NOTAS DE USO (UI E CHECKLIST)
==================================================

Padrão de UI (frontend): novas telas e componentes devem usar os tokens em frontend/src/styles/tokens.css e as sobrescritas de tema em frontend/src/styles/themes.css (variáveis semânticas como --color-text, --font-size-md, etc.). Evitar cores em hex soltas e tamanhos fixos do Tailwind (por exemplo text-sm) onde o usuário controla escala de fonte ou tema; preferir var(--font-size-*) e utilitários que referenciem esses tokens.

Checklist (✅): marcar um item com ✅ somente depois que o arquivo existir no repositório principal (merge na branch acordada pelo time). Antes de criar um arquivo novo, conferir no repositório se já não há implementação equivalente com outro nome ou em outra pasta, para evitar duplicação.

==================================================
1. MATRIZ DE DIVISÃO DO DESENVOLVIMENTO
==================================================

Sugestão de divisão por frentes de trabalho:

FRENTE A — AUTENTICAÇÃO, BASE E NAVEGAÇÃO
Responsável ideal:
- pessoa com mais segurança em estrutura de projeto e integração geral

Escopo:
- login
- cadastro
- sessão/token
- proteção de rotas
- layout base
- navegação principal
- página inicial
- seleção de organização
- seleção de quadro

Dependências:
- nenhuma forte no início
- serve de base para todas as outras frentes

Entregas:
- fluxo de autenticação funcionando
- usuário entra e consegue navegar até os quadros
- rotas privadas funcionando
- layout geral padronizado

Status sugerido:
- começar primeiro

--------------------------------------------------

FRENTE B — ORGANIZAÇÕES, QUADROS, MEMBROS E PAPÉIS
Responsável ideal:
- pessoa com bom domínio de CRUD e modelagem relacional

Escopo:
- CRUD de organização
- CRUD de quadro
- membros da organização
- membros do quadro
- papéis do quadro
- associação de papéis aos membros do quadro
- preferências visuais do quadro por usuário

Dependências:
- autenticação pronta
- layout base pronto

Entregas:
- organização criada
- quadro criado
- membros vinculados ao quadro
- papéis configurados

Status sugerido:
- iniciar logo após autenticação básica

--------------------------------------------------

FRENTE C — LISTAS, PERMISSÕES E TRANSIÇÕES
Responsável ideal:
- pessoa cuidadosa com regra de negócio

Escopo:
- CRUD de listas
- reordenação de listas
- preferências de listas por usuário
- permissões por verbo (ver, editar, enviar_para)
- regras de transição entre listas
- validações de acesso e movimento

Dependências:
- quadro e papéis existentes

Entregas:
- listas funcionando
- ordem personalizada por usuário
- controle de visibilidade por papel
- transição livre por padrão e restrita quando configurada

Status sugerido:
- começar quando quadro e papéis já estiverem minimamente prontos

--------------------------------------------------

FRENTE D — CARTÕES E RECURSOS INTERNOS
Responsável ideal:
- pessoa com mais fôlego para volume de telas e integrações

Escopo:
- CRUD de cartões
- detalhe do cartão
- atribuições N:N
- comentários
- checklists
- anexos
- tags
- histórico de eventos
- visualizações do cartão

Dependências:
- listas prontas
- autenticação pronta

Entregas:
- cartão completo operando dentro do fluxo
- detalhes do cartão funcionando
- recursos internos integrados

Status sugerido:
- iniciar assim que listas já estiverem funcionando

--------------------------------------------------

FRENTE E — VISÕES, CAMPOS PERSONALIZADOS E AUTOMAÇÕES
Responsável ideal:
- pessoa com mais maturidade técnica
- é a frente mais conceitualmente difícil

Escopo:
- visões do quadro
- visões de sistema
- visões personalizadas
- campos personalizados
- opções de campos
- valores por cartão
- automações
- ações de automação
- execuções de automação
- handoff entre quadros
- relações entre cartões

Dependências:
- cartões funcionando
- quadros/lists/papéis prontos
- backend estável

Entregas:
- diferenciais do sistema
- maior valor de produto
- fluxo interquadros automatizado

Status sugerido:
- iniciar depois do núcleo funcional


==================================================
2. ESTRUTURA DE DIRETÓRIOS
==================================================

Sugestão geral do repositório:

/
├── frontend/
├── backend/
├── database/
├── docs/
├── .env.example
├── README.md

--------------------------------------------------
2.1. FRONTEND
--------------------------------------------------

frontend/
├── public/
├── src/
│   ├── assets/
│   │   ├── imagens/
│   │   ├── icones/
│   │   └── estilos/
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   ├── auth/
│   │   ├── organizacoes/
│   │   ├── quadros/
│   │   │   └── board/          (canvas Kanban, filtros, DnD)
│   │   ├── listas/
│   │   ├── cartoes/
│   │   ├── visoes/
│   │   ├── camposPersonalizados/
│   │   ├── automacoes/
│   │   └── ui/
│   ├── pages/
│   │   ├── auth/
│   │   ├── home/
│   │   ├── organizacoes/
│   │   ├── quadros/
│   │   ├── listas/
│   │   ├── cartoes/
│   │   ├── visoes/
│   │   ├── automacoes/
│   │   └── configuracoes/
│   ├── routes/
│   ├── services/
│   ├── hooks/
│   ├── context/
│   ├── utils/
│   ├── constants/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js

--------------------------------------------------
2.2. BACKEND
--------------------------------------------------

backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── routes/
│   ├── middlewares/
│   ├── validators/
│   ├── utils/
│   ├── jobs/
│   ├── events/
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeds/
│   │   └── connection.js
│   ├── app.js
│   └── server.js
├── package.json
└── .env.example

--------------------------------------------------
2.3. DATABASE / DOCUMENTAÇÃO
--------------------------------------------------

database/
├── schema.sql
├── seeds.sql
└── exemplos_consultas.sql

docs/
├── README.md
├── FUNCIONALIDADES_E_FLUXOS.md
├── ARQUITETURA.md
├── MODELAGEM_BANCO.md
├── MATRIZ_DE_DESENVOLVIMENTO.md
└── PADRAO_DE_PASTAS_E_ARQUIVOS.md

==================================================
3. NOMES DE ARQUIVOS — FRONTEND
==================================================

3.1. Autenticação

✅pages/auth/LoginPage.jsx - Felipe Policarpo 09/03/2026
✅pages/auth/CadastroPage.jsx - Felipe Policarpo 09/03/2026
✅pages/auth/EsqueciSenhaPage.jsx - Felipe Policarpo 09/03/2026
✅pages/auth/RedefinirSenhaPage.jsx - Felipe Policarpo 09/03/2026

✅components/auth/LoginForm.jsx - Felipe Policarpo 09/03/2026
✅components/auth/CadastroForm.jsx - Felipe Policarpo 09/03/2026
✅components/auth/RecuperacaoSenhaForm.jsx - Felipe Policarpo 09/03/2026

✅context/AuthContext.jsx - Felipe Policarpo 09/03/2026
✅hooks/useAuth.js - Felipe Policarpo 09/03/2026
✅services/authService.js - Felipe Policarpo 09/03/2026
✅routes/PrivateRoute.jsx - Felipe Policarpo 09/03/2026

--------------------------------------------------

3.2. Layout e navegação
✅components/layout/AppLayout.jsx
✅components/layout/Sidebar.jsx
✅components/layout/Topbar.jsx
✅components/layout/Breadcrumb.jsx
✅components/ui/Button.jsx — ver também 3.11 (`forwardRef`, 13/04/2026)
✅components/ui/IconButton.jsx
✅components/ui/ThemeToggle.jsx
✅components/ui/FontSizeControl.jsx
✅components/ui/PageHeader.jsx
✅components/ui/EmptyState.jsx
✅components/ui/LoadingState.jsx
✅components/ui/ErrorState.jsx
✅pages/home/HomePage.jsx
✅pages/SelecaoOrganizacaoPage.jsx
✅pages/SelecaoQuadroPage.jsx
✅context/AccessibilityContext.jsx
✅hooks/useAccessibility.js
✅constants/theme.js
✅styles/tokens.css
✅styles/themes.css
✅styles/globals.css
--------------------------------------------------

3.3. Organizações

✅pages/organizacoes/OrganizacoesPage.jsx
✅pages/organizacoes/OrganizacaoDetalhePage.jsx
✅pages/organizacoes/OrganizacaoMembrosPage.jsx
✅pages/organizacoes/OrganizacaoConfiguracoesPage.jsx

✅components/organizacoes/OrganizacaoCard.jsx
✅components/organizacoes/OrganizacaoForm.jsx
✅components/organizacoes/MembroOrganizacaoTable.jsx
✅components/organizacoes/ConviteMembroForm.jsx

✅services/organizacaoService.js

--------------------------------------------------

3.4. Quadros

✅pages/quadros/QuadrosPage.jsx
✅pages/quadros/QuadroDetalhePage.jsx — atualização 13/04/2026: layout Kanban, filtros rápidos na tela, integração com canvas DnD e drawer de gestão
✅pages/quadros/QuadroConfiguracoesPage.jsx
✅pages/quadros/QuadroMembrosPage.jsx
✅pages/quadros/QuadroPapeisPage.jsx

✅components/quadros/QuadroCard.jsx
✅components/quadros/QuadroForm.jsx
✅components/quadros/QuadroHeader.jsx
✅components/quadros/QuadroPreferenciasForm.jsx
✅components/quadros/QuadroMembrosTable.jsx
✅components/quadros/QuadroPapelForm.jsx
✅components/quadros/QuadroManagementDrawer.jsx — drawer lateral de gestão (membros, tags, visões, campos, automações, papéis, atividade) — 13/04/2026
✅components/quadros/board/QuadroBoardCanvas.jsx — listas horizontais, @dnd-kit, overlay de arraste — 13/04/2026
✅components/quadros/board/BoardSortableCard.jsx — cartão sortável no quadro — 13/04/2026
✅components/quadros/board/BoardQuickFilters.jsx — filtros rápidos (busca, tag, prioridade, prazo, situação, responsável) — 13/04/2026

✅styles/pages/board-quadro.css — estilos do quadro Kanban (colunas, cartões, filtros, drop) — 13/04/2026
✅styles/components/quadro-management-drawer.css — painel de gestão do quadro — 13/04/2026
✅styles/pages/quadro-detalhe.css — base da página de quadro (evolução contínua) — 13/04/2026
✅styles/components/app-layout.css — variante de largura útil para o quadro (`app-layout__content--quadro-kanban`) — 13/04/2026

✅utils/boardFilterUtils.js — regras de filtros rápidos e constante de virtualização futura — 13/04/2026
✅utils/boardItemIds.js — prefixos estáveis para itens/colunas no DnD — 13/04/2026

✅services/quadroService.js
✅services/quadroMembroService.js
✅services/quadroPapelService.js

✅package.json (frontend) — dependências @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities (quadro Kanban) — 13/04/2026

--------------------------------------------------

3.5. Listas

✅components/listas/ListaColumn.jsx — atualização 13/04/2026: cabeçalho de coluna Kanban, menu de ações da lista, corpo para canvas DnD
✅components/listas/ListaHeader.jsx — atualização 13/04/2026: nível de título configurável (`titleTag`) para hierarquia acessível no quadro
✅components/listas/ListaForm.jsx
✅components/listas/ListaPermissoesForm.jsx
✅components/listas/ListaTransicoesForm.jsx
✅components/listas/ReordenacaoListas.jsx

✅pages/listas/ListaConfiguracoesPage.jsx
✅pages/listas/ListaPermissoesPage.jsx
✅pages/listas/ListaTransicoesPage.jsx

✅services/listaService.js
✅services/listaPermissaoService.js
✅services/listaTransicaoService.js

--------------------------------------------------

3.6. Cartões

✅pages/cartoes/CartaoDetalhePage.jsx

✅components/cartoes/CartaoCard.jsx — atualização 13/04/2026: cartão tipo board (topo/corpo/rodapé), alça de arraste, menu de ações, metadados de responsáveis e checklist
✅components/cartoes/CartaoCardMenu.jsx — menu contextual do cartão no quadro (detalhes, editar, mover, arquivar) — 13/04/2026
✅components/cartoes/CartaoModal.jsx
✅components/cartoes/CartaoForm.jsx
✅components/cartoes/CartaoHeader.jsx
✅components/cartoes/CartaoDescricao.jsx
✅components/cartoes/CartaoPrazo.jsx
✅components/cartoes/CartaoPrioridade.jsx
✅components/cartoes/CartaoAtribuicoes.jsx
✅components/cartoes/CartaoTags.jsx
✅components/cartoes/CartaoCamposPersonalizados.jsx
✅components/cartoes/CartaoChecklist.jsx
✅components/cartoes/CartaoChecklistItem.jsx
✅components/cartoes/CartaoComentarios.jsx
✅components/cartoes/CartaoAnexos.jsx
✅components/cartoes/CartaoHistorico.jsx
✅components/cartoes/CartaoRelacoes.jsx
✅components/cartoes/CriacaoRapidaCartao.jsx — atualização 13/04/2026: modo Kanban expansível (“Adicionar cartão”)

✅services/cartaoService.js
✅services/cartaoComentarioService.js
✅services/cartaoChecklistService.js
✅services/cartaoAnexoService.js
✅services/cartaoAtribuicaoService.js
✅services/cartaoHistoricoService.js
✅services/cartaoRelacaoService.js
✅services/cartaoCampoValorService.js

--------------------------------------------------

3.7. Visões

✅pages/visoes/VisoesPage.jsx
✅pages/visoes/VisaoFormPage.jsx

✅components/visoes/VisaoTabs.jsx
✅components/visoes/VisaoListaResultados.jsx
✅components/visoes/VisaoForm.jsx
✅components/visoes/FiltroBuilder.jsx

✅services/visaoService.js

--------------------------------------------------

3.8. Tags

✅components/cartoes/TagBadge.jsx
✅components/cartoes/TagSelector.jsx
✅components/quadros/TagForm.jsx
✅components/quadros/TagList.jsx

✅services/tagService.js

--------------------------------------------------

3.9. Campos personalizados

✅pages/configuracoes/CamposPersonalizadosPage.jsx

✅components/camposPersonalizados/CampoPersonalizadoForm.jsx
✅components/camposPersonalizados/CampoPersonalizadoList.jsx
✅components/camposPersonalizados/CampoOpcaoForm.jsx
✅components/camposPersonalizados/RenderCampoTexto.jsx
✅components/camposPersonalizados/RenderCampoNumero.jsx
✅components/camposPersonalizados/RenderCampoData.jsx
✅components/camposPersonalizados/RenderCampoDataHora.jsx
✅components/camposPersonalizados/RenderCampoBooleano.jsx
✅components/camposPersonalizados/RenderCampoSelecao.jsx
✅components/camposPersonalizados/RenderCampoUsuario.jsx

✅services/campoPersonalizadoService.js

--------------------------------------------------

3.10. Automações

✅pages/automacoes/AutomacoesPage.jsx
✅pages/automacoes/AutomacaoFormPage.jsx

✅components/automacoes/AutomacaoForm.jsx
✅components/automacoes/AutomacaoList.jsx
✅components/automacoes/GatilhoSelector.jsx
✅components/automacoes/CondicaoBuilder.jsx
✅components/automacoes/AcaoBuilder.jsx
✅components/automacoes/HandoffConfigForm.jsx
✅components/automacoes/ExecucaoAutomacaoList.jsx

✅services/automacaoService.js

--------------------------------------------------

3.11. Utilitários

✅components/common/ConfirmDialog.jsx
✅components/common/LoadingSpinner.jsx
✅components/common/EmptyState.jsx
✅components/common/ErrorMessage.jsx

✅components/ui/Button.jsx — atualização 13/04/2026: `forwardRef` (foco em drawers/menus)
✅components/ui/Input.jsx
✅components/ui/Select.jsx
✅components/ui/Modal.jsx
✅components/ui/Badge.jsx
✅components/ui/Tabs.jsx
✅components/ui/Textarea.jsx

✅hooks/useDebounce.js
✅hooks/useModal.js
✅hooks/useToast.js

✅utils/dateUtils.js
✅utils/permissionUtils.js
✅utils/positionUtils.js
✅utils/filterUtils.js

✅constants/roles.js
✅constants/prioridades.js
✅constants/tiposCampo.js
✅constants/tiposEvento.js

==================================================
4. NOMES DE ARQUIVOS — BACKEND
==================================================

4.1. Configuração e bootstrap

✅src/app.js - Felipe Policarpo 09/03/2026
✅src/server.js - Felipe Policarpo 09/03/2026
✅src/config/env.js - Felipe Policarpo 09/03/2026
✅src/config/jwt.js - Felipe Policarpo 09/03/2026
✅src/config/upload.js - Felipe Policarpo 09/03/2026

--------------------------------------------------

4.2. Rotas

✅src/routes/authRoutes.js - Felipe Policarpo 09/03/2026
✅src/routes/usuarioRoutes.js - Felipe Policarpo 09/03/2026
✅src/routes/organizacaoRoutes.js
✅src/routes/quadroRoutes.js
✅src/routes/quadroMembroRoutes.js
✅src/routes/quadroPapelRoutes.js
✅src/routes/listaRoutes.js
✅src/routes/listaPermissaoRoutes.js
✅src/routes/listaTransicaoRoutes.js
✅src/routes/visaoRoutes.js
✅src/routes/tagRoutes.js
✅src/routes/campoPersonalizadoRoutes.js
✅src/routes/cartaoRoutes.js
✅src/routes/cartaoComentarioRoutes.js
✅src/routes/cartaoChecklistRoutes.js
✅src/routes/cartaoAnexoRoutes.js
✅src/routes/cartaoHistoricoRoutes.js
✅src/routes/cartaoAtribuicaoRoutes.js
✅src/routes/cartaoRelacaoRoutes.js
✅src/routes/cartaoCampoValorRoutes.js
✅src/routes/automacaoRoutes.js

--------------------------------------------------

4.3. Controllers

✅ src/controllers/AuthController.js - Felipe Policarpo 09/03/2026
✅src/controllers/UsuarioController.js
✅src/controllers/organizacaoController.js
✅src/controllers/QuadroController.js
✅src/controllers/QuadroMembroController.js
✅src/controllers/QuadroPapelController.js
✅src/controllers/listaController.js
✅src/controllers/cartaoController.js
✅src/controllers/cartaoComentarioController.js
✅src/controllers/ListaPermissaoController.js
✅src/controllers/ListaTransicaoController.js
✅src/controllers/VisaoController.js
✅src/controllers/tagController.js
✅src/controllers/campoPersonalizadoController.js
✅src/controllers/cartaoController.js
✅src/controllers/cartaoComentarioController.js
✅src/controllers/cartaoChecklistController.js
✅src/controllers/cartaoAnexoController.js
✅src/controllers/cartaoHistoricoController.js
✅src/controllers/cartaoAtribuicaoController.js
✅src/controllers/cartaoRelacaoController.js
✅src/controllers/cartaoCampoValorController.js
✅src/controllers/AutomacaoController.js

--------------------------------------------------

4.4. Services

✅src/services/AuthService.js - Felipe Policarpo 09/03/2026
✅src/services/UsuarioService.js
✅src/services/OrganizacaoService.js
✅src/services/QuadroService.js
✅src/services/QuadroMembroService.js
✅src/services/QuadroPapelService.js
✅src/services/ListaService.js
✅src/services/ListaPermissaoService.js
✅src/services/ListaTransicaoService.js
✅src/services/VisaoService.js
✅src/services/TagService.js
✅src/services/CampoPersonalizadoService.js
✅src/services/CartaoService.js
✅src/services/CartaoComentarioService.js
✅src/services/CartaoChecklistService.js
✅src/services/CartaoAnexoService.js
✅src/services/cartaoAtribuicaoService.js
✅src/services/cartaoRelacaoService.js
✅src/services/CartaoEventoService.js
✅src/services/CartaoVisualizacaoService.js
✅src/services/AutomacaoService.js
✅src/services/cartaoCampoValorService.js
✅src/services/AutomacaoExecutorService.js
✅src/services/HandoffService.js
✅src/services/PermissaoService.js
✅src/services/TransicaoService.js
✅src/services/UploadService.js
✅src/services/BuscaService.js

--------------------------------------------------

4.5. Repositories

✅src/repositories/UsuarioRepository.js - Felipe Policarpo 09/03/2026
✅src/repositories/OrganizacaoRepository.js
✅src/repositories/QuadroRepository.js
✅src/repositories/QuadroMembroRepository.js
✅src/repositories/QuadroPapelRepository.js
✅src/repositories/ListaRepository.js
✅src/repositories/ListaPermissaoRepository.js
✅src/repositories/ListaTransicaoRepository.js
✅src/repositories/VisaoRepository.js
✅src/repositories/TagRepository.js
✅src/repositories/CampoPersonalizadoRepository.js
✅src/repositories/CampoOpcaoRepository.js
✅src/repositories/CartaoRepository.js — atualização 13/04/2026: `listar` agrega `atribuidoUsuarioIds` e `checklistItensPendentes` por cartão (suporte a filtros no quadro)
✅src/repositories/CartaoComentarioRepository.js
✅src/repositories/CartaoChecklistRepository.js
✅src/repositories/CartaoChecklistItemRepository.js
✅src/repositories/CartaoAnexoRepository.js
✅src/repositories/CartaoAtribuicaoRepository.js
✅src/repositories/CartaoRelacaoRepository.js
✅src/repositories/CartaoCampoValorRepository.js
✅src/repositories/CartaoEventoRepository.js
✅src/repositories/CartaoVisualizacaoRepository.js
✅src/repositories/AutomacaoRepository.js
✅src/repositories/AutomacaoAcaoRepository.js
✅src/repositories/AutomacaoExecucaoRepository.js

--------------------------------------------------

4.6. Middlewares

✅src/middlewares/authMiddleware.js - Felipe Policarpo 09/03/2026
✅src/middlewares/errorMiddleware.js - Felipe Policarpo 09/03/2026
✅src/middlewares/permissionMiddleware.js
✅src/middlewares/validateRequestMiddleware.js
✅src/middlewares/uploadMiddleware.js

--------------------------------------------------

4.7. Validators

✅src/validators/authValidator.js
✅src/validators/organizacaoValidator.js
✅src/validators/quadroValidator.js
✅src/validators/listaValidator.js
✅src/validators/cartaoValidator.js
✅src/validators/campoPersonalizadoValidator.js
✅src/validators/automacaoValidator.js

--------------------------------------------------

4.8. Jobs e eventos internos

✅src/jobs/automacaoJob.js
✅src/jobs/prazoJob.js
✅src/events/cartaoCriadoEvent.js
✅src/events/cartaoMovidoEvent.js
✅src/events/prazoVencidoEvent.js

--------------------------------------------------

4.9. Utilitários

✅src/utils/dateUtils.js
✅src/utils/jsonFilterParser.js
✅src/utils/positionUtils.js
✅src/utils/hashUtils.js
✅src/utils/fileUtils.js
✅src/utils/paginationUtils.js

==================================================
5. BANCO / MIGRAÇÕES / SEEDS
==================================================

backend/src/database/
├── connection.js
├── migrations/
│   ├── 001_create_usuarios.sql
│   ├── 002_create_organizacoes.sql
│   ├── 003_create_organizacao_membros.sql
│   ├── 004_create_quadros.sql
│   ├── 005_create_quadro_membros.sql
│   ├── 006_create_quadro_papeis.sql
│   ├── 007_create_quadro_membro_papeis.sql
│   ├── 008_create_quadro_preferencias_usuario.sql
│   ├── 009_create_listas.sql
│   ├── 010_create_lista_preferencias_usuario.sql
│   ├── 011_create_lista_permissoes_papel.sql
│   ├── 012_create_lista_regras_transicao.sql
│   ├── 013_create_visoes_quadro.sql
│   ├── 014_create_visao_preferencias_usuario.sql
│   ├── 015_create_tags.sql
│   ├── 016_create_campos_personalizados.sql
│   ├── 017_create_campo_personalizado_opcoes.sql
│   ├── 018_create_cartoes.sql
│   ├── 019_create_cartao_atribuicoes.sql
│   ├── 020_create_cartao_tags.sql
│   ├── 021_create_cartao_campo_valores.sql
│   ├── 022_create_cartao_comentarios.sql
│   ├── 023_create_cartao_checklists.sql
│   ├── 024_create_cartao_checklist_itens.sql
│   ├── 025_create_cartao_anexos.sql
│   ├── 026_create_cartao_visualizacoes.sql
│   ├── 027_create_cartao_eventos.sql
│   ├── 028_create_cartao_relacoes.sql
│   ├── 029_create_automacoes.sql
│   ├── 030_create_automacao_acoes.sql
│   └── 031_create_automacao_execucoes.sql
└── seeds/
    ├── 001_seed_usuario_admin.sql
    ├── 002_seed_organizacao_exemplo.sql
    ├── 003_seed_quadro_exemplo.sql
    ├── 004_seed_papeis_padrao.sql
    ├── 005_seed_visoes_sistema.sql
    └── 006_seed_listas_exemplo.sql

==================================================
5. ORDEM PRÁTICA DE DESENVOLVIMENTO
==================================================

Sprint 1
- autenticação
- organizações
- quadros
- layout principal

Sprint 2
- listas
- cartões básicos
- movimentação de cartões ✅ (detalhe do quadro: drag-and-drop entre listas/reordenação, API `mover` com `posicao`; fallback “Mover para” no menu — 13/04/2026)
- membros e papéis

Sprint 3
- permissões por lista
- comentários
- checklists
- tags
- anexos

Sprint 4
- visões
- histórico
- campos personalizados

Sprint 5
- automações
- relações entre cartões
- handoff entre quadros
- refinamentos
