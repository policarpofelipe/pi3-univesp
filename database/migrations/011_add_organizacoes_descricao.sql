-- Adiciona descrição opcional às organizações (formulário já coletava; persistência faltava).
ALTER TABLE organizacoes
  ADD COLUMN descricao TEXT NULL
  AFTER slug;
