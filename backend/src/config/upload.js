const multer = require("multer");
const path = require("path");
const fs = require("fs");
const env = require("./env");

const uploadDir = path.resolve(env.upload.directory);

// garante que a pasta de uploads exista
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);

    const ext = path.extname(file.originalname);
    const name = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, "_");

    const filename = `${timestamp}_${random}_${name}${ext}`;

    cb(null, filename);
  },
});

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/zip",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

function fileFilter(req, file, cb) {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de arquivo não permitido."), false);
  }
}

const upload = multer({
  storage,
  limits: {
    fileSize: env.upload.maxFileSize,
  },
  fileFilter,
});

module.exports = upload;
