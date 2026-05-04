const ConviteRepository = require("../repositories/ConviteRepository");
const NotificacaoRepository = require("../repositories/NotificacaoRepository");
const QuadroRepository = require("../repositories/QuadroRepository");
const QuadroMembroRepository = require("../repositories/QuadroMembroRepository");
const QuadroPapelRepository = require("../repositories/QuadroPapelRepository");
const OrganizacaoRepository = require("../repositories/OrganizacaoRepository");
const UsuarioRepository = require("../repositories/UsuarioRepository");
const { loadQuadroContext } = require("../middlewares/permissionMiddleware");

const connectionModule = require("../database/connection");

const db = connectionModule.pool || connectionModule.db || connectionModule;

const TIPO_CONVITE_RECEBIDO = "CONVITE_QUADRO_RECEBIDO";
const TIPO_CONVITE_ACEITO = "CONVITE_QUADRO_ACEITO";
const TIPO_CONVITE_RECUSADO = "CONVITE_QUADRO_RECUSADO";

function toPositiveInt(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function emailValido(email) {
  const e = String(email || "").trim();
  if (!e) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function normalizarPapelIds(body) {
  if (Array.isArray(body.papelIds) && body.papelIds.length) {
    return [...new Set(body.papelIds.map((id) => toPositiveInt(id)).filter(Boolean))];
  }
  return [];
}

class ConviteService {
  async resolverPapelIdsPorNomeQuadro(quadroId, nomePapel) {
    const nome = String(nomePapel || "").trim();
    if (!nome) return [];
    const papeis = await QuadroPapelRepository.listar(quadroId, { ativo: true });
    const found = papeis.find((p) => String(p.nome).toLowerCase() === nome.toLowerCase());
    return found ? [found.id] : [];
  }

  /**
   * Compatível com POST /membros/convites (email + opcionalmente papel como nome).
   */
  async criarDesdeFluxoLegado(quadroId, body = {}, remetenteUsuarioId, quadroContext) {
    let papelIds = normalizarPapelIds(body);
    if (!papelIds.length && body.papel) {
      papelIds = await this.resolverPapelIdsPorNomeQuadro(quadroId, body.papel);
    }
    if (!papelIds.length) {
      const papeis = await QuadroPapelRepository.listar(quadroId, { ativo: true });
      const fallback =
        papeis.find((p) => String(p.nome).toLowerCase() === "colaborador") || papeis[0];
      if (fallback) papelIds = [fallback.id];
    }
    return this.criarConviteQuadro(
      quadroId,
      {
        email: body.email,
        papelIds,
        mensagem: body.mensagem,
      },
      remetenteUsuarioId,
      quadroContext
    );
  }

  async criarConviteQuadro(quadroId, body, remetenteUsuarioId, quadroContext) {
    const qId = toPositiveInt(quadroId);
    const remetenteId = toPositiveInt(remetenteUsuarioId);
    if (!qId || !remetenteId) {
      const err = new Error("Dados inválidos para criar convite.");
      err.statusCode = 400;
      throw err;
    }

    const email = String(body.email || "").trim().toLowerCase();
    if (!emailValido(email)) {
      const err = new Error("Informe um e-mail válido.");
      err.statusCode = 400;
      throw err;
    }

    const papelIds = normalizarPapelIds(body);
    if (!papelIds.length) {
      const err = new Error("Informe ao menos um papel (papelIds).");
      err.statusCode = 400;
      throw err;
    }

    const quadro = await QuadroRepository.obterPorId(qId);
    if (!quadro) {
      const err = new Error("Quadro não encontrado.");
      err.statusCode = 404;
      throw err;
    }

    const convidado = await UsuarioRepository.findByEmail(email);
    if (!convidado) {
      const err = new Error("Nenhum usuário cadastrado foi encontrado com este e-mail.");
      err.statusCode = 404;
      throw err;
    }

    const convidadoId = toPositiveInt(convidado.id);
    if (convidadoId === remetenteId) {
      const err = new Error("Você não pode convidar a si mesmo.");
      err.statusCode = 400;
      throw err;
    }

    const vinculoOrg = await OrganizacaoRepository.obterMembroPorUsuarioId(
      quadro.organizacaoId,
      convidadoId
    );
    if (!vinculoOrg || String(vinculoOrg.status || "").toLowerCase() !== "ativo") {
      const err = new Error(
        "Este usuário precisa pertencer à organização antes de ser convidado para o quadro."
      );
      err.statusCode = 409;
      throw err;
    }

    const membroExistente = await QuadroMembroRepository.obterPorUsuarioId(qId, convidadoId);
    if (membroExistente && String(membroExistente.status || "").toLowerCase() === "ativo") {
      const err = new Error("Este usuário já é membro do quadro.");
      err.statusCode = 409;
      throw err;
    }

    const pendenteId = await ConviteRepository.findPendentePorQuadroEUsuario(qId, convidadoId);
    if (pendenteId) {
      const err = new Error("Já existe um convite pendente para este usuário.");
      err.statusCode = 409;
      throw err;
    }

    const papeisQuadro = await QuadroPapelRepository.listar(qId, { ativo: true });
    const idsValidos = new Set(papeisQuadro.map((p) => Number(p.id)));
    for (const pid of papelIds) {
      if (!idsValidos.has(pid)) {
        const err = new Error("Um ou mais papéis não pertencem a este quadro ou estão inativos.");
        err.statusCode = 400;
        throw err;
      }
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const conviteId = await ConviteRepository.inserirConviteEPapeis(conn, {
        quadroId: qId,
        usuarioConvidadoId: convidadoId,
        emailConvidado: email,
        convidadoPorUsuarioId: remetenteId,
        mensagem: body.mensagem,
        papelIds,
      });

      await NotificacaoRepository.criar(
        {
          usuarioId: convidadoId,
          tipo: TIPO_CONVITE_RECEBIDO,
          titulo: "Convite para quadro",
          mensagem: `Você recebeu um convite para participar do quadro ${quadro.nome || ""}.`.trim(),
          link: null,
          dadosJson: {
            conviteId,
            quadroId: qId,
            convidadoPorUsuarioId: remetenteId,
          },
        },
        conn
      );

      await conn.commit();

      return { conviteId, status: "pendente" };
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }

  async podeVisualizarConvite(conviteId, usuarioId) {
    const uId = toPositiveInt(usuarioId);
    const cId = toPositiveInt(conviteId);
    if (!uId || !cId) return false;

    const row = await ConviteRepository.obterPorId(cId);
    if (!row) return false;

    if (Number(row.usuarioConvidadoId) === uId) return true;
    if (
      row.convidadoPorUsuarioId != null &&
      Number(row.convidadoPorUsuarioId) === uId
    ) {
      return true;
    }

    const ctx = await loadQuadroContext(Number(row.quadroId), uId);
    if (ctx?.permissoes?.podeConvidarMembros) return true;

    return false;
  }

  async obterDetalhe(conviteId, usuarioId) {
    const cId = toPositiveInt(conviteId);
    const uId = toPositiveInt(usuarioId);
    if (!cId || !uId) {
      const err = new Error("IDs inválidos.");
      err.statusCode = 400;
      throw err;
    }

    const pode = await this.podeVisualizarConvite(cId, uId);
    if (!pode) {
      const err = new Error("Convite não encontrado ou acesso negado.");
      err.statusCode = 403;
      throw err;
    }

    const [rows] = await db.query(
      `
      SELECT
        qc.id,
        qc.status,
        qc.mensagem,
        qc.criado_em AS criadoEm,
        qc.respondido_em AS respondidoEm,
        qc.expira_em AS expiraEm,
        qc.quadro_id AS quadroId,
        q.nome AS quadroNome,
        qc.convidado_por_usuario_id AS convidadoPorId,
        uc.nome_exibicao AS convidadoPorNome,
        uc.email AS convidadoPorEmail,
        qc.usuario_convidado_id AS usuarioConvidadoId,
        uv.nome_exibicao AS usuarioConvidadoNome,
        uv.email AS usuarioConvidadoEmail
      FROM quadro_convites qc
      INNER JOIN quadros q ON q.id = qc.quadro_id
      LEFT JOIN usuarios uc ON uc.id = qc.convidado_por_usuario_id
      INNER JOIN usuarios uv ON uv.id = qc.usuario_convidado_id
      WHERE qc.id = ?
      LIMIT 1
      `,
      [cId]
    );

    const base = rows[0];
    if (!base) {
      const err = new Error("Convite não encontrado.");
      err.statusCode = 404;
      throw err;
    }

    const papeis = await ConviteRepository.listarPapeisPorConviteId(cId);

    return {
      id: Number(base.id),
      status: base.status,
      mensagem: base.mensagem,
      criadoEm: base.criadoEm,
      respondidoEm: base.respondidoEm,
      expiraEm: base.expiraEm,
      quadro: {
        id: Number(base.quadroId),
        nome: base.quadroNome,
      },
      convidadoPor: base.convidadoPorId
        ? {
            id: Number(base.convidadoPorId),
            nomeExibicao: base.convidadoPorNome,
            email: base.convidadoPorEmail,
          }
        : null,
      usuarioConvidado: {
        id: Number(base.usuarioConvidadoId),
        nomeExibicao: base.usuarioConvidadoNome,
        email: base.usuarioConvidadoEmail,
      },
      papeis,
    };
  }

  async listarPendentesParaUsuario(usuarioId) {
    const uId = toPositiveInt(usuarioId);
    if (!uId) return [];
    const rows = await ConviteRepository.listarPendentesPorUsuarioId(uId);
    return rows.map((r) => ({
      id: Number(r.id),
      quadroId: Number(r.quadroId),
      status: r.status,
      criadoEm: r.criadoEm,
    }));
  }

  async aceitar(conviteId, usuarioId) {
    const cId = toPositiveInt(conviteId);
    const uId = toPositiveInt(usuarioId);
    if (!cId || !uId) {
      const err = new Error("IDs inválidos.");
      err.statusCode = 400;
      throw err;
    }

    const row = await ConviteRepository.obterPorId(cId);
    if (!row) {
      const err = new Error("Convite não encontrado.");
      err.statusCode = 404;
      throw err;
    }

    if (Number(row.usuarioConvidadoId) !== uId) {
      const err = new Error("Acesso negado a este convite.");
      err.statusCode = 403;
      throw err;
    }

    if (String(row.status) !== "pendente") {
      const err = new Error("Este convite não está mais pendente.");
      err.statusCode = 409;
      throw err;
    }

    if (row.expiraEm && new Date(row.expiraEm) < new Date()) {
      await ConviteRepository.finalizarConvite(cId, "expirado");
      const err = new Error("Este convite expirou.");
      err.statusCode = 410;
      throw err;
    }

    const quadroId = Number(row.quadroId);
    const papelIds = (
      await ConviteRepository.listarPapeisPorConviteId(cId)
    ).map((p) => p.id);

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const fresh = await ConviteRepository.obterPorId(cId);
      if (!fresh || String(fresh.status) !== "pendente") {
        const err = new Error("Este convite não está mais pendente.");
        err.statusCode = 409;
        throw err;
      }

      const membro = await QuadroMembroRepository.obterPorUsuarioId(quadroId, uId);
      if (membro) {
        const st = String(membro.status || "").toLowerCase();
        if (st === "suspenso") {
          const err = new Error("Este usuário está suspenso neste quadro.");
          err.statusCode = 409;
          throw err;
        }
        if (st === "ativo") {
          await ConviteRepository.finalizarConvite(cId, "aceito", conn);
          await NotificacaoRepository.marcarConviteRecebidoComoLida(uId, cId, conn);
          await conn.commit();
          return { quadroId };
        }
        if (st === "convidado") {
          await conn.query(
            `
            UPDATE quadro_membros
            SET status = 'ativo', atualizado_em = NOW()
            WHERE id = ?
            `,
            [membro.id]
          );
          await QuadroMembroRepository.substituirPapeisNaConexao(
            conn,
            membro.id,
            papelIds
          );
        }
      } else {
        const [ins] = await conn.query(
          `
          INSERT INTO quadro_membros (quadro_id, usuario_id, status, criado_em, atualizado_em)
          VALUES (?, ?, 'ativo', NOW(), NOW())
          `,
          [quadroId, uId]
        );
        const membroId = ins.insertId;
        await QuadroMembroRepository.substituirPapeisNaConexao(
          conn,
          membroId,
          papelIds
        );
      }

      await ConviteRepository.finalizarConvite(cId, "aceito", conn);

      const quadro = await QuadroRepository.obterPorId(quadroId);
      const aceitador = await UsuarioRepository.findById(uId);
      const nomeAceitador =
        aceitador?.nome_exibicao || aceitador?.nomeExibicao || aceitador?.email || "Usuário";

      if (row.convidadoPorUsuarioId) {
        await NotificacaoRepository.criar(
          {
            usuarioId: Number(row.convidadoPorUsuarioId),
            tipo: TIPO_CONVITE_ACEITO,
            titulo: "Convite aceito",
            mensagem: `${nomeAceitador} aceitou o convite para o quadro ${quadro?.nome || ""}.`.trim(),
            link: null,
            dadosJson: {
              conviteId: cId,
              quadroId,
              usuarioConvidadoId: uId,
            },
          },
          conn
        );
      }

      await NotificacaoRepository.marcarConviteRecebidoComoLida(uId, cId, conn);

      await conn.commit();
      return { quadroId };
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }

  async recusar(conviteId, usuarioId) {
    const cId = toPositiveInt(conviteId);
    const uId = toPositiveInt(usuarioId);
    if (!cId || !uId) {
      const err = new Error("IDs inválidos.");
      err.statusCode = 400;
      throw err;
    }

    const row = await ConviteRepository.obterPorId(cId);
    if (!row) {
      const err = new Error("Convite não encontrado.");
      err.statusCode = 404;
      throw err;
    }

    if (Number(row.usuarioConvidadoId) !== uId) {
      const err = new Error("Acesso negado a este convite.");
      err.statusCode = 403;
      throw err;
    }

    if (String(row.status) !== "pendente") {
      const err = new Error("Este convite não está mais pendente.");
      err.statusCode = 409;
      throw err;
    }

    const quadroId = Number(row.quadroId);
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      await ConviteRepository.finalizarConvite(cId, "recusado", conn);

      const quadro = await QuadroRepository.obterPorId(quadroId);
      const recusador = await UsuarioRepository.findById(uId);
      const nomeRec =
        recusador?.nome_exibicao || recusador?.nomeExibicao || recusador?.email || "Usuário";

      if (row.convidadoPorUsuarioId) {
        await NotificacaoRepository.criar(
          {
            usuarioId: Number(row.convidadoPorUsuarioId),
            tipo: TIPO_CONVITE_RECUSADO,
            titulo: "Convite recusado",
            mensagem: `${nomeRec} recusou o convite para o quadro ${quadro?.nome || ""}.`.trim(),
            link: null,
            dadosJson: {
              conviteId: cId,
              quadroId,
              usuarioConvidadoId: uId,
            },
          },
          conn
        );
      }

      await NotificacaoRepository.marcarConviteRecebidoComoLida(uId, cId, conn);

      await conn.commit();
      return { ok: true };
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }
}

module.exports = new ConviteService();
