const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const organizacaoRoutes = require("./routes/organizacaoRoutes");
const quadroRoutes = require("./routes/quadroRoutes");
const quadroMembroRoutes = require("./routes/quadroMembroRoutes");
const quadroPapelRoutes = require("./routes/quadroPapelRoutes");
const listaRoutes = require("./routes/listaRoutes");
const listaPermissaoRoutes = require("./routes/listaPermissaoRoutes");
const listaTransicaoRoutes = require("./routes/listaTransicaoRoutes");
const visaoRoutes = require("./routes/visaoRoutes");
const tagRoutes = require("./routes/tagRoutes");
const campoPersonalizadoRoutes = require("./routes/campoPersonalizadoRoutes");
const cartaoRoutes = require("./routes/cartaoRoutes");
const cartaoComentarioRoutes = require("./routes/cartaoComentarioRoutes");
const cartaoChecklistRoutes = require("./routes/cartaoChecklistRoutes");
const cartaoAnexoRoutes = require("./routes/cartaoAnexoRoutes");
const cartaoAtribuicaoRoutes = require("./routes/cartaoAtribuicaoRoutes");
const cartaoRelacaoRoutes = require("./routes/cartaoRelacaoRoutes");
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
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/organizacoes", organizacaoRoutes);
app.use("/api/quadros", quadroRoutes);
app.use("/api/quadro-membros", quadroMembroRoutes);
app.use("/api/quadro-papeis", quadroPapelRoutes);
app.use("/api/listas", listaRoutes);
app.use("/api/lista-permissoes", listaPermissaoRoutes);
app.use("/api/lista-transicoes", listaTransicaoRoutes);
app.use("/api/visoes", visaoRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/campos-personalizados", campoPersonalizadoRoutes);
app.use("/api/cartoes", cartaoRoutes);
app.use("/api/cartao-comentarios", cartaoComentarioRoutes);
app.use("/api/cartao-checklists", cartaoChecklistRoutes);
app.use("/api/cartao-anexos", cartaoAnexoRoutes);
app.use("/api/cartao-atribuicoes", cartaoAtribuicaoRoutes);
app.use("/api/cartao-relacoes", cartaoRelacaoRoutes);
app.use("/api/automacoes", automacaoRoutes);

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Rota não encontrada.",
  });
});

app.use(errorMiddleware);

module.exports = app;
