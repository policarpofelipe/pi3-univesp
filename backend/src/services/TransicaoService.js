const listaTransicaoService = require("./listaTransicaoService");

class TransicaoService {
  async listar(quadroId, listaId) {
    return listaTransicaoService.listar(quadroId, listaId);
  }

  async criar(quadroId, listaId, dados) {
    return listaTransicaoService.criar(quadroId, listaId, dados);
  }

  async remover(quadroId, listaId, regraId) {
    return listaTransicaoService.remover(quadroId, listaId, regraId);
  }
}

module.exports = new TransicaoService();
