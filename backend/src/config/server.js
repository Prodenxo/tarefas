const express = require("express");
const cors = require("cors");

const app = express();

// Liberação de CORS para permitir acesso de qualquer origem
app.use(
  cors({
    origin: "https://tarefas-one.vercel.app", // Define a origem exata para evitar bloqueios do Proxy
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
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
