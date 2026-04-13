SET NAMES utf8mb4;
SET time_zone = '-03:00';

-- =========================================================
-- USUÁRIOS
-- =========================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id                  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email               VARCHAR(190) NOT NULL,
  senha_hash          VARCHAR(255) NOT NULL,
  nome_exibicao       VARCHAR(120) NULL,
  ativo               TINYINT(1) NOT NULL DEFAULT 1,
  email_verificado_em DATETIME NULL,
  ultimo_login_em     DATETIME NULL,
  criado_em           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- ORGANIZAÇÕES
-- =========================================================
CREATE TABLE IF NOT EXISTS organizacoes (
  id                    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome                  VARCHAR(160) NOT NULL,
  slug                  VARCHAR(160) NOT NULL,
  descricao             TEXT NULL,
  criado_por_usuario_id INT UNSIGNED NULL,
  ativo                 TINYINT(1) NOT NULL DEFAULT 1,
  criado_em             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_organizacoes_slug (slug),
  KEY idx_organizacoes_criado_por (criado_por_usuario_id),
  CONSTRAINT fk_organizacoes_criado_por
    FOREIGN KEY (criado_por_usuario_id) REFERENCES usuarios(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- MEMBROS DA ORGANIZAÇÃO
-- =========================================================
CREATE TABLE IF NOT EXISTS organizacao_membros (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  organizacao_id  INT UNSIGNED NOT NULL,
  usuario_id      INT UNSIGNED NOT NULL,
  papel           ENUM('dono','admin','membro','leitor') NOT NULL DEFAULT 'membro',
  status          ENUM('ativo','convidado','suspenso') NOT NULL DEFAULT 'ativo',
  criado_em       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_organizacao_membros (organizacao_id, usuario_id),
  KEY idx_organizacao_membros_usuario (usuario_id),
  KEY idx_organizacao_membros_organizacao (organizacao_id),
  CONSTRAINT fk_organizacao_membros_organizacao
    FOREIGN KEY (organizacao_id) REFERENCES organizacoes(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_organizacao_membros_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- QUADROS
-- =========================================================
CREATE TABLE IF NOT EXISTS quadros (
  id                    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  organizacao_id        INT UNSIGNED NOT NULL,
  nome                  VARCHAR(160) NOT NULL,
  descricao             TEXT NULL,
  criado_por_usuario_id INT UNSIGNED NULL,
  arquivado_em          DATETIME NULL,
  criado_em             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_quadros_organizacao (organizacao_id),
  KEY idx_quadros_criado_por (criado_por_usuario_id),
  CONSTRAINT fk_quadros_organizacao
    FOREIGN KEY (organizacao_id) REFERENCES organizacoes(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_quadros_criado_por
    FOREIGN KEY (criado_por_usuario_id) REFERENCES usuarios(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- MEMBROS DO QUADRO
-- Observação: a aplicação deve garantir que o usuário já pertença à organização do quadro.
-- =========================================================
CREATE TABLE IF NOT EXISTS quadro_membros (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  quadro_id    INT UNSIGNED NOT NULL,
  usuario_id   INT UNSIGNED NOT NULL,
  status       ENUM('ativo','convidado','suspenso') NOT NULL DEFAULT 'ativo',
  criado_em    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_quadro_membros (quadro_id, usuario_id),
  KEY idx_quadro_membros_usuario (usuario_id),
  CONSTRAINT fk_quadro_membros_quadro
    FOREIGN KEY (quadro_id) REFERENCES quadros(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_quadro_membros_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- PAPÉIS DO QUADRO
-- Ex.: Comercial, Produção, Financeiro, Estudos, Atendimento
-- =========================================================
CREATE TABLE IF NOT EXISTS quadro_papeis (
  id                       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  quadro_id                INT UNSIGNED NOT NULL,
  nome                     VARCHAR(100) NOT NULL,
  descricao                VARCHAR(255) NULL,
  pode_gerenciar_quadro    TINYINT(1) NOT NULL DEFAULT 0,
  pode_gerenciar_listas    TINYINT(1) NOT NULL DEFAULT 0,
  pode_gerenciar_automacoes TINYINT(1) NOT NULL DEFAULT 0,
  pode_gerenciar_campos    TINYINT(1) NOT NULL DEFAULT 0,
  pode_convidar_membros    TINYINT(1) NOT NULL DEFAULT 0,
  pode_criar_cartao        TINYINT(1) NOT NULL DEFAULT 1,
  ativo                    TINYINT(1) NOT NULL DEFAULT 1,
  criado_em                DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_quadro_papeis_nome (quadro_id, nome),
  CONSTRAINT fk_quadro_papeis_quadro
    FOREIGN KEY (quadro_id) REFERENCES quadros(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- PAPÉIS ATRIBUÍDOS A MEMBROS DO QUADRO
-- Um usuário pode ter mais de um papel dentro do mesmo quadro.
-- =========================================================
CREATE TABLE IF NOT EXISTS quadro_membro_papeis (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  quadro_membro_id  INT UNSIGNED NOT NULL,
  papel_id          INT UNSIGNED NOT NULL,
  criado_em         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_quadro_membro_papeis (quadro_membro_id, papel_id),
  KEY idx_quadro_membro_papeis_papel (papel_id),
  CONSTRAINT fk_quadro_membro_papeis_membro
    FOREIGN KEY (quadro_membro_id) REFERENCES quadro_membros(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_quadro_membro_papeis_papel
    FOREIGN KEY (papel_id) REFERENCES quadro_papeis(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- PREFERÊNCIAS VISUAIS DO QUADRO POR USUÁRIO
-- =========================================================
CREATE TABLE IF NOT EXISTS quadro_preferencias_usuario (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  quadro_id     INT UNSIGNED NOT NULL,
  usuario_id    INT UNSIGNED NOT NULL,
  tema          ENUM('claro','escuro','sistema') NOT NULL DEFAULT 'sistema',
  cor_fundo     VARCHAR(20) NULL,
  compacto      TINYINT(1) NOT NULL DEFAULT 0,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_quadro_preferencias_usuario (quadro_id, usuario_id),
  KEY idx_quadro_preferencias_usuario_usuario (usuario_id),
  CONSTRAINT fk_quadro_preferencias_usuario_quadro
    FOREIGN KEY (quadro_id) REFERENCES quadros(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_quadro_preferencias_usuario_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- LISTAS / ETAPAS DO FLUXO
-- usa_controle_acesso = 0  => todos os membros ativos do quadro podem ver/editar/enviar
-- usa_regras_transicao = 0 => transições livres a partir dessa lista
-- =========================================================
CREATE TABLE IF NOT EXISTS listas (
  id                    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  quadro_id             INT UNSIGNED NOT NULL,
  nome                  VARCHAR(160) NOT NULL,
  descricao             VARCHAR(255) NULL,
  cor                   VARCHAR(20) NULL,
  natureza              ENUM('fixa','personalizada') NOT NULL DEFAULT 'personalizada',
  posicao_padrao        BIGINT NOT NULL DEFAULT 1000,
  usa_controle_acesso   TINYINT(1) NOT NULL DEFAULT 0,
  usa_regras_transicao  TINYINT(1) NOT NULL DEFAULT 0,
  limite_wip            INT UNSIGNED NULL,
  ativa                 TINYINT(1) NOT NULL DEFAULT 1,
  criada_em             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizada_em         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_listas_quadro_posicao (quadro_id, posicao_padrao),
  KEY idx_listas_quadro_nome (quadro_id, nome),
  CONSTRAINT fk_listas_quadro
    FOREIGN KEY (quadro_id) REFERENCES quadros(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- PREFERÊNCIAS DE LISTA POR USUÁRIO
-- posicao NULL => herda posicao_padrao da lista
-- =========================================================
CREATE TABLE IF NOT EXISTS lista_preferencias_usuario (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  lista_id      INT UNSIGNED NOT NULL,
  usuario_id    INT UNSIGNED NOT NULL,
  posicao       BIGINT NULL,
  oculta        TINYINT(1) NOT NULL DEFAULT 0,
  colapsada     TINYINT(1) NOT NULL DEFAULT 0,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_lista_preferencias_usuario (lista_id, usuario_id),
  KEY idx_lista_preferencias_usuario_usuario (usuario_id),
  KEY idx_lista_preferencias_usuario_posicao (usuario_id, posicao, lista_id),
  CONSTRAINT fk_lista_preferencias_usuario_lista
    FOREIGN KEY (lista_id) REFERENCES listas(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_lista_preferencias_usuario_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- PERMISSÕES DE LISTA POR PAPEL
-- permite cenários como:
-- ver=0, editar=0, enviar_para=1  => pode mandar cartão para a lista sem vê-la
-- =========================================================
CREATE TABLE IF NOT EXISTS lista_permissoes_papel (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  lista_id       INT UNSIGNED NOT NULL,
  papel_id       INT UNSIGNED NOT NULL,
  pode_ver       TINYINT(1) NOT NULL DEFAULT 1,
  pode_editar    TINYINT(1) NOT NULL DEFAULT 1,
  pode_enviar_para TINYINT(1) NOT NULL DEFAULT 1,
  criado_em      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_lista_permissoes_papel (lista_id, papel_id),
  KEY idx_lista_permissoes_papel_papel (papel_id),
  CONSTRAINT fk_lista_permissoes_papel_lista
    FOREIGN KEY (lista_id) REFERENCES listas(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_lista_permissoes_papel_papel
    FOREIGN KEY (papel_id) REFERENCES quadro_papeis(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- REGRAS DE TRANSIÇÃO ENTRE LISTAS
-- Se usa_regras_transicao = 1 na lista_origem, somente estas transições são válidas.
-- papel_id NULL => regra vale para todos os papéis do quadro.
-- =========================================================
CREATE TABLE IF NOT EXISTS lista_regras_transicao (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  lista_origem_id  INT UNSIGNED NOT NULL,
  lista_destino_id INT UNSIGNED NOT NULL,
  papel_id         INT UNSIGNED NULL,
  criado_em        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_lista_regras_transicao (lista_origem_id, lista_destino_id, papel_id),
  KEY idx_lista_regras_transicao_destino (lista_destino_id),
  KEY idx_lista_regras_transicao_papel (papel_id),
  CONSTRAINT fk_lista_regras_transicao_origem
    FOREIGN KEY (lista_origem_id) REFERENCES listas(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_lista_regras_transicao_destino
    FOREIGN KEY (lista_destino_id) REFERENCES listas(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_lista_regras_transicao_papel
    FOREIGN KEY (papel_id) REFERENCES quadro_papeis(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- VISÕES DO QUADRO
-- Exemplos de chave_sistema:
-- MINHAS_DEMANDAS, ATRASADOS, SEM_ATRIBUICAO, ARQUIVADOS
-- =========================================================
CREATE TABLE IF NOT EXISTS visoes_quadro (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  quadro_id       INT UNSIGNED NOT NULL,
  nome            VARCHAR(160) NOT NULL,
  tipo            ENUM('sistema','personalizada') NOT NULL DEFAULT 'personalizada',
  chave_sistema   VARCHAR(40) NULL,
  filtro_json     JSON NULL,
  fixa            TINYINT(1) NOT NULL DEFAULT 0,
  posicao_padrao  BIGINT NOT NULL DEFAULT 1000,
  ativa           TINYINT(1) NOT NULL DEFAULT 1,
  criado_em       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_visoes_quadro_quadro (quadro_id),
  KEY idx_visoes_quadro_chave (quadro_id, chave_sistema),
  CONSTRAINT fk_visoes_quadro_quadro
    FOREIGN KEY (quadro_id) REFERENCES quadros(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS visao_preferencias_usuario (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  visao_id      INT UNSIGNED NOT NULL,
  usuario_id    INT UNSIGNED NOT NULL,
  posicao       BIGINT NULL,
  oculta        TINYINT(1) NOT NULL DEFAULT 0,
  colapsada     TINYINT(1) NOT NULL DEFAULT 0,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_visao_preferencias_usuario (visao_id, usuario_id),
  KEY idx_visao_preferencias_usuario_usuario (usuario_id),
  CONSTRAINT fk_visao_preferencias_usuario_visao
    FOREIGN KEY (visao_id) REFERENCES visoes_quadro(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_visao_preferencias_usuario_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- TAGS / ETIQUETAS POR QUADRO
-- =========================================================
CREATE TABLE IF NOT EXISTS tags (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  quadro_id     INT UNSIGNED NOT NULL,
  nome          VARCHAR(60) NOT NULL,
  cor           VARCHAR(20) NOT NULL DEFAULT '#2563eb',
  ativa         TINYINT(1) NOT NULL DEFAULT 1,
  criado_em     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tags_quadro_nome (quadro_id, nome),
  KEY idx_tags_quadro (quadro_id),
  CONSTRAINT fk_tags_quadro
    FOREIGN KEY (quadro_id) REFERENCES quadros(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- CAMPOS PERSONALIZADOS POR QUADRO
-- Para manter o sistema genérico e não amarrado a CRM, estudos, pedidos etc.
-- =========================================================
CREATE TABLE IF NOT EXISTS campos_personalizados (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  quadro_id       INT UNSIGNED NOT NULL,
  nome            VARCHAR(120) NOT NULL,
  tipo            ENUM('texto_curto','texto_longo','numero','data','data_hora','booleano','selecao','usuario') NOT NULL,
  descricao       VARCHAR(255) NULL,
  obrigatorio     TINYINT(1) NOT NULL DEFAULT 0,
  posicao         BIGINT NOT NULL DEFAULT 1000,
  config_json     JSON NULL,
  ativo           TINYINT(1) NOT NULL DEFAULT 1,
  criado_em       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_campos_personalizados_quadro_nome (quadro_id, nome),
  KEY idx_campos_personalizados_quadro_posicao (quadro_id, posicao),
  CONSTRAINT fk_campos_personalizados_quadro
    FOREIGN KEY (quadro_id) REFERENCES quadros(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS campo_personalizado_opcoes (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  campo_id      INT UNSIGNED NOT NULL,
  nome          VARCHAR(100) NOT NULL,
  valor         VARCHAR(100) NULL,
  cor           VARCHAR(20) NULL,
  posicao       BIGINT NOT NULL DEFAULT 1000,
  ativa         TINYINT(1) NOT NULL DEFAULT 1,
  criado_em     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_campo_personalizado_opcoes_nome (campo_id, nome),
  KEY idx_campo_personalizado_opcoes_posicao (campo_id, posicao),
  CONSTRAINT fk_campo_personalizado_opcoes_campo
    FOREIGN KEY (campo_id) REFERENCES campos_personalizados(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- CARTÕES / DEMANDAS
-- Um cartão pertence a uma única lista e, por consequência, a um único quadro.
-- =========================================================
CREATE TABLE IF NOT EXISTS cartoes (
  id                    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  lista_id              INT UNSIGNED NOT NULL,
  titulo                VARCHAR(220) NOT NULL,
  descricao             LONGTEXT NULL,
  prioridade            ENUM('baixa','media','alta','urgente') NOT NULL DEFAULT 'media',
  posicao               BIGINT NOT NULL DEFAULT 1000,
  prazo_em              DATETIME NULL,
  concluido_em          DATETIME NULL,
  criado_por_usuario_id INT UNSIGNED NULL,
  arquivado_em          DATETIME NULL,
  criado_em             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_cartoes_lista_posicao (lista_id, posicao),
  KEY idx_cartoes_prazo (prazo_em),
  KEY idx_cartoes_concluido (concluido_em),
  KEY idx_cartoes_criado_por (criado_por_usuario_id),
  KEY idx_cartoes_atualizado (atualizado_em),
  FULLTEXT KEY ft_cartoes_titulo_descricao (titulo, descricao),
  CONSTRAINT fk_cartoes_lista
    FOREIGN KEY (lista_id) REFERENCES listas(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_cartoes_criado_por
    FOREIGN KEY (criado_por_usuario_id) REFERENCES usuarios(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- ATRIBUIÇÕES N:N
-- papel_no_cartao: responsável ou participante
-- =========================================================
CREATE TABLE IF NOT EXISTS cartao_atribuicoes (
  id                       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  cartao_id                INT UNSIGNED NOT NULL,
  usuario_id               INT UNSIGNED NOT NULL,
  papel_no_cartao          ENUM('responsavel','participante') NOT NULL DEFAULT 'participante',
  atribuido_por_usuario_id INT UNSIGNED NULL,
  criado_em                DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cartao_atribuicoes (cartao_id, usuario_id),
  KEY idx_cartao_atribuicoes_usuario (usuario_id),
  KEY idx_cartao_atribuicoes_cartao_papel (cartao_id, papel_no_cartao),
  CONSTRAINT fk_cartao_atribuicoes_cartao
    FOREIGN KEY (cartao_id) REFERENCES cartoes(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_cartao_atribuicoes_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_cartao_atribuicoes_atribuido_por
    FOREIGN KEY (atribuido_por_usuario_id) REFERENCES usuarios(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- TAGS EM CARTÕES
-- =========================================================
CREATE TABLE IF NOT EXISTS cartao_tags (
  cartao_id   INT UNSIGNED NOT NULL,
  tag_id      INT UNSIGNED NOT NULL,
  criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (cartao_id, tag_id),
  KEY idx_cartao_tags_tag (tag_id, cartao_id),
  CONSTRAINT fk_cartao_tags_cartao
    FOREIGN KEY (cartao_id) REFERENCES cartoes(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_cartao_tags_tag
    FOREIGN KEY (tag_id) REFERENCES tags(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- VALORES DOS CAMPOS PERSONALIZADOS
-- Um cartão tem no máximo um valor por campo.
-- =========================================================
CREATE TABLE IF NOT EXISTS cartao_campo_valores (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  cartao_id          INT UNSIGNED NOT NULL,
  campo_id           INT UNSIGNED NOT NULL,
  valor_texto        LONGTEXT NULL,
  valor_numero       DECIMAL(18,4) NULL,
  valor_data         DATE NULL,
  valor_data_hora    DATETIME NULL,
  valor_booleano     TINYINT(1) NULL,
  valor_opcao_id     INT UNSIGNED NULL,
  valor_usuario_id   INT UNSIGNED NULL,
  valor_json         JSON NULL,
  atualizado_por_usuario_id INT UNSIGNED NULL,
  criado_em          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cartao_campo_valores (cartao_id, campo_id),
  KEY idx_cartao_campo_valores_campo (campo_id),
  KEY idx_cartao_campo_valores_opcao (valor_opcao_id),
  KEY idx_cartao_campo_valores_usuario (valor_usuario_id),
  CONSTRAINT fk_cartao_campo_valores_cartao
    FOREIGN KEY (cartao_id) REFERENCES cartoes(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_cartao_campo_valores_campo
    FOREIGN KEY (campo_id) REFERENCES campos_personalizados(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_cartao_campo_valores_opcao
    FOREIGN KEY (valor_opcao_id) REFERENCES campo_personalizado_opcoes(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_cartao_campo_valores_usuario
    FOREIGN KEY (valor_usuario_id) REFERENCES usuarios(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_cartao_campo_valores_atualizado_por
    FOREIGN KEY (atualizado_por_usuario_id) REFERENCES usuarios(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- COMENTÁRIOS
-- =========================================================
CREATE TABLE IF NOT EXISTS cartao_comentarios (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  cartao_id     INT UNSIGNED NOT NULL,
  usuario_id    INT UNSIGNED NOT NULL,
  texto         TEXT NOT NULL,
  criado_em     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  editado_em    DATETIME NULL,
  removido_em   DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_cartao_comentarios_cartao (cartao_id, criado_em),
  KEY idx_cartao_comentarios_usuario (usuario_id),
  CONSTRAINT fk_cartao_comentarios_cartao
    FOREIGN KEY (cartao_id) REFERENCES cartoes(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_cartao_comentarios_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- CHECKLISTS
-- =========================================================
CREATE TABLE IF NOT EXISTS cartao_checklists (
  id                    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  cartao_id             INT UNSIGNED NOT NULL,
  titulo                VARCHAR(200) NOT NULL,
  posicao               BIGINT NOT NULL DEFAULT 1000,
  criado_por_usuario_id INT UNSIGNED NULL,
  criado_em             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  removido_em           DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_cartao_checklists_cartao_posicao (cartao_id, posicao),
  CONSTRAINT fk_cartao_checklists_cartao
    FOREIGN KEY (cartao_id) REFERENCES cartoes(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_cartao_checklists_criado_por
    FOREIGN KEY (criado_por_usuario_id) REFERENCES usuarios(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS cartao_checklist_itens (
  id                        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  checklist_id              INT UNSIGNED NOT NULL,
  titulo                    VARCHAR(240) NOT NULL,
  posicao                   BIGINT NOT NULL DEFAULT 1000,
  prazo_em                  DATETIME NULL,
  concluido                 TINYINT(1) NOT NULL DEFAULT 0,
  concluido_em              DATETIME NULL,
  concluido_por_usuario_id  INT UNSIGNED NULL,
  criado_em                 DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  removido_em               DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_cartao_checklist_itens_checklist_posicao (checklist_id, posicao),
  KEY idx_cartao_checklist_itens_prazo (prazo_em),
  KEY idx_cartao_checklist_itens_concluido (concluido),
  CONSTRAINT fk_cartao_checklist_itens_checklist
    FOREIGN KEY (checklist_id) REFERENCES cartao_checklists(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_cartao_checklist_itens_concluido_por
    FOREIGN KEY (concluido_por_usuario_id) REFERENCES usuarios(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- ANEXOS
-- O arquivo fica no servidor; o banco guarda caminho e metadados.
-- =========================================================
CREATE TABLE IF NOT EXISTS cartao_anexos (
  id                      INT UNSIGNED NOT NULL AUTO_INCREMENT,
  cartao_id               INT UNSIGNED NOT NULL,
  enviado_por_usuario_id  INT UNSIGNED NULL,
  nome_original           VARCHAR(255) NOT NULL,
  mime_type               VARCHAR(80) NULL,
  tamanho_bytes           BIGINT UNSIGNED NULL,
  caminho_arquivo         VARCHAR(500) NOT NULL,
  sha256                  CHAR(64) NULL,
  criado_em               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  removido_em             DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_cartao_anexos_cartao (cartao_id, criado_em),
  KEY idx_cartao_anexos_sha256 (sha256),
  CONSTRAINT fk_cartao_anexos_cartao
    FOREIGN KEY (cartao_id) REFERENCES cartoes(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_cartao_anexos_enviado_por
    FOREIGN KEY (enviado_por_usuario_id) REFERENCES usuarios(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- VISUALIZAÇÕES / ABERTURAS
-- Mantém último visto e quantidade, sem poluir o histórico de eventos.
-- =========================================================
CREATE TABLE IF NOT EXISTS cartao_visualizacoes (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  cartao_id       INT UNSIGNED NOT NULL,
  usuario_id      INT UNSIGNED NOT NULL,
  ultimo_visto_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  vistas_total    INT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cartao_visualizacoes (cartao_id, usuario_id),
  KEY idx_cartao_visualizacoes_usuario (usuario_id, ultimo_visto_em),
  CONSTRAINT fk_cartao_visualizacoes_cartao
    FOREIGN KEY (cartao_id) REFERENCES cartoes(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_cartao_visualizacoes_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- EVENTOS / HISTÓRICO
-- =========================================================
CREATE TABLE IF NOT EXISTS cartao_eventos (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  cartao_id     INT UNSIGNED NOT NULL,
  usuario_id    INT UNSIGNED NULL,
  tipo_evento   ENUM(
    'CRIADO',
    'MOVIDO_LISTA',
    'EDITADO_TITULO',
    'EDITADO_DESCRICAO',
    'PRAZO_ALTERADO',
    'PRIORIDADE_ALTERADA',
    'ATRIBUIDO',
    'DESATRIBUIDO',
    'TAG_ADICIONADA',
    'TAG_REMOVIDA',
    'CAMPO_ALTERADO',
    'CHECKLIST_CRIADA',
    'CHECKLIST_ITEM_CRIADO',
    'CHECKLIST_ITEM_CONCLUIDO',
    'CHECKLIST_ITEM_REABERTO',
    'ANEXO_ADICIONADO',
    'ANEXO_REMOVIDO',
    'COMENTARIO_ADICIONADO',
    'COMENTARIO_EDITADO',
    'COMENTARIO_REMOVIDO',
    'ARQUIVADO',
    'DESARQUIVADO',
    'AUTOMACAO_EXECUTADA',
    'RELACAO_CRIADA'
  ) NOT NULL,
  dados_json    JSON NULL,
  criado_em     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_cartao_eventos_cartao (cartao_id, criado_em),
  KEY idx_cartao_eventos_usuario (usuario_id, criado_em),
  KEY idx_cartao_eventos_tipo (tipo_evento, criado_em),
  CONSTRAINT fk_cartao_eventos_cartao
    FOREIGN KEY (cartao_id) REFERENCES cartoes(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_cartao_eventos_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- RELAÇÕES ENTRE CARTÕES
-- Usado para handoff entre quadros: um cartão origina outro.
-- =========================================================
CREATE TABLE IF NOT EXISTS cartao_relacoes (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  cartao_origem_id   INT UNSIGNED NOT NULL,
  cartao_destino_id  INT UNSIGNED NOT NULL,
  tipo_relacao       ENUM('ORIGINOU','DEPENDE_DE','BLOQUEIA','DUPLICADO_DE','RELACIONADO_A') NOT NULL DEFAULT 'RELACIONADO_A',
  criado_por_usuario_id INT UNSIGNED NULL,
  criado_em          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cartao_relacoes (cartao_origem_id, cartao_destino_id, tipo_relacao),
  KEY idx_cartao_relacoes_destino (cartao_destino_id),
  CONSTRAINT fk_cartao_relacoes_origem
    FOREIGN KEY (cartao_origem_id) REFERENCES cartoes(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_cartao_relacoes_destino
    FOREIGN KEY (cartao_destino_id) REFERENCES cartoes(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_cartao_relacoes_criado_por
    FOREIGN KEY (criado_por_usuario_id) REFERENCES usuarios(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- AUTOMAÇÕES
-- executa_uma_vez_por_cartao = 1 => automação idempotente por cartão
-- =========================================================
CREATE TABLE IF NOT EXISTS automacoes (
  id                       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  quadro_id                INT UNSIGNED NOT NULL,
  nome                     VARCHAR(160) NOT NULL,
  descricao                VARCHAR(255) NULL,
  gatilho                  ENUM('AO_CRIAR_CARTAO','AO_ENTRAR_NA_LISTA','AO_SAIR_DA_LISTA','AO_ATUALIZAR_CAMPO','AO_VENCER_PRAZO') NOT NULL,
  lista_origem_id          INT UNSIGNED NULL,
  lista_destino_id         INT UNSIGNED NULL,
  campo_id                 INT UNSIGNED NULL,
  condicoes_json           JSON NULL,
  executa_uma_vez_por_cartao TINYINT(1) NOT NULL DEFAULT 1,
  ordem_execucao           INT UNSIGNED NOT NULL DEFAULT 1,
  ativo                    TINYINT(1) NOT NULL DEFAULT 1,
  criado_por_usuario_id    INT UNSIGNED NULL,
  criado_em                DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_automacoes_quadro (quadro_id, ativo, ordem_execucao),
  KEY idx_automacoes_lista_origem (lista_origem_id),
  KEY idx_automacoes_lista_destino (lista_destino_id),
  KEY idx_automacoes_campo (campo_id),
  CONSTRAINT fk_automacoes_quadro
    FOREIGN KEY (quadro_id) REFERENCES quadros(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_automacoes_lista_origem
    FOREIGN KEY (lista_origem_id) REFERENCES listas(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_automacoes_lista_destino
    FOREIGN KEY (lista_destino_id) REFERENCES listas(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_automacoes_campo
    FOREIGN KEY (campo_id) REFERENCES campos_personalizados(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_automacoes_criado_por
    FOREIGN KEY (criado_por_usuario_id) REFERENCES usuarios(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- AÇÕES DAS AUTOMAÇÕES
-- A ação CRIAR_CARTAO_RELACIONADO é a base para handoff entre quadros.
-- config_json pode conter, por exemplo:
-- {
--   "quadro_destino_id": 7,
--   "lista_destino_id": 31,
--   "tipo_relacao": "ORIGINOU",
--   "copiar_titulo": true,
--   "copiar_descricao": true,
--   "copiar_tags": true,
--   "copiar_checklists": false,
--   "copiar_anexos": false,
--   "copiar_atribuicoes": false,
--   "copiar_campos_ids": [1,2,5]
-- }
-- =========================================================
CREATE TABLE IF NOT EXISTS automacao_acoes (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  automacao_id    INT UNSIGNED NOT NULL,
  ordem_execucao  INT UNSIGNED NOT NULL DEFAULT 1,
  tipo_acao       ENUM(
    'CRIAR_CARTAO_RELACIONADO',
    'MOVER_CARTAO',
    'ATRIBUIR_USUARIO',
    'ADICIONAR_TAG',
    'REMOVER_TAG',
    'PREENCHER_CAMPO',
    'ARQUIVAR_CARTAO',
    'DESARQUIVAR_CARTAO'
  ) NOT NULL,
  config_json     JSON NULL,
  ativo           TINYINT(1) NOT NULL DEFAULT 1,
  criado_em       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_automacao_acoes_automacao (automacao_id, ordem_execucao),
  CONSTRAINT fk_automacao_acoes_automacao
    FOREIGN KEY (automacao_id) REFERENCES automacoes(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- EXECUÇÕES DE AUTOMAÇÃO
-- Garante idempotência por cartão+automação+ação.
-- =========================================================
CREATE TABLE IF NOT EXISTS automacao_execucoes (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  automacao_id      INT UNSIGNED NOT NULL,
  acao_id           INT UNSIGNED NOT NULL,
  cartao_id         INT UNSIGNED NOT NULL,
  status_execucao   ENUM('sucesso','erro') NOT NULL DEFAULT 'sucesso',
  resultado_json    JSON NULL,
  executado_em      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_automacao_execucoes (automacao_id, acao_id, cartao_id),
  KEY idx_automacao_execucoes_cartao (cartao_id, executado_em),
  CONSTRAINT fk_automacao_execucoes_automacao
    FOREIGN KEY (automacao_id) REFERENCES automacoes(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_automacao_execucoes_acao
    FOREIGN KEY (acao_id) REFERENCES automacao_acoes(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_automacao_execucoes_cartao
    FOREIGN KEY (cartao_id) REFERENCES cartoes(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
