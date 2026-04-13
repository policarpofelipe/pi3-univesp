const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

function toPositiveInt(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function toUsuarioId(req) {
  return toPositiveInt(req.usuario?.id);
}

function parsePapelIds(csv) {
  if (!csv) return [];
  return String(csv)
    .split(",")
    .map((s) => toPositiveInt(s.trim()))
    .filter(Boolean);
}

/**
 * Carrega membro ativo do quadro e permissões agregadas dos papéis (OR).
 * Anexa em req.quadroContext para uso em requireQuadroPermission.
 */
async function loadQuadroContext(quadroId, usuarioId) {
  const [rows] = await db.query(
    `
    SELECT
      qm.id AS membroId,
      GROUP_CONCAT(DISTINCT qp.id ORDER BY qp.id SEPARATOR ',') AS papelIdsCsv,
      COALESCE(MAX(qp.pode_gerenciar_quadro), 0) AS podeGerenciarQuadro,
      COALESCE(MAX(qp.pode_gerenciar_listas), 0) AS podeGerenciarListas,
      COALESCE(MAX(qp.pode_gerenciar_automacoes), 0) AS podeGerenciarAutomacoes,
      COALESCE(MAX(qp.pode_gerenciar_campos), 0) AS podeGerenciarCampos,
      COALESCE(MAX(qp.pode_convidar_membros), 0) AS podeConvidarMembros,
      COALESCE(MAX(qp.pode_criar_cartao), 0) AS podeCriarCartao
    FROM quadro_membros qm
    LEFT JOIN quadro_membro_papeis qmp
      ON qmp.quadro_membro_id = qm.id
    LEFT JOIN quadro_papeis qp
      ON qp.id = qmp.papel_id
     AND qp.quadro_id = qm.quadro_id
     AND qp.ativo = 1
    WHERE qm.quadro_id = ?
      AND qm.usuario_id = ?
      AND qm.status = 'ativo'
    GROUP BY qm.id
    LIMIT 1
    `,
    [quadroId, usuarioId]
  );

  const row = rows[0];
  if (!row) return null;

  return {
    quadroId,
    usuarioId,
    membroId: row.membroId,
    papelIds: parsePapelIds(row.papelIdsCsv),
    permissoes: {
      podeGerenciarQuadro: Boolean(Number(row.podeGerenciarQuadro)),
      podeGerenciarListas: Boolean(Number(row.podeGerenciarListas)),
      podeGerenciarAutomacoes: Boolean(Number(row.podeGerenciarAutomacoes)),
      podeGerenciarCampos: Boolean(Number(row.podeGerenciarCampos)),
      podeConvidarMembros: Boolean(Number(row.podeConvidarMembros)),
      podeCriarCartao: Boolean(Number(row.podeCriarCartao)),
    },
  };
}

async function loadOrganizacaoContext(organizacaoId, usuarioId) {
  const [rows] = await db.query(
    `
    SELECT
      om.id AS membroId,
      om.papel,
      om.status
    FROM organizacao_membros om
    WHERE om.organizacao_id = ?
      AND om.usuario_id = ?
      AND om.status = 'ativo'
    LIMIT 1
    `,
    [organizacaoId, usuarioId]
  );

  const row = rows[0];
  if (!row) return null;

  return {
    organizacaoId,
    usuarioId,
    membroId: row.membroId,
    papel: row.papel,
  };
}

/**
 * Express router.param handler: valida membro ativo do quadro e preenche req.quadroContext.
 */
async function ensureQuadroMemberParam(req, res, next, quadroIdRaw) {
  try {
    const usuarioId = toUsuarioId(req);
    if (!usuarioId) {
      return res.status(401).json({
        success: false,
        message: "Não autenticado.",
      });
    }

    const quadroId = toPositiveInt(quadroIdRaw);
    if (!quadroId) {
      return res.status(400).json({
        success: false,
        message: "ID do quadro inválido.",
      });
    }

    const ctx = await loadQuadroContext(quadroId, usuarioId);
    if (!ctx) {
      return res.status(403).json({
        success: false,
        message: "Acesso negado ao quadro.",
      });
    }

    req.quadroContext = ctx;
    return next();
  } catch (error) {
    return next(error);
  }
}

/**
 * Express router.param handler: valida membro ativo da organização e preenche req.organizacaoContext.
 */
async function ensureOrganizacaoMemberParam(req, res, next, organizacaoIdRaw) {
  try {
    const usuarioId = toUsuarioId(req);
    if (!usuarioId) {
      return res.status(401).json({
        success: false,
        message: "Não autenticado.",
      });
    }

    const organizacaoId = toPositiveInt(organizacaoIdRaw);
    if (!organizacaoId) {
      return res.status(400).json({
        success: false,
        message: "ID da organização inválido.",
      });
    }

    const ctx = await loadOrganizacaoContext(organizacaoId, usuarioId);
    if (!ctx) {
      return res.status(403).json({
        success: false,
        message: "Acesso negado à organização.",
      });
    }

    req.organizacaoContext = ctx;
    return next();
  } catch (error) {
    return next(error);
  }
}

const PERMISSAO_KEYS = new Set([
  "podeGerenciarQuadro",
  "podeGerenciarListas",
  "podeGerenciarAutomacoes",
  "podeGerenciarCampos",
  "podeConvidarMembros",
  "podeCriarCartao",
]);

/**
 * Middleware de rota: exige permissão agregada no quadro (use após ensureQuadroMemberParam).
 * @param {string} permissaoChave — uma das chaves em PERMISSAO_KEYS
 */
function requireQuadroPermission(permissaoChave) {
  if (!PERMISSAO_KEYS.has(permissaoChave)) {
    throw new Error(`Permissão desconhecida: ${permissaoChave}`);
  }

  return function requireQuadroPermissionMiddleware(req, res, next) {
    const ctx = req.quadroContext;
    if (!ctx?.permissoes) {
      return res.status(500).json({
        success: false,
        message: "Contexto do quadro não carregado. Use ensureQuadroMemberParam nas rotas.",
      });
    }

    if (!ctx.permissoes[permissaoChave]) {
      return res.status(403).json({
        success: false,
        message: "Permissão insuficiente para esta ação no quadro.",
      });
    }

    return next();
  };
}

/**
 * Exige papel da organização em um subconjunto (ex.: apenas dono/admin).
 * @param {string[]} papeisPermitidos — valores do ENUM papel em organizacao_membros.
 *   Se a lista estiver vazia, qualquer membro ativo (já validado no param) segue adiante.
 */
function requireOrganizacaoPapel(papeisPermitidos = []) {
  const permitidos = new Set(papeisPermitidos);

  return function requireOrganizacaoPapelMiddleware(req, res, next) {
    const ctx = req.organizacaoContext;
    if (!ctx) {
      return res.status(500).json({
        success: false,
        message: "Contexto da organização não carregado. Use ensureOrganizacaoMemberParam nas rotas.",
      });
    }

    if (!permitidos.size || permitidos.has(ctx.papel)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Permissão insuficiente nesta organização.",
    });
  };
}

module.exports = {
  ensureQuadroMemberParam,
  ensureOrganizacaoMemberParam,
  requireQuadroPermission,
  requireOrganizacaoPapel,
  loadQuadroContext,
  loadOrganizacaoContext,
};
