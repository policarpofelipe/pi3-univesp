const jwt = require("jsonwebtoken");
const env = require("./env");

function generateToken(payload) {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch (error) {
    throw new Error("Token inválido ou expirado.");
  }
}

function decodeToken(token) {
  return jwt.decode(token);
}

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
};
