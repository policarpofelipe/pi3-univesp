const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

class ListaPermissaoRepository {
  async listar(quadroId, listaId) {
    const [rows] = await db.query(
      `
      SELECT
        lpp.id,
        lpp.lista_id AS listaId,
        lpp.papel_id AS papelId,
        qp.nome AS papelNome,
        lpp.pode_ver AS podeVer,
        lpp.pode_editar AS podeEditar,
        lpp.pode_enviar_para AS podeEnviarPara
      FROM lista_permissoes_papel lpp
      INNER JOIN listas l ON l.id = lpp.lista_id
      INNER JOIN quadro_papeis qp ON qp.id = lpp.papel_id
      WHERE l.quadro_id = ?
        AND lpp.lista_id = ?
      ORDER BY qp.nome ASC
      `,
      [quadroId, listaId]
    );
    return rows.map((row) => ({
      id: row.id,
      listaId: row.listaId,
      papelId: row.papelId,
      papelNome: row.papelNome,
      podeVer: Boolean(row.podeVer),
      podeEditar: Boolean(row.podeEditar),
      podeEnviarPara: Boolean(row.podeEnviarPara),
    }));
  }

  async upsert({ listaId, papelId, podeVer, podeEditar, podeEnviarPara }) {
    await db.query(
      `
      INSERT INTO lista_permissoes_papel (
        lista_id, papel_id, pode_ver, pode_editar, pode_enviar_para, criado_em, atualizado_em
      ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        pode_ver = VALUES(pode_ver),
        pode_editar = VALUES(pode_editar),
        pode_enviar_para = VALUES(pode_enviar_para),
        atualizado_em = NOW()
      `,
      [listaId, papelId, podeVer ? 1 : 0, podeEditar ? 1 : 0, podeEnviarPara ? 1 : 0]
    );
  }

  async remover(listaId, papelId) {
    const [result] = await db.query(
      "DELETE FROM lista_permissoes_papel WHERE lista_id = ? AND papel_id = ?",
      [listaId, papelId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new ListaPermissaoRepository();

