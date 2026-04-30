module.exports = function errorMiddleware(error, req, res, next) {
  console.error(error);

  const statusCode = error.statusCode || 500;
  const message = error.message || "Erro interno do servidor.";
  const code = error.code || "INTERNAL_ERROR";

  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
      message,
    },
  });
};
