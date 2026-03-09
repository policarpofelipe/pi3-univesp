const app = require("./src/app");

const PORT = process.env.PORT || 3000;
const HOST = process.env.IP || "127.0.0.1";

app.listen(PORT, HOST, () => {
  console.log(`API rodando em http://${HOST}:${PORT}`);
});
