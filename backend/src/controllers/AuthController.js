const AuthService = require("../services/AuthService");

async function login(req, res, next) {
  try {
    const { email, senha } = req.body;
    const result = await AuthService.login({ email, senha });
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function register(req, res, next) {
  try {
    const { nomeExibicao, email, senha } = req.body;

    const usuario = await AuthService.register({
      nomeExibicao,
      email,
      senha,
    });

    return res.status(201).json({
      message: "Usuário cadastrado com sucesso.",
      usuario,
    });
  } catch (error) {
    next(error);
  }
}

async function forgotPassword(req, res) {
  return res.status(200).json({
    message: "Funcionalidade ainda não implementada.",
  });
}

async function resetPassword(req, res) {
  return res.status(200).json({
    message: "Funcionalidade ainda não implementada.",
  });
}

async function me(req, res, next) {
  try {
    const usuario = await AuthService.me(req.usuario.id);
    return res.status(200).json({ usuario });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res) {
  return res.status(200).json({
    message: "Logout realizado com sucesso.",
  });
}

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
  me,
  logout,
};
