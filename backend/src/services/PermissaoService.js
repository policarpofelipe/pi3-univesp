const QuadroMembroRepository = require("../repositories/QuadroMembroRepository");

function toPositiveInt(value) {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : null;
}

class PermissaoService {
  async usuarioEhMembroAtivo(quadroId, usuarioId) {
    const qId = toPositiveInt(quadroId);
    const uId = toPositiveInt(usuarioId);
    if (!qId || !uId) return false;
    const membro = await QuadroMembroRepository.obterPorUsuarioId(qId, uId);
    return Boolean(membro && membro.status === "ativo");
  }
}

module.exports = new PermissaoService();
