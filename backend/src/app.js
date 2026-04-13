const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const organizacaoRoutes = require("./routes/organizacaoRoutes");
const quadroRoutes = require("./routes/quadroRoutes");
const quadroMembroRoutes = require("./routes/quadroMembroRoutes");
const quadroPapelRoutes = require("./routes/quadroPapelRoutes");
const listaRoutes = require("./routes/listaRoutes");
const listaPermissaoRoutes = require("./routes/listaPermissaoRoutes");
const listaTransicaoRoutes = require("./routes/listaTransicaoRoutes");
const cartaoRoutes = require("./routes/cartaoRoutes");
const cartaoComentarioRoutes = require("./routes/cartaoComentarioRoutes");
const cartaoChecklistRoutes = require("./routes/cartaoChecklistRoutes");
const tagRoutes = require("./routes/tagRoutes");
const cartaoAnexoRoutes = require("./routes/cartaoAnexoRoutes");
const cartaoHistoricoRoutes = require("./routes/cartaoHistoricoRoutes");
const cartaoAtribuicaoRoutes = require("./routes/cartaoAtribuicaoRoutes");
const cartaoRelacaoRoutes = require("./routes/cartaoRelacaoRoutes");
const visaoRoutes = require("./routes/visaoRoutes");
const campoPersonalizadoRoutes = require("./routes/campoPersonalizadoRoutes");
const automacaoRoutes = require("./routes/automacaoRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "API funcionando corretamente.",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/organizacoes", organizacaoRoutes);
app.use("/api/quadros", quadroRoutes);
app.use("/api/quadros", quadroMembroRoutes);
app.use("/api/quadros", quadroPapelRoutes);
app.use("/api/quadros", listaRoutes);
app.use("/api/quadros", listaPermissaoRoutes);
app.use("/api/quadros", listaTransicaoRoutes);
app.use("/api/quadros", tagRoutes);
app.use("/api/quadros", cartaoComentarioRoutes);
app.use("/api/quadros", cartaoChecklistRoutes);
app.use("/api/quadros", cartaoAnexoRoutes);
app.use("/api/quadros", cartaoHistoricoRoutes);
app.use("/api/quadros", cartaoAtribuicaoRoutes);
app.use("/api/quadros", cartaoRelacaoRoutes);
app.use("/api/quadros", cartaoRoutes);
app.use("/api/quadros", visaoRoutes);
app.use("/api/quadros", campoPersonalizadoRoutes);
app.use("/api/quadros", automacaoRoutes);

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Rota não encontrada.",
  });
});

app.use(errorMiddleware);

module.exports = app;
