const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const quadroRoutes = require("./routes/quadroRoutes");
const quadroMembroRoutes = require("./routes/quadroMembroRoutes");
const quadroPapelRoutes = require("./routes/quadroPapelRoutes");

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

/*
  Rotas públicas / base
*/
app.use("/api/auth", authRoutes);

/*
  Domínio de quadros
  Separação definida:
  - quadroRoutes: CRUD e configurações do quadro
  - quadroMembroRoutes: membros do quadro
  - quadroPapelRoutes: papéis do quadro
*/
app.use("/api/quadros", quadroRoutes);
app.use("/api/quadros", quadroMembroRoutes);
app.use("/api/quadros", quadroPapelRoutes);

/*
  404 da API
*/
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Rota não encontrada.",
  });
});

/*
  Tratamento central de erros
*/
app.use(errorMiddleware);

module.exports = app;