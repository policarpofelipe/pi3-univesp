const bcrypt = require("bcryptjs");
const UsuarioRepository = require("../repositories/UsuarioRepository");
const { generateToken } = require("../config/jwt");

async function register({ nomeExibicao, email, senha }) {
  const existingUser = await UsuarioRepository.findByEmail(email);

  if (existingUser) {
    const error = new Error("Já existe um usuário com este e-mail.");
    error.statusCode = 409;
    throw error;
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const usuario = await UsuarioRepository.create({
    nomeExibicao,
    email,
    senhaHash,
  });

  return usuario;
}

async function login({ email, senha }) {
  if (!email || !senha) {
    const error = new Error("E-mail e senha são obrigatórios.");
    error.statusCode = 400;
    throw error;
  }

  const usuario = await UsuarioRepository.findByEmail(email);

  if (!usuario) {
    const error = new Error("E-mail ou senha inválidos.");
    error.statusCode = 401;
    throw error;
  }

  const hashSenha = usuario.senha_hash || usuario.senhaHash;

  if (!hashSenha) {
    const error = new Error(
      "Usuário encontrado, mas o hash de senha não está disponível."
    );
    error.statusCode = 500;
    throw error;
  }

  const senhaValida = await bcrypt.compare(senha, hashSenha);

  if (!senhaValida) {
    const error = new Error("E-mail ou senha inválidos.");
    error.statusCode = 401;
    throw error;
  }

  await UsuarioRepository.updateUltimoLogin(usuario.id);

  const token = generateToken({
    id: usuario.id,
    email: usuario.email,
  });

  return {
    token,
    usuario: {
      id: usuario.id,
      email: usuario.email,
      nomeExibicao: usuario.nome_exibicao || usuario.nomeExibicao,
      ativo: usuario.ativo,
    },
  };
}

async function me(usuarioId) {
  const usuario = await UsuarioRepository.findById(usuarioId);

  if (!usuario) {
    const error = new Error("Usuário não encontrado.");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: usuario.id,
    email: usuario.email,
    nomeExibicao: usuario.nome_exibicao || usuario.nomeExibicao,
    ativo: usuario.ativo,
    criadoEm: usuario.criado_em || usuario.criadoEm,
    atualizadoEm: usuario.atualizado_em || usuario.atualizadoEm,
  };
}

module.exports = {
  register,
  login,
  me,
};
