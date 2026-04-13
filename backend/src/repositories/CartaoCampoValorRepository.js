const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

class CartaoCampoValorRepository {
  async listarPorCartao(cartaoId) {
    const [rows] = await db.query(
      `
      SELECT
        id,
        cartao_id AS cartaoId,
        campo_id AS campoId,
        valor_texto AS valorTexto,
        valor_numero AS valorNumero,
        valor_data AS valorData,
        valor_data_hora AS valorDataHora,
        valor_booleano AS valorBooleano,
        valor_opcao_id AS valorOpcaoId,
        valor_usuario_id AS valorUsuarioId,
        valor_json AS valorJson,
        atualizado_por_usuario_id AS atualizadoPorUsuarioId,
        criado_em AS criadoEm,
        atualizado_em AS atualizadoEm
      FROM cartao_campo_valores
      WHERE cartao_id = ?
      `,
      [cartaoId]
    );
    return rows;
  }

  async upsert(cartaoId, campoId, payload) {
    await db.query(
      `
      INSERT INTO cartao_campo_valores (
        cartao_id,
        campo_id,
        valor_texto,
        valor_numero,
        valor_data,
        valor_data_hora,
        valor_booleano,
        valor_opcao_id,
        valor_usuario_id,
        valor_json,
        atualizado_por_usuario_id,
        criado_em,
        atualizado_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        valor_texto = VALUES(valor_texto),
        valor_numero = VALUES(valor_numero),
        valor_data = VALUES(valor_data),
        valor_data_hora = VALUES(valor_data_hora),
        valor_booleano = VALUES(valor_booleano),
        valor_opcao_id = VALUES(valor_opcao_id),
        valor_usuario_id = VALUES(valor_usuario_id),
        valor_json = VALUES(valor_json),
        atualizado_por_usuario_id = VALUES(atualizado_por_usuario_id),
        atualizado_em = NOW()
      `,
      [
        cartaoId,
        campoId,
        payload.valorTexto,
        payload.valorNumero,
        payload.valorData,
        payload.valorDataHora,
        payload.valorBooleano,
        payload.valorOpcaoId,
        payload.valorUsuarioId,
        payload.valorJson,
        payload.atualizadoPorUsuarioId || null,
      ]
    );
  }

  async remover(cartaoId, campoId) {
    const [result] = await db.query(
      `
      DELETE FROM cartao_campo_valores
      WHERE cartao_id = ?
        AND campo_id = ?
      `,
      [cartaoId, campoId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new CartaoCampoValorRepository();
