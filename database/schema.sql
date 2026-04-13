-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Tempo de geração: 13/04/2026 às 15:16
-- Versão do servidor: 8.0.45
-- Versão do PHP: 8.4.19

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `flivocom_bd_pi3`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `automacao_acoes`
--

CREATE TABLE `automacao_acoes` (
  `id` int UNSIGNED NOT NULL,
  `automacao_id` int UNSIGNED NOT NULL,
  `ordem_execucao` int UNSIGNED NOT NULL DEFAULT '1',
  `tipo_acao` enum('CRIAR_CARTAO_RELACIONADO','MOVER_CARTAO','ATRIBUIR_USUARIO','ADICIONAR_TAG','REMOVER_TAG','PREENCHER_CAMPO','ARQUIVAR_CARTAO','DESARQUIVAR_CARTAO') NOT NULL,
  `config_json` json DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `automacao_execucoes`
--

CREATE TABLE `automacao_execucoes` (
  `id` int UNSIGNED NOT NULL,
  `automacao_id` int UNSIGNED NOT NULL,
  `acao_id` int UNSIGNED NOT NULL,
  `cartao_id` int UNSIGNED NOT NULL,
  `status_execucao` enum('sucesso','erro') NOT NULL DEFAULT 'sucesso',
  `resultado_json` json DEFAULT NULL,
  `executado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `automacoes`
--

CREATE TABLE `automacoes` (
  `id` int UNSIGNED NOT NULL,
  `quadro_id` int UNSIGNED NOT NULL,
  `nome` varchar(160) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `gatilho` enum('AO_CRIAR_CARTAO','AO_ENTRAR_NA_LISTA','AO_SAIR_DA_LISTA','AO_ATUALIZAR_CAMPO','AO_VENCER_PRAZO') NOT NULL,
  `lista_origem_id` int UNSIGNED DEFAULT NULL,
  `lista_destino_id` int UNSIGNED DEFAULT NULL,
  `campo_id` int UNSIGNED DEFAULT NULL,
  `condicoes_json` json DEFAULT NULL,
  `executa_uma_vez_por_cartao` tinyint(1) NOT NULL DEFAULT '1',
  `ordem_execucao` int UNSIGNED NOT NULL DEFAULT '1',
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `criado_por_usuario_id` int UNSIGNED DEFAULT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `campos_personalizados`
--

CREATE TABLE `campos_personalizados` (
  `id` int UNSIGNED NOT NULL,
  `quadro_id` int UNSIGNED NOT NULL,
  `nome` varchar(120) NOT NULL,
  `tipo` enum('texto_curto','texto_longo','numero','data','data_hora','booleano','selecao','usuario') NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `obrigatorio` tinyint(1) NOT NULL DEFAULT '0',
  `posicao` bigint NOT NULL DEFAULT '1000',
  `config_json` json DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `campo_personalizado_opcoes`
--

CREATE TABLE `campo_personalizado_opcoes` (
  `id` int UNSIGNED NOT NULL,
  `campo_id` int UNSIGNED NOT NULL,
  `nome` varchar(100) NOT NULL,
  `valor` varchar(100) DEFAULT NULL,
  `cor` varchar(20) DEFAULT NULL,
  `posicao` bigint NOT NULL DEFAULT '1000',
  `ativa` tinyint(1) NOT NULL DEFAULT '1',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `cartao_anexos`
--

CREATE TABLE `cartao_anexos` (
  `id` int UNSIGNED NOT NULL,
  `cartao_id` int UNSIGNED NOT NULL,
  `enviado_por_usuario_id` int UNSIGNED DEFAULT NULL,
  `nome_original` varchar(255) NOT NULL,
  `mime_type` varchar(80) DEFAULT NULL,
  `tamanho_bytes` bigint UNSIGNED DEFAULT NULL,
  `caminho_arquivo` varchar(500) NOT NULL,
  `sha256` char(64) DEFAULT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `removido_em` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `cartao_atribuicoes`
--

CREATE TABLE `cartao_atribuicoes` (
  `id` int UNSIGNED NOT NULL,
  `cartao_id` int UNSIGNED NOT NULL,
  `usuario_id` int UNSIGNED NOT NULL,
  `papel_no_cartao` enum('responsavel','participante') NOT NULL DEFAULT 'participante',
  `atribuido_por_usuario_id` int UNSIGNED DEFAULT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `cartao_campo_valores`
--

CREATE TABLE `cartao_campo_valores` (
  `id` int UNSIGNED NOT NULL,
  `cartao_id` int UNSIGNED NOT NULL,
  `campo_id` int UNSIGNED NOT NULL,
  `valor_texto` longtext,
  `valor_numero` decimal(18,4) DEFAULT NULL,
  `valor_data` date DEFAULT NULL,
  `valor_data_hora` datetime DEFAULT NULL,
  `valor_booleano` tinyint(1) DEFAULT NULL,
  `valor_opcao_id` int UNSIGNED DEFAULT NULL,
  `valor_usuario_id` int UNSIGNED DEFAULT NULL,
  `valor_json` json DEFAULT NULL,
  `atualizado_por_usuario_id` int UNSIGNED DEFAULT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `cartao_checklists`
--

CREATE TABLE `cartao_checklists` (
  `id` int UNSIGNED NOT NULL,
  `cartao_id` int UNSIGNED NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `posicao` bigint NOT NULL DEFAULT '1000',
  `criado_por_usuario_id` int UNSIGNED DEFAULT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `removido_em` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `cartao_checklist_itens`
--

CREATE TABLE `cartao_checklist_itens` (
  `id` int UNSIGNED NOT NULL,
  `checklist_id` int UNSIGNED NOT NULL,
  `titulo` varchar(240) NOT NULL,
  `posicao` bigint NOT NULL DEFAULT '1000',
  `prazo_em` datetime DEFAULT NULL,
  `concluido` tinyint(1) NOT NULL DEFAULT '0',
  `concluido_em` datetime DEFAULT NULL,
  `concluido_por_usuario_id` int UNSIGNED DEFAULT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `removido_em` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `cartao_comentarios`
--

CREATE TABLE `cartao_comentarios` (
  `id` int UNSIGNED NOT NULL,
  `cartao_id` int UNSIGNED NOT NULL,
  `usuario_id` int UNSIGNED NOT NULL,
  `texto` text NOT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `editado_em` datetime DEFAULT NULL,
  `removido_em` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `cartao_eventos`
--

CREATE TABLE `cartao_eventos` (
  `id` int UNSIGNED NOT NULL,
  `cartao_id` int UNSIGNED NOT NULL,
  `usuario_id` int UNSIGNED DEFAULT NULL,
  `tipo_evento` enum('CRIADO','MOVIDO_LISTA','EDITADO_TITULO','EDITADO_DESCRICAO','PRAZO_ALTERADO','PRIORIDADE_ALTERADA','ATRIBUIDO','DESATRIBUIDO','TAG_ADICIONADA','TAG_REMOVIDA','CAMPO_ALTERADO','CHECKLIST_CRIADA','CHECKLIST_ITEM_CRIADO','CHECKLIST_ITEM_CONCLUIDO','CHECKLIST_ITEM_REABERTO','ANEXO_ADICIONADO','ANEXO_REMOVIDO','COMENTARIO_ADICIONADO','COMENTARIO_EDITADO','COMENTARIO_REMOVIDO','ARQUIVADO','DESARQUIVADO','AUTOMACAO_EXECUTADA','RELACAO_CRIADA') NOT NULL,
  `dados_json` json DEFAULT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `cartao_relacoes`
--

CREATE TABLE `cartao_relacoes` (
  `id` int UNSIGNED NOT NULL,
  `cartao_origem_id` int UNSIGNED NOT NULL,
  `cartao_destino_id` int UNSIGNED NOT NULL,
  `tipo_relacao` enum('ORIGINOU','DEPENDE_DE','BLOQUEIA','DUPLICADO_DE','RELACIONADO_A') NOT NULL DEFAULT 'RELACIONADO_A',
  `criado_por_usuario_id` int UNSIGNED DEFAULT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `cartao_tags`
--

CREATE TABLE `cartao_tags` (
  `cartao_id` int UNSIGNED NOT NULL,
  `tag_id` int UNSIGNED NOT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `cartao_visualizacoes`
--

CREATE TABLE `cartao_visualizacoes` (
  `id` int UNSIGNED NOT NULL,
  `cartao_id` int UNSIGNED NOT NULL,
  `usuario_id` int UNSIGNED NOT NULL,
  `ultimo_visto_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `vistas_total` int UNSIGNED NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `cartoes`
--

CREATE TABLE `cartoes` (
  `id` int UNSIGNED NOT NULL,
  `lista_id` int UNSIGNED NOT NULL,
  `titulo` varchar(220) NOT NULL,
  `descricao` longtext,
  `prioridade` enum('baixa','media','alta','urgente') NOT NULL DEFAULT 'media',
  `posicao` bigint NOT NULL DEFAULT '1000',
  `prazo_em` datetime DEFAULT NULL,
  `concluido_em` datetime DEFAULT NULL,
  `criado_por_usuario_id` int UNSIGNED DEFAULT NULL,
  `arquivado_em` datetime DEFAULT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `listas`
--

CREATE TABLE `listas` (
  `id` int UNSIGNED NOT NULL,
  `quadro_id` int UNSIGNED NOT NULL,
  `nome` varchar(160) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `cor` varchar(20) DEFAULT NULL,
  `natureza` enum('fixa','personalizada') NOT NULL DEFAULT 'personalizada',
  `posicao_padrao` bigint NOT NULL DEFAULT '1000',
  `usa_controle_acesso` tinyint(1) NOT NULL DEFAULT '0',
  `usa_regras_transicao` tinyint(1) NOT NULL DEFAULT '0',
  `limite_wip` int UNSIGNED DEFAULT NULL,
  `ativa` tinyint(1) NOT NULL DEFAULT '1',
  `criada_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizada_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `lista_permissoes_papel`
--

CREATE TABLE `lista_permissoes_papel` (
  `id` int UNSIGNED NOT NULL,
  `lista_id` int UNSIGNED NOT NULL,
  `papel_id` int UNSIGNED NOT NULL,
  `pode_ver` tinyint(1) NOT NULL DEFAULT '1',
  `pode_editar` tinyint(1) NOT NULL DEFAULT '1',
  `pode_enviar_para` tinyint(1) NOT NULL DEFAULT '1',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `lista_preferencias_usuario`
--

CREATE TABLE `lista_preferencias_usuario` (
  `id` int UNSIGNED NOT NULL,
  `lista_id` int UNSIGNED NOT NULL,
  `usuario_id` int UNSIGNED NOT NULL,
  `posicao` bigint DEFAULT NULL,
  `oculta` tinyint(1) NOT NULL DEFAULT '0',
  `colapsada` tinyint(1) NOT NULL DEFAULT '0',
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `lista_regras_transicao`
--

CREATE TABLE `lista_regras_transicao` (
  `id` int UNSIGNED NOT NULL,
  `lista_origem_id` int UNSIGNED NOT NULL,
  `lista_destino_id` int UNSIGNED NOT NULL,
  `papel_id` int UNSIGNED DEFAULT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `organizacao_membros`
--

CREATE TABLE `organizacao_membros` (
  `id` int UNSIGNED NOT NULL,
  `organizacao_id` int UNSIGNED NOT NULL,
  `usuario_id` int UNSIGNED NOT NULL,
  `papel` enum('dono','admin','membro','leitor') NOT NULL DEFAULT 'membro',
  `status` enum('ativo','convidado','suspenso') NOT NULL DEFAULT 'ativo',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `organizacoes`
--

CREATE TABLE `organizacoes` (
  `id` int UNSIGNED NOT NULL,
  `nome` varchar(160) NOT NULL,
  `slug` varchar(160) NOT NULL,
  `descricao` text,
  `criado_por_usuario_id` int UNSIGNED DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `quadros`
--

CREATE TABLE `quadros` (
  `id` int UNSIGNED NOT NULL,
  `organizacao_id` int UNSIGNED NOT NULL,
  `nome` varchar(160) NOT NULL,
  `descricao` text,
  `criado_por_usuario_id` int UNSIGNED DEFAULT NULL,
  `arquivado_em` datetime DEFAULT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `quadro_membros`
--

CREATE TABLE `quadro_membros` (
  `id` int UNSIGNED NOT NULL,
  `quadro_id` int UNSIGNED NOT NULL,
  `usuario_id` int UNSIGNED NOT NULL,
  `status` enum('ativo','convidado','suspenso') NOT NULL DEFAULT 'ativo',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `quadro_membro_papeis`
--

CREATE TABLE `quadro_membro_papeis` (
  `id` int UNSIGNED NOT NULL,
  `quadro_membro_id` int UNSIGNED NOT NULL,
  `papel_id` int UNSIGNED NOT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `quadro_papeis`
--

CREATE TABLE `quadro_papeis` (
  `id` int UNSIGNED NOT NULL,
  `quadro_id` int UNSIGNED NOT NULL,
  `nome` varchar(100) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `pode_gerenciar_quadro` tinyint(1) NOT NULL DEFAULT '0',
  `pode_gerenciar_listas` tinyint(1) NOT NULL DEFAULT '0',
  `pode_gerenciar_automacoes` tinyint(1) NOT NULL DEFAULT '0',
  `pode_gerenciar_campos` tinyint(1) NOT NULL DEFAULT '0',
  `pode_convidar_membros` tinyint(1) NOT NULL DEFAULT '0',
  `pode_criar_cartao` tinyint(1) NOT NULL DEFAULT '1',
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `quadro_preferencias_usuario`
--

CREATE TABLE `quadro_preferencias_usuario` (
  `id` int UNSIGNED NOT NULL,
  `quadro_id` int UNSIGNED NOT NULL,
  `usuario_id` int UNSIGNED NOT NULL,
  `tema` enum('claro','escuro','sistema') NOT NULL DEFAULT 'sistema',
  `cor_fundo` varchar(20) DEFAULT NULL,
  `compacto` tinyint(1) NOT NULL DEFAULT '0',
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `tags`
--

CREATE TABLE `tags` (
  `id` int UNSIGNED NOT NULL,
  `quadro_id` int UNSIGNED NOT NULL,
  `nome` varchar(60) NOT NULL,
  `cor` varchar(20) NOT NULL DEFAULT '#2563eb',
  `ativa` tinyint(1) NOT NULL DEFAULT '1',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int UNSIGNED NOT NULL,
  `email` varchar(190) NOT NULL,
  `senha_hash` varchar(255) NOT NULL,
  `nome_exibicao` varchar(120) DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `email_verificado_em` datetime DEFAULT NULL,
  `ultimo_login_em` datetime DEFAULT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `visao_preferencias_usuario`
--

CREATE TABLE `visao_preferencias_usuario` (
  `id` int UNSIGNED NOT NULL,
  `visao_id` int UNSIGNED NOT NULL,
  `usuario_id` int UNSIGNED NOT NULL,
  `posicao` bigint DEFAULT NULL,
  `oculta` tinyint(1) NOT NULL DEFAULT '0',
  `colapsada` tinyint(1) NOT NULL DEFAULT '0',
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `visoes_quadro`
--

CREATE TABLE `visoes_quadro` (
  `id` int UNSIGNED NOT NULL,
  `quadro_id` int UNSIGNED NOT NULL,
  `nome` varchar(160) NOT NULL,
  `tipo` enum('sistema','personalizada') NOT NULL DEFAULT 'personalizada',
  `chave_sistema` varchar(40) DEFAULT NULL,
  `filtro_json` json DEFAULT NULL,
  `fixa` tinyint(1) NOT NULL DEFAULT '0',
  `posicao_padrao` bigint NOT NULL DEFAULT '1000',
  `ativa` tinyint(1) NOT NULL DEFAULT '1',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `automacao_acoes`
--
ALTER TABLE `automacao_acoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_automacao_acoes_automacao` (`automacao_id`,`ordem_execucao`);

--
-- Índices de tabela `automacao_execucoes`
--
ALTER TABLE `automacao_execucoes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_automacao_execucoes` (`automacao_id`,`acao_id`,`cartao_id`),
  ADD KEY `idx_automacao_execucoes_cartao` (`cartao_id`,`executado_em`),
  ADD KEY `fk_automacao_execucoes_acao` (`acao_id`);

--
-- Índices de tabela `automacoes`
--
ALTER TABLE `automacoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_automacoes_quadro` (`quadro_id`,`ativo`,`ordem_execucao`),
  ADD KEY `idx_automacoes_lista_origem` (`lista_origem_id`),
  ADD KEY `idx_automacoes_lista_destino` (`lista_destino_id`),
  ADD KEY `idx_automacoes_campo` (`campo_id`),
  ADD KEY `fk_automacoes_criado_por` (`criado_por_usuario_id`);

--
-- Índices de tabela `campos_personalizados`
--
ALTER TABLE `campos_personalizados`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_campos_personalizados_quadro_nome` (`quadro_id`,`nome`),
  ADD KEY `idx_campos_personalizados_quadro_posicao` (`quadro_id`,`posicao`);

--
-- Índices de tabela `campo_personalizado_opcoes`
--
ALTER TABLE `campo_personalizado_opcoes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_campo_personalizado_opcoes_nome` (`campo_id`,`nome`),
  ADD KEY `idx_campo_personalizado_opcoes_posicao` (`campo_id`,`posicao`);

--
-- Índices de tabela `cartao_anexos`
--
ALTER TABLE `cartao_anexos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cartao_anexos_cartao` (`cartao_id`,`criado_em`),
  ADD KEY `idx_cartao_anexos_sha256` (`sha256`),
  ADD KEY `fk_cartao_anexos_enviado_por` (`enviado_por_usuario_id`);

--
-- Índices de tabela `cartao_atribuicoes`
--
ALTER TABLE `cartao_atribuicoes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_cartao_atribuicoes` (`cartao_id`,`usuario_id`),
  ADD KEY `idx_cartao_atribuicoes_usuario` (`usuario_id`),
  ADD KEY `idx_cartao_atribuicoes_cartao_papel` (`cartao_id`,`papel_no_cartao`),
  ADD KEY `fk_cartao_atribuicoes_atribuido_por` (`atribuido_por_usuario_id`);

--
-- Índices de tabela `cartao_campo_valores`
--
ALTER TABLE `cartao_campo_valores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_cartao_campo_valores` (`cartao_id`,`campo_id`),
  ADD KEY `idx_cartao_campo_valores_campo` (`campo_id`),
  ADD KEY `idx_cartao_campo_valores_opcao` (`valor_opcao_id`),
  ADD KEY `idx_cartao_campo_valores_usuario` (`valor_usuario_id`),
  ADD KEY `fk_cartao_campo_valores_atualizado_por` (`atualizado_por_usuario_id`);

--
-- Índices de tabela `cartao_checklists`
--
ALTER TABLE `cartao_checklists`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cartao_checklists_cartao_posicao` (`cartao_id`,`posicao`),
  ADD KEY `fk_cartao_checklists_criado_por` (`criado_por_usuario_id`);

--
-- Índices de tabela `cartao_checklist_itens`
--
ALTER TABLE `cartao_checklist_itens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cartao_checklist_itens_checklist_posicao` (`checklist_id`,`posicao`),
  ADD KEY `idx_cartao_checklist_itens_prazo` (`prazo_em`),
  ADD KEY `idx_cartao_checklist_itens_concluido` (`concluido`),
  ADD KEY `fk_cartao_checklist_itens_concluido_por` (`concluido_por_usuario_id`);

--
-- Índices de tabela `cartao_comentarios`
--
ALTER TABLE `cartao_comentarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cartao_comentarios_cartao` (`cartao_id`,`criado_em`),
  ADD KEY `idx_cartao_comentarios_usuario` (`usuario_id`);

--
-- Índices de tabela `cartao_eventos`
--
ALTER TABLE `cartao_eventos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cartao_eventos_cartao` (`cartao_id`,`criado_em`),
  ADD KEY `idx_cartao_eventos_usuario` (`usuario_id`,`criado_em`),
  ADD KEY `idx_cartao_eventos_tipo` (`tipo_evento`,`criado_em`);

--
-- Índices de tabela `cartao_relacoes`
--
ALTER TABLE `cartao_relacoes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_cartao_relacoes` (`cartao_origem_id`,`cartao_destino_id`,`tipo_relacao`),
  ADD KEY `idx_cartao_relacoes_destino` (`cartao_destino_id`),
  ADD KEY `fk_cartao_relacoes_criado_por` (`criado_por_usuario_id`);

--
-- Índices de tabela `cartao_tags`
--
ALTER TABLE `cartao_tags`
  ADD PRIMARY KEY (`cartao_id`,`tag_id`),
  ADD KEY `idx_cartao_tags_tag` (`tag_id`,`cartao_id`);

--
-- Índices de tabela `cartao_visualizacoes`
--
ALTER TABLE `cartao_visualizacoes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_cartao_visualizacoes` (`cartao_id`,`usuario_id`),
  ADD KEY `idx_cartao_visualizacoes_usuario` (`usuario_id`,`ultimo_visto_em`);

--
-- Índices de tabela `cartoes`
--
ALTER TABLE `cartoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cartoes_lista_posicao` (`lista_id`,`posicao`),
  ADD KEY `idx_cartoes_prazo` (`prazo_em`),
  ADD KEY `idx_cartoes_concluido` (`concluido_em`),
  ADD KEY `idx_cartoes_criado_por` (`criado_por_usuario_id`),
  ADD KEY `idx_cartoes_atualizado` (`atualizado_em`);
ALTER TABLE `cartoes` ADD FULLTEXT KEY `ft_cartoes_titulo_descricao` (`titulo`,`descricao`);

--
-- Índices de tabela `listas`
--
ALTER TABLE `listas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_listas_quadro_posicao` (`quadro_id`,`posicao_padrao`),
  ADD KEY `idx_listas_quadro_nome` (`quadro_id`,`nome`);

--
-- Índices de tabela `lista_permissoes_papel`
--
ALTER TABLE `lista_permissoes_papel`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_lista_permissoes_papel` (`lista_id`,`papel_id`),
  ADD KEY `idx_lista_permissoes_papel_papel` (`papel_id`);

--
-- Índices de tabela `lista_preferencias_usuario`
--
ALTER TABLE `lista_preferencias_usuario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_lista_preferencias_usuario` (`lista_id`,`usuario_id`),
  ADD KEY `idx_lista_preferencias_usuario_usuario` (`usuario_id`),
  ADD KEY `idx_lista_preferencias_usuario_posicao` (`usuario_id`,`posicao`,`lista_id`);

--
-- Índices de tabela `lista_regras_transicao`
--
ALTER TABLE `lista_regras_transicao`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_lista_regras_transicao` (`lista_origem_id`,`lista_destino_id`,`papel_id`),
  ADD KEY `idx_lista_regras_transicao_destino` (`lista_destino_id`),
  ADD KEY `idx_lista_regras_transicao_papel` (`papel_id`);

--
-- Índices de tabela `organizacao_membros`
--
ALTER TABLE `organizacao_membros`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_organizacao_membros` (`organizacao_id`,`usuario_id`),
  ADD KEY `idx_organizacao_membros_usuario` (`usuario_id`),
  ADD KEY `idx_organizacao_membros_organizacao` (`organizacao_id`);

--
-- Índices de tabela `organizacoes`
--
ALTER TABLE `organizacoes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_organizacoes_slug` (`slug`),
  ADD KEY `idx_organizacoes_criado_por` (`criado_por_usuario_id`);

--
-- Índices de tabela `quadros`
--
ALTER TABLE `quadros`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_quadros_organizacao` (`organizacao_id`),
  ADD KEY `idx_quadros_criado_por` (`criado_por_usuario_id`);

--
-- Índices de tabela `quadro_membros`
--
ALTER TABLE `quadro_membros`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_quadro_membros` (`quadro_id`,`usuario_id`),
  ADD KEY `idx_quadro_membros_usuario` (`usuario_id`);

--
-- Índices de tabela `quadro_membro_papeis`
--
ALTER TABLE `quadro_membro_papeis`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_quadro_membro_papeis` (`quadro_membro_id`,`papel_id`),
  ADD KEY `idx_quadro_membro_papeis_papel` (`papel_id`);

--
-- Índices de tabela `quadro_papeis`
--
ALTER TABLE `quadro_papeis`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_quadro_papeis_nome` (`quadro_id`,`nome`);

--
-- Índices de tabela `quadro_preferencias_usuario`
--
ALTER TABLE `quadro_preferencias_usuario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_quadro_preferencias_usuario` (`quadro_id`,`usuario_id`),
  ADD KEY `idx_quadro_preferencias_usuario_usuario` (`usuario_id`);

--
-- Índices de tabela `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_tags_quadro_nome` (`quadro_id`,`nome`),
  ADD KEY `idx_tags_quadro` (`quadro_id`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_usuarios_email` (`email`);

--
-- Índices de tabela `visao_preferencias_usuario`
--
ALTER TABLE `visao_preferencias_usuario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_visao_preferencias_usuario` (`visao_id`,`usuario_id`),
  ADD KEY `idx_visao_preferencias_usuario_usuario` (`usuario_id`);

--
-- Índices de tabela `visoes_quadro`
--
ALTER TABLE `visoes_quadro`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_visoes_quadro_quadro` (`quadro_id`),
  ADD KEY `idx_visoes_quadro_chave` (`quadro_id`,`chave_sistema`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `automacao_acoes`
--
ALTER TABLE `automacao_acoes`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `automacao_execucoes`
--
ALTER TABLE `automacao_execucoes`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `automacoes`
--
ALTER TABLE `automacoes`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `campos_personalizados`
--
ALTER TABLE `campos_personalizados`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `campo_personalizado_opcoes`
--
ALTER TABLE `campo_personalizado_opcoes`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `cartao_anexos`
--
ALTER TABLE `cartao_anexos`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `cartao_atribuicoes`
--
ALTER TABLE `cartao_atribuicoes`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `cartao_campo_valores`
--
ALTER TABLE `cartao_campo_valores`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `cartao_checklists`
--
ALTER TABLE `cartao_checklists`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `cartao_checklist_itens`
--
ALTER TABLE `cartao_checklist_itens`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `cartao_comentarios`
--
ALTER TABLE `cartao_comentarios`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `cartao_eventos`
--
ALTER TABLE `cartao_eventos`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `cartao_relacoes`
--
ALTER TABLE `cartao_relacoes`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `cartao_visualizacoes`
--
ALTER TABLE `cartao_visualizacoes`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `cartoes`
--
ALTER TABLE `cartoes`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `listas`
--
ALTER TABLE `listas`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `lista_permissoes_papel`
--
ALTER TABLE `lista_permissoes_papel`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `lista_preferencias_usuario`
--
ALTER TABLE `lista_preferencias_usuario`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `lista_regras_transicao`
--
ALTER TABLE `lista_regras_transicao`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `organizacao_membros`
--
ALTER TABLE `organizacao_membros`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `organizacoes`
--
ALTER TABLE `organizacoes`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `quadros`
--
ALTER TABLE `quadros`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `quadro_membros`
--
ALTER TABLE `quadro_membros`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `quadro_membro_papeis`
--
ALTER TABLE `quadro_membro_papeis`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `quadro_papeis`
--
ALTER TABLE `quadro_papeis`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `quadro_preferencias_usuario`
--
ALTER TABLE `quadro_preferencias_usuario`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `tags`
--
ALTER TABLE `tags`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `visao_preferencias_usuario`
--
ALTER TABLE `visao_preferencias_usuario`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `visoes_quadro`
--
ALTER TABLE `visoes_quadro`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `automacao_acoes`
--
ALTER TABLE `automacao_acoes`
  ADD CONSTRAINT `fk_automacao_acoes_automacao` FOREIGN KEY (`automacao_id`) REFERENCES `automacoes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `automacao_execucoes`
--
ALTER TABLE `automacao_execucoes`
  ADD CONSTRAINT `fk_automacao_execucoes_acao` FOREIGN KEY (`acao_id`) REFERENCES `automacao_acoes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_automacao_execucoes_automacao` FOREIGN KEY (`automacao_id`) REFERENCES `automacoes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_automacao_execucoes_cartao` FOREIGN KEY (`cartao_id`) REFERENCES `cartoes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `automacoes`
--
ALTER TABLE `automacoes`
  ADD CONSTRAINT `fk_automacoes_campo` FOREIGN KEY (`campo_id`) REFERENCES `campos_personalizados` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_automacoes_criado_por` FOREIGN KEY (`criado_por_usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_automacoes_lista_destino` FOREIGN KEY (`lista_destino_id`) REFERENCES `listas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_automacoes_lista_origem` FOREIGN KEY (`lista_origem_id`) REFERENCES `listas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_automacoes_quadro` FOREIGN KEY (`quadro_id`) REFERENCES `quadros` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `campos_personalizados`
--
ALTER TABLE `campos_personalizados`
  ADD CONSTRAINT `fk_campos_personalizados_quadro` FOREIGN KEY (`quadro_id`) REFERENCES `quadros` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `campo_personalizado_opcoes`
--
ALTER TABLE `campo_personalizado_opcoes`
  ADD CONSTRAINT `fk_campo_personalizado_opcoes_campo` FOREIGN KEY (`campo_id`) REFERENCES `campos_personalizados` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `cartao_anexos`
--
ALTER TABLE `cartao_anexos`
  ADD CONSTRAINT `fk_cartao_anexos_cartao` FOREIGN KEY (`cartao_id`) REFERENCES `cartoes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cartao_anexos_enviado_por` FOREIGN KEY (`enviado_por_usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Restrições para tabelas `cartao_atribuicoes`
--
ALTER TABLE `cartao_atribuicoes`
  ADD CONSTRAINT `fk_cartao_atribuicoes_atribuido_por` FOREIGN KEY (`atribuido_por_usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cartao_atribuicoes_cartao` FOREIGN KEY (`cartao_id`) REFERENCES `cartoes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cartao_atribuicoes_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `cartao_campo_valores`
--
ALTER TABLE `cartao_campo_valores`
  ADD CONSTRAINT `fk_cartao_campo_valores_atualizado_por` FOREIGN KEY (`atualizado_por_usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cartao_campo_valores_campo` FOREIGN KEY (`campo_id`) REFERENCES `campos_personalizados` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cartao_campo_valores_cartao` FOREIGN KEY (`cartao_id`) REFERENCES `cartoes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cartao_campo_valores_opcao` FOREIGN KEY (`valor_opcao_id`) REFERENCES `campo_personalizado_opcoes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cartao_campo_valores_usuario` FOREIGN KEY (`valor_usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Restrições para tabelas `cartao_checklists`
--
ALTER TABLE `cartao_checklists`
  ADD CONSTRAINT `fk_cartao_checklists_cartao` FOREIGN KEY (`cartao_id`) REFERENCES `cartoes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cartao_checklists_criado_por` FOREIGN KEY (`criado_por_usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Restrições para tabelas `cartao_checklist_itens`
--
ALTER TABLE `cartao_checklist_itens`
  ADD CONSTRAINT `fk_cartao_checklist_itens_checklist` FOREIGN KEY (`checklist_id`) REFERENCES `cartao_checklists` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cartao_checklist_itens_concluido_por` FOREIGN KEY (`concluido_por_usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Restrições para tabelas `cartao_comentarios`
--
ALTER TABLE `cartao_comentarios`
  ADD CONSTRAINT `fk_cartao_comentarios_cartao` FOREIGN KEY (`cartao_id`) REFERENCES `cartoes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cartao_comentarios_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `cartao_eventos`
--
ALTER TABLE `cartao_eventos`
  ADD CONSTRAINT `fk_cartao_eventos_cartao` FOREIGN KEY (`cartao_id`) REFERENCES `cartoes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cartao_eventos_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Restrições para tabelas `cartao_relacoes`
--
ALTER TABLE `cartao_relacoes`
  ADD CONSTRAINT `fk_cartao_relacoes_criado_por` FOREIGN KEY (`criado_por_usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cartao_relacoes_destino` FOREIGN KEY (`cartao_destino_id`) REFERENCES `cartoes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cartao_relacoes_origem` FOREIGN KEY (`cartao_origem_id`) REFERENCES `cartoes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `cartao_tags`
--
ALTER TABLE `cartao_tags`
  ADD CONSTRAINT `fk_cartao_tags_cartao` FOREIGN KEY (`cartao_id`) REFERENCES `cartoes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cartao_tags_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `cartao_visualizacoes`
--
ALTER TABLE `cartao_visualizacoes`
  ADD CONSTRAINT `fk_cartao_visualizacoes_cartao` FOREIGN KEY (`cartao_id`) REFERENCES `cartoes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cartao_visualizacoes_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `cartoes`
--
ALTER TABLE `cartoes`
  ADD CONSTRAINT `fk_cartoes_criado_por` FOREIGN KEY (`criado_por_usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cartoes_lista` FOREIGN KEY (`lista_id`) REFERENCES `listas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `listas`
--
ALTER TABLE `listas`
  ADD CONSTRAINT `fk_listas_quadro` FOREIGN KEY (`quadro_id`) REFERENCES `quadros` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `lista_permissoes_papel`
--
ALTER TABLE `lista_permissoes_papel`
  ADD CONSTRAINT `fk_lista_permissoes_papel_lista` FOREIGN KEY (`lista_id`) REFERENCES `listas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_lista_permissoes_papel_papel` FOREIGN KEY (`papel_id`) REFERENCES `quadro_papeis` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `lista_preferencias_usuario`
--
ALTER TABLE `lista_preferencias_usuario`
  ADD CONSTRAINT `fk_lista_preferencias_usuario_lista` FOREIGN KEY (`lista_id`) REFERENCES `listas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_lista_preferencias_usuario_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `lista_regras_transicao`
--
ALTER TABLE `lista_regras_transicao`
  ADD CONSTRAINT `fk_lista_regras_transicao_destino` FOREIGN KEY (`lista_destino_id`) REFERENCES `listas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_lista_regras_transicao_origem` FOREIGN KEY (`lista_origem_id`) REFERENCES `listas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_lista_regras_transicao_papel` FOREIGN KEY (`papel_id`) REFERENCES `quadro_papeis` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `organizacao_membros`
--
ALTER TABLE `organizacao_membros`
  ADD CONSTRAINT `fk_organizacao_membros_organizacao` FOREIGN KEY (`organizacao_id`) REFERENCES `organizacoes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_organizacao_membros_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `organizacoes`
--
ALTER TABLE `organizacoes`
  ADD CONSTRAINT `fk_organizacoes_criado_por` FOREIGN KEY (`criado_por_usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Restrições para tabelas `quadros`
--
ALTER TABLE `quadros`
  ADD CONSTRAINT `fk_quadros_criado_por` FOREIGN KEY (`criado_por_usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_quadros_organizacao` FOREIGN KEY (`organizacao_id`) REFERENCES `organizacoes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `quadro_membros`
--
ALTER TABLE `quadro_membros`
  ADD CONSTRAINT `fk_quadro_membros_quadro` FOREIGN KEY (`quadro_id`) REFERENCES `quadros` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_quadro_membros_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `quadro_membro_papeis`
--
ALTER TABLE `quadro_membro_papeis`
  ADD CONSTRAINT `fk_quadro_membro_papeis_membro` FOREIGN KEY (`quadro_membro_id`) REFERENCES `quadro_membros` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_quadro_membro_papeis_papel` FOREIGN KEY (`papel_id`) REFERENCES `quadro_papeis` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `quadro_papeis`
--
ALTER TABLE `quadro_papeis`
  ADD CONSTRAINT `fk_quadro_papeis_quadro` FOREIGN KEY (`quadro_id`) REFERENCES `quadros` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `quadro_preferencias_usuario`
--
ALTER TABLE `quadro_preferencias_usuario`
  ADD CONSTRAINT `fk_quadro_preferencias_usuario_quadro` FOREIGN KEY (`quadro_id`) REFERENCES `quadros` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_quadro_preferencias_usuario_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `tags`
--
ALTER TABLE `tags`
  ADD CONSTRAINT `fk_tags_quadro` FOREIGN KEY (`quadro_id`) REFERENCES `quadros` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `visao_preferencias_usuario`
--
ALTER TABLE `visao_preferencias_usuario`
  ADD CONSTRAINT `fk_visao_preferencias_usuario_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_visao_preferencias_usuario_visao` FOREIGN KEY (`visao_id`) REFERENCES `visoes_quadro` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `visoes_quadro`
--
ALTER TABLE `visoes_quadro`
  ADD CONSTRAINT `fk_visoes_quadro_quadro` FOREIGN KEY (`quadro_id`) REFERENCES `quadros` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
