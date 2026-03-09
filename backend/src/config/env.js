const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

function getEnv(name, defaultValue = undefined) {
  const value = process.env[name];

  if (value === undefined || value === "") {
    if (defaultValue !== undefined) {
      return defaultValue;
    }

    throw new Error(`Variável de ambiente obrigatória não definida: ${name}`);
  }

  return value;
}

const env = {
  nodeEnv: getEnv("NODE_ENV", "development"),
  port: parseInt(getEnv("PORT", "3001"), 10),

  jwtSecret: getEnv("JWT_SECRET"),
  jwtExpiresIn: getEnv("JWT_EXPIRES_IN", "1d"),

  corsOrigin: getEnv("CORS_ORIGIN", "*"),

  database: {
    host: getEnv("DB_HOST", "localhost"),
    port: parseInt(getEnv("DB_PORT", "3306"), 10),
    name: getEnv("DB_NAME"),
    user: getEnv("DB_USER"),
    password: getEnv("DB_PASSWORD"),
  },

  upload: {
    directory: getEnv("UPLOAD_DIR", "uploads"),
    maxFileSize: parseInt(getEnv("UPLOAD_MAX_FILE_SIZE", "10485760"), 10),
  },
};

module.exports = env;
