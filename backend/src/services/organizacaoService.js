const organizacaoRepository = require("../repositories/OrganizacaoRepository");

function normalizarSlug(valor = "") {
  return String(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function validarNome(nome) {
  return typeof nome === "string" && nome.trim().length >= 2;
}

function validarSlug(slug) {
  return typeof slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

class OrganizacaoService {
  async listar(filtros = {}) {
    const { usuarioId, busca = "", ativo } = filtros;

    return await organizacaoRepository.listar({
      usuarioId,
      busca,
      ativo,
    });
  }

  async obterPorId(organizacaoId) {
    return await organizacaoRepository.obterPorId(organizacaoId);
  }

  async criar(dados) {
    const {
      nome,
      slug,
      ativo = true,
      criadoPorUsuarioId,
    } = dados;

    if (!validarNome(nome)) {
      const error = new Error(
        "O nome da organização deve ter pelo menos 2 caracteres."
      );
      error.statusCode = 400;
      throw error;
    }

    if (!criadoPorUsuarioId) {
      const error = new Error(
        "Não foi possível identificar o usuário criador da organização."
      );
      error.statusCode = 400;
      throw error;
    }

    if (!slug || String(slug).trim() === "") {
      const error = new Error("O slug da organização é obrigatório.");
      error.statusCode = 400;
      throw error;
    }

    const slugNormalizado = normalizarSlug(slug);

    if (!validarSlug(slugNormalizado)) {
      const error = new Error(
        "O slug informado é inválido. Use apenas letras minúsculas, números e hífen."
      );
      error.statusCode = 400;
      throw error;
    }

    const organizacaoComMesmoSlug =
      await organizacaoRepository.obterPorSlug(slugNormalizado);

    if (organizacaoComMesmoSlug) {
      const error = new Error("Já existe uma organização com este slug.");
      error.statusCode = 409;
      throw error;
    }

    const organizacao = await organizacaoRepository.criar({
      nome: nome.trim(),
      slug: slugNormalizado,
      ativo: Boolean(ativo),
      criadoPorUsuarioId,
    });

    await organizacaoRepository.adicionarMembro({
      organizacaoId: organizacao.id,
      usuarioId: criadoPorUsuarioId,
      papel: "dono",
      status: "ativo",
    });

    return await organizacaoRepository.obterPorId(organizacao.id);
  }

  async atualizar(organizacaoId, dados = {}) {
    const organizacaoAtual = await organizacaoRepository.obterPorId(organizacaoId);

    if (!organizacaoAtual) {
      return null;
    }

    const payload = {};

    if (dados.nome !== undefined) {
      if (!validarNome(dados.nome)) {
        const error = new Error(
          "O nome da organização deve ter pelo menos 2 caracteres."
        );
        error.statusCode = 400;
        throw error;
      }

      payload.nome = dados.nome.trim();
    }

    if (dados.slug !== undefined) {
      if (!dados.slug || String(dados.slug).trim() === "") {
        const error = new Error("O slug da organização não pode ficar vazio.");
        error.statusCode = 400;
        throw error;
      }

      const slugNormalizado = normalizarSlug(dados.slug);

      if (!validarSlug(slugNormalizado)) {
        const error = new Error(
          "O slug informado é inválido. Use apenas letras minúsculas, números e hífen."
        );
        error.statusCode = 400;
        throw error;
      }

      const organizacaoComMesmoSlug =
        await organizacaoRepository.obterPorSlug(slugNormalizado);

      if (
        organizacaoComMesmoSlug &&
        Number(organizacaoComMesmoSlug.id) !== Number(organizacaoId)
      ) {
        const error = new Error("Já existe uma organização com este slug.");
        error.statusCode = 409;
        throw error;
      }

      payload.slug = slugNormalizado;
    }

    if (dados.ativo !== undefined) {
      payload.ativo = Boolean(dados.ativo);
    }

    return await organizacaoRepository.atualizar(organizacaoId, payload);
  }

  async remover(organizacaoId) {
    const organizacaoAtual = await organizacaoRepository.obterPorId(organizacaoId);

    if (!organizacaoAtual) {
      return false;
    }

    return await organizacaoRepository.remover(organizacaoId);
  }
}

module.exports = new OrganizacaoService();
