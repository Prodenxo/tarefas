const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Login
router.post("/login", async (req, res) => {
  try {
    console.log("[DEBUG] Headers:", req.headers);
    console.log("[DEBUG] Body:", req.body);
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: "Corpo da requisição vazio ou inválido.",
        received_body: req.body,
        content_type: req.headers["content-type"],
      });
    }
    const { email, password } = req.body;

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, is_superadmin: user.is_superadmin },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.json({
      message: "Login realizado com sucesso",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_superadmin: user.is_superadmin,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registro (Público)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Senha é obrigatória" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Por padrão novos usuários são colaboradores normais (pela tabela user_companies)
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash, active) VALUES (?, ?, ?, 1)",
      [name, email, hashedPassword],
    );

    res.status(201).json({
      message: "Usuário cadastrado com sucesso",
      user: { id: result.insertId, name, email, is_superadmin: 0 },
    });
  } catch (error) {
    console.error("ERRO NO REGISTRO:", error);
    res.status(500).json({
      message:
        error.code === "ER_DUP_ENTRY"
          ? "E-mail já cadastrado"
          : "Erro interno no servidor",
      error: error.message,
    });
  }
});

module.exports = router;
