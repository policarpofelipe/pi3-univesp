const NotificacaoRepository = require("../repositories/NotificacaoRepository");

class NotificacaoService {
  async listar(usuarioId, query = {}) {
    const uId = Number(usuarioId);
    if (!Number.isInteger(uId) || uId < 1) {
      const err = new Error("Usuário inválido.");
      err.statusCode = 400;
      throw err;
    }
    const limit = query.limit;
    const somenteNaoLidas = query.somenteNaoLidas;
    return NotificacaoRepository.listarPorUsuario(uId, { limit, somenteNaoLidas });
  }

  async contarNaoLidas(usuarioId) {
    const uId = Number(usuarioId);
    if (!Number.isInteger(uId) || uId < 1) {
      const err = new Error("Usuário inválido.");
      err.statusCode = 400;
      throw err;
    }
    const total = await NotificacaoRepository.contarNaoLidas(uId);
    return { total };
  }

  async marcarComoLida(notificacaoId, usuarioId) {
    const nId = Number(notificacaoId);
    const uId = Number(usuarioId);
    if (!Number.isInteger(nId) || nId < 1 || !Number.isInteger(uId) || uId < 1) {
      const err = new Error("IDs inválidos.");
      err.statusCode = 400;
      throw err;
    }
    const ok = await NotificacaoRepository.marcarComoLida(nId, uId);
    if (!ok) {
      const err = new Error("Notificação não encontrada ou já estava lida.");
      err.statusCode = 404;
      throw err;
    }
    return true;
  }
}

module.exports = new NotificacaoService();
