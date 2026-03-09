const dotenv = require("dotenv");

dotenv.config();

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

  port: parseInt(getEnv("PORT", "3000"), 10),

  jwtSecret: getEnv("JWT_SECRET", "dev_secret_change_in_production"),
  jwtExpiresIn: getEnv("JWT_EXPIRES_IN", "1d"),

  database: {
    host: getEnv("DB_HOST", "localhost"),
    port: parseInt(getEnv("DB_PORT", "3306"), 10),
    name: getEnv("DB_NAME", "sgt_db"),
    user: getEnv("DB_USER", "root"),
    password: getEnv("DB_PASSWORD", ""),
  },

  corsOrigin: getEnv("CORS_ORIGIN", "*"),

  upload: {
    directory: getEnv("UPLOAD_DIR", "uploads"),
    maxFileSize: parseInt(getEnv("UPLOAD_MAX_FILE_SIZE", "10485760"), 10),
  },
};

module.exports = env;
