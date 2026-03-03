const express = require("express");
const cors = require("cors");

const app = express();

// Liberação de CORS para permitir acesso de qualquer origem
app.use(
  cors({
    origin: true, // Permite qualquer origem que faça a requisição
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});

module.exports = app;
