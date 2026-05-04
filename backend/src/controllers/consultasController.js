const consultaCnpjService = require("../services/consultaCnpjService");
const consultaEnderecoService = require("../services/consultaEnderecoService");

function responderErroConsulta(res, err, mensagem500) {
  const status = err.statusCode && Number.isFinite(err.statusCode) ? err.statusCode : 500;
  const message =
    status >= 500 ? mensagem500 : err.message || mensagem500;
  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error("[consultas]", err);
  }
  return res.status(status).json({
    success: false,
    message,
  });
}

async function consultarCnpj(req, res) {
  try {
    const result = await consultaCnpjService.consultarCnpj(req.params.cnpj);
    return res.status(200).json(result);
  } catch (err) {
    return responderErroConsulta(
      res,
      err,
      "Não foi possível consultar o CNPJ no momento."
    );
  }
}

async function consultarCep(req, res) {
  try {
    const result = await consultaEnderecoService.consultarCep(req.params.cep);
    return res.status(200).json(result);
  } catch (err) {
    return responderErroConsulta(
      res,
      err,
      "Não foi possível consultar o CEP informado."
    );
  }
}

module.exports = {
  consultarCnpj,
  consultarCep,
};
