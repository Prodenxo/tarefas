const express = require("express");
const cors = require("cors");

const app = express();

// Liberação de CORS manual para máxima compatibilidade com EasyPanel/Nginx
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://tarefas-one.vercel.app",
    "https://tarefas-seven.vercel.app",
    "https://tarefas-seven-prodenxo-projects.vercel.app",
  ];
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    // Fallback para permitir qualquer vercel
    if (origin && origin.includes("vercel.app")) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else {
      res.setHeader("Access-Control-Allow-Origin", "*");
    }
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});

module.exports = app;
