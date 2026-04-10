const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const organizacaoRoutes = require("./routes/organizacaoRoutes");
const quadroRoutes = require("./routes/quadroRoutes");
const quadroMembroRoutes = require("./routes/quadroMembroRoutes");
const quadroPapelRoutes = require("./routes/quadroPapelRoutes");
const listaRoutes = require("./routes/listaRoutes");
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

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Rota não encontrada.",
  });
});

app.use(errorMiddleware);

module.exports = app;
