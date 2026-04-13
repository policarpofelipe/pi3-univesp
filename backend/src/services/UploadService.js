class UploadService {
  validar({ nomeArquivo, tipoMime, dadosBase64 }) {
    if (!nomeArquivo || !String(nomeArquivo).trim()) {
      throw Object.assign(new Error("nomeArquivo é obrigatório."), { statusCode: 400 });
    }
    if (!dadosBase64 || !String(dadosBase64).trim()) {
      throw Object.assign(new Error("dadosBase64 é obrigatório."), { statusCode: 400 });
    }

    const clean = String(dadosBase64).replace(/\s/g, "");
    const tamanhoBytes = Math.floor((clean.length * 3) / 4);
    return {
      nomeArquivo: String(nomeArquivo).trim(),
      tipoMime: String(tipoMime || "application/octet-stream").trim(),
      tamanhoBytes,
    };
  }
}

module.exports = new UploadService();
