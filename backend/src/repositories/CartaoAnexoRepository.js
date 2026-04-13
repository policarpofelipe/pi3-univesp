const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

class CartaoAnexoRepository {
  async listar(cartaoId) {
    const [rows] = await db.query(
      `
      SELECT
        id,
        cartao_id AS cartaoId,
        nome_original AS nomeArquivo,
        mime_type AS tipoMime,
        tamanho_bytes AS tamanhoBytes,
        caminho_arquivo AS caminhoArquivo,
        criado_em AS criadoEm
      FROM cartao_anexos
      WHERE cartao_id = ?
        AND removido_em IS NULL
      ORDER BY criado_em ASC
      `,
      [cartaoId]
    );
    return rows;
  }

  async obterPorId(cartaoId, anexoId) {
    const [rows] = await db.query(
      `
      SELECT
        id,
        cartao_id AS cartaoId,
        nome_original AS nomeArquivo,
        mime_type AS tipoMime,
        tamanho_bytes AS tamanhoBytes,
        caminho_arquivo AS caminhoArquivo,
        criado_em AS criadoEm
      FROM cartao_anexos
      WHERE cartao_id = ?
        AND id = ?
        AND removido_em IS NULL
      LIMIT 1
      `,
      [cartaoId, anexoId]
    );
    return rows[0] || null;
  }

  async criar(dados) {
    const [result] = await db.query(
      `
      INSERT INTO cartao_anexos (
        cartao_id, enviado_por_usuario_id, nome_original, mime_type, tamanho_bytes, caminho_arquivo, sha256, criado_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        dados.cartaoId,
        dados.enviadoPorUsuarioId || null,
        dados.nomeArquivo,
        dados.tipoMime,
        dados.tamanhoBytes,
        dados.caminhoArquivo,
        dados.sha256 || null,
      ]
    );
    return result.insertId;
  }

  async remover(cartaoId, anexoId) {
    const [result] = await db.query(
      `
      UPDATE cartao_anexos
      SET removido_em = NOW()
      WHERE cartao_id = ?
        AND id = ?
        AND removido_em IS NULL
      `,
      [cartaoId, anexoId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new CartaoAnexoRepository();

