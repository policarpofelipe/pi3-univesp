const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

function toId(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

async function obterContextoMovimento(quadroId, cartaoId, listaDestinoId) {
  const [rows] = await db.query(
    `
    SELECT
      c.id AS cartaoId,
      c.lista_id AS listaOrigemId,
      lo.usa_regras_transicao AS origemUsaRegras,
      ld.id AS listaDestinoId,
      ld.usa_controle_acesso AS destinoUsaControle
    FROM cartoes c
    INNER JOIN listas lo ON lo.id = c.lista_id
    INNER JOIN listas ld ON ld.id = ?
    WHERE c.id = ?
      AND lo.quadro_id = ?
      AND ld.quadro_id = ?
    LIMIT 1
    `,
    [listaDestinoId, cartaoId, quadroId, quadroId]
  );
  return rows[0] || null;
}

async function obterPapeisUsuarioNoQuadro(quadroId, usuarioId) {
  const [rows] = await db.query(
    `
    SELECT qmp.papel_id AS papelId
    FROM quadro_membros qm
    INNER JOIN quadro_membro_papeis qmp ON qmp.quadro_membro_id = qm.id
    WHERE qm.quadro_id = ?
      AND qm.usuario_id = ?
      AND qm.status = 'ativo'
    `,
    [quadroId, usuarioId]
  );
  return [...new Set(rows.map((r) => Number(r.papelId)).filter(Boolean))];
}

async function possuiPermissaoEnvio(listaDestinoId, papelIds = []) {
  if (!papelIds.length) return false;
  const placeholders = papelIds.map(() => "?").join(",");
  const [rows] = await db.query(
    `
    SELECT 1
    FROM lista_permissoes_papel
    WHERE lista_id = ?
      AND papel_id IN (${placeholders})
      AND pode_enviar_para = 1
    LIMIT 1
    `,
    [listaDestinoId, ...papelIds]
  );
  return Boolean(rows[0]);
}

async function possuiRegraTransicao(listaOrigemId, listaDestinoId, papelIds = []) {
  const params = [listaOrigemId, listaDestinoId];
  let condPapel = "papel_id IS NULL";
  if (papelIds.length) {
    const placeholders = papelIds.map(() => "?").join(",");
    condPapel = `(papel_id IS NULL OR papel_id IN (${placeholders}))`;
    params.push(...papelIds);
  }
  const [rows] = await db.query(
    `
    SELECT 1
    FROM lista_regras_transicao
    WHERE lista_origem_id = ?
      AND lista_destino_id = ?
      AND ${condPapel}
    LIMIT 1
    `,
    params
  );
  return Boolean(rows[0]);
}

async function validarMovimentacaoCartao(req, res, next) {
  try {
    const quadroId = toId(req.params.quadroId);
    const cartaoId = toId(req.params.cartaoId);
    const listaDestinoId = toId(req.body?.listaId);
    const usuarioId = toId(req.usuario?.id);

    if (!quadroId || !cartaoId || !listaDestinoId || !usuarioId) {
      return res.status(400).json({
        success: false,
        message: "Dados inválidos para validação de movimento.",
      });
    }

    const ctx = await obterContextoMovimento(quadroId, cartaoId, listaDestinoId);
    if (!ctx) {
      return res.status(404).json({
        success: false,
        message: "Cartão ou lista de destino não encontrados no quadro.",
      });
    }

    const papelIds = await obterPapeisUsuarioNoQuadro(quadroId, usuarioId);
    if (!papelIds.length) {
      return res.status(403).json({
        success: false,
        message: "Usuário sem papéis ativos no quadro.",
      });
    }

    if (Boolean(ctx.destinoUsaControle)) {
      const podeEnviar = await possuiPermissaoEnvio(ctx.listaDestinoId, papelIds);
      if (!podeEnviar) {
        return res.status(403).json({
          success: false,
          message: "Movimento bloqueado: sem permissão de envio para a lista de destino.",
        });
      }
    }

    if (Boolean(ctx.origemUsaRegras) && Number(ctx.listaOrigemId) !== Number(ctx.listaDestinoId)) {
      const permitido = await possuiRegraTransicao(
        ctx.listaOrigemId,
        ctx.listaDestinoId,
        papelIds
      );
      if (!permitido) {
        return res.status(403).json({
          success: false,
          message: "Movimento bloqueado: transição não permitida para o papel do usuário.",
        });
      }
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  validarMovimentacaoCartao,
};

