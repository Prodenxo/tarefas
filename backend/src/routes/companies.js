const express = require("express");
const router = express.Router();
const pool = require("../config/database");

// Listar empresas vinculadas ao usuário logado
router.get("/", async (req, res) => {
  try {
    let rows;
    if (req.user.role === "superadmin") {
      // Superadmin vê todas
      [rows] = await pool.query("SELECT * FROM companies");
    } else {
      // Outros usuários vêem apenas as vinculadas
      [rows] = await pool.query(
        "SELECT c.* FROM companies c INNER JOIN user_companies uc ON c.id = uc.company_id WHERE uc.user_id = ?",
        [req.user.id],
      );
    }
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar empresa por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM companies WHERE id = ?", [
      id,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ message: "Empresa não encontrada" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar nova empresa (Apenas Superadmin)
router.post("/", async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Apenas Super Admins podem criar empresas." });
    }

    const { name, address, website, active } = req.body;
    const [result] = await pool.query(
      "INSERT INTO companies (name, address, website, active) VALUES (?, ?, ?, ?)",
      [name, address, website, active !== undefined ? active : 1],
    );
    res
      .status(201)
      .json({ id: result.insertId, name, address, website, active });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar empresa (Apenas Superadmin)
router.put("/:id", async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Apenas Super Admins podem editar empresas." });
    }

    const { id } = req.params;
    const { name, address, website, active } = req.body;
    await pool.query(
      "UPDATE companies SET name = ?, address = ?, website = ?, active = ? WHERE id = ?",
      [name, address, website, active, id],
    );
    res.json({ message: "Empresa atualizada com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar empresa (Apenas Superadmin)
router.delete("/:id", async (req, res) => {
  try {
    if (req.user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Apenas Super Admins podem deletar empresas." });
    }
    const { id } = req.params;
    await pool.query("DELETE FROM companies WHERE id = ?", [id]);
    res.json({ message: "Empresa deletada com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- NOVAS ROTAS DE VÍNCULO ---

// Listar usuários vinculados a uma empresa
router.get("/:id/users", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT u.id, u.name, u.email FROM users u INNER JOIN user_companies uc ON u.id = uc.user_id WHERE uc.company_id = ?",
      [id],
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vincular usuário a uma empresa
router.post("/:id/users", async (req, res) => {
  try {
    const { id } = req.params; // company_id
    const { userId } = req.body;

    // Permissão: Superadmin ou Gestor vinculado à empresa
    if (req.user.role !== "superadmin") {
      const [check] = await pool.query(
        "SELECT * FROM user_companies WHERE user_id = ? AND company_id = ?",
        [req.user.id, id],
      );
      if (check.length === 0 || req.user.role !== "gestor") {
        return res.status(403).json({
          message:
            "Acesso negado. Apenas Gestores desta empresa ou Superadmins podem vincular usuários.",
        });
      }
    }

    await pool.query(
      "INSERT INTO user_companies (user_id, company_id) VALUES (?, ?)",
      [userId, id],
    );
    res.status(201).json({ message: "Usuário vinculado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Desvincular usuário de uma empresa
router.delete("/:id/users/:userId", async (req, res) => {
  try {
    const { id, userId } = req.params;

    // Permissão: Superadmin ou Gestor vinculado à empresa
    if (req.user.role !== "superadmin") {
      // Gestor não pode se desvincular sozinho (apenas Superadmin pode desvincular Gestores ativos)
      if (req.user.id.toString() === userId.toString()) {
        return res.status(403).json({
          message:
            "Gestores não podem se desvincular sozinhos. Entre em contato com um Superadmin.",
        });
      }

      const [check] = await pool.query(
        "SELECT * FROM user_companies WHERE user_id = ? AND company_id = ?",
        [req.user.id, id],
      );
      if (check.length === 0 || req.user.role !== "gestor") {
        return res.status(403).json({
          message:
            "Acesso negado. Apenas Gestores desta empresa ou Superadmins podem desvincular usuários.",
        });
      }
    }

    await pool.query(
      "DELETE FROM user_companies WHERE user_id = ? AND company_id = ?",
      [userId, id],
    );
    res.json({ message: "Usuário desvinculado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
