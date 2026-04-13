const crypto = require("crypto");

function sha256Buffer(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function sha256String(text, encoding = "utf8") {
  return crypto.createHash("sha256").update(String(text), encoding).digest("hex");
}

module.exports = {
  sha256Buffer,
  sha256String,
};
