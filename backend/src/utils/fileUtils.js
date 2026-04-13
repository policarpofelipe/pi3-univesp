/** Alinhado ao limite de anexos de cartão (5 MB). */
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function sanitizeFilename(name) {
  return String(name).replace(/[<>:"/\\|?*\x00-\x1F]/g, "_");
}

module.exports = {
  MAX_UPLOAD_BYTES,
  sanitizeFilename,
};
