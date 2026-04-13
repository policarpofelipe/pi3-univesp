const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

class ListaTransicaoRepository {
  async listar(quadroId, listaOrigemId) {
    const [rows] = await db.query(
      `
      SELECT
        lrt.id,
        lrt.lista_origem_id AS listaOrigemId,
        lrt.lista_destino_id AS listaDestinoId,
        ld.nome AS listaDestinoNome,
        lrt.papel_id AS papelId,
        qp.nome AS papelNome
      FROM lista_regras_transicao lrt
      INNER JOIN listas lo ON lo.id = lrt.lista_origem_id
      INNER JOIN listas ld ON ld.id = lrt.lista_destino_id
      LEFT JOIN quadro_papeis qp ON qp.id = lrt.papel_id
      WHERE lo.quadro_id = ?
        AND lrt.lista_origem_id = ?
      ORDER BY ld.posicao_padrao ASC, lrt.papel_id ASC
      `,
      [quadroId, listaOrigemId]
    );
    return rows;
  }

  async existeRegra(listaOrigemId, listaDestinoId, papelId) {
    const [rows] = await db.query(
      `
      SELECT id
      FROM lista_regras_transicao
      WHERE lista_origem_id = ?
        AND lista_destino_id = ?
        AND (
          (papel_id IS NULL AND ? IS NULL)
          OR papel_id = ?
        )
      LIMIT 1
      `,
      [listaOrigemId, listaDestinoId, papelId, papelId]
    );
    return Boolean(rows[0]);
  }

  async criar({ listaOrigemId, listaDestinoId, papelId = null }) {
    const [result] = await db.query(
      `
      INSERT INTO lista_regras_transicao (
        lista_origem_id, lista_destino_id, papel_id, criado_em
      ) VALUES (?, ?, ?, NOW())
      `,
      [listaOrigemId, listaDestinoId, papelId]
    );
    return result.insertId;
  }

  async remover(id, listaOrigemId) {
    const [result] = await db.query(
      "DELETE FROM lista_regras_transicao WHERE id = ? AND lista_origem_id = ?",
      [id, listaOrigemId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new ListaTransicaoRepository();

