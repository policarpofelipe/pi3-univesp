const multer = require("multer");
const { MAX_UPLOAD_BYTES } = require("../utils/fileUtils");

/**
 * Upload em memória para anexos de cartão (multipart).
 * Limite alinhado ao cartaoAnexoService (5 MB).
 *
 * @param {object} [options]
 * @param {string} [options.fieldName='arquivo']
 * @param {number} [options.maxBytes]
 * @returns {import('express').RequestHandler}
 */
function createMemorySingleUpload(options = {}) {
  const fieldName = options.fieldName || "arquivo";
  const maxBytes = Number.isInteger(options.maxBytes) && options.maxBytes > 0
    ? options.maxBytes
    : MAX_UPLOAD_BYTES;

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxBytes },
  });

  return upload.single(fieldName);
}

/**
 * Trata erros do Multer (tamanho, etc.) com resposta JSON padronizada.
 */
function handleMulterError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Arquivo excede o tamanho máximo permitido.",
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message || "Falha no upload do arquivo.",
    });
  }
  return next(err);
}

module.exports = {
  createMemorySingleUpload,
  cartaoAnexoUpload: createMemorySingleUpload({
    fieldName: "arquivo",
    maxBytes: MAX_UPLOAD_BYTES,
  }),
  handleMulterError,
};
