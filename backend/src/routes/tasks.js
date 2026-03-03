const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { sendWhatsAppMessage } = require("../services/whatsapp");
console.log(">>> LOADING TASKS ROUTER <<<");

// Listar tarefas da empresa atual com lógica de visibilidade
router.get("/", async (req, res) => {
  try {
    const { company_id, user_id } = req.query;
    if (!company_id) {
      return res.status(400).json({ message: "ID da empresa é obrigatório." });
    }

    let query =
      "SELECT t.*, u.name as creator_name FROM tasks t INNER JOIN users u ON t.created_by_user_id = u.id WHERE t.company_id = ?";
    let params = [company_id];

    // Se um user_id for fornecido e o usuário tiver permissão, filtra por ele
    if (user_id) {
      if (
        req.user.role === "gestor" ||
        req.user.role === "superadmin" ||
        req.user.role === "admin"
      ) {
        query += " AND (t.created_by_user_id = ? OR t.assigned_to_user_id = ?)";
        params.push(user_id, user_id);
      } else {
        query += " AND (t.created_by_user_id = ? OR t.assigned_to_user_id = ?)";
        params.push(req.user.id, req.user.id);
      }
    } else {
      if (
        req.user.role !== "gestor" &&
        req.user.role !== "superadmin" &&
        req.user.role !== "admin"
      ) {
        query += " AND (t.created_by_user_id = ? OR t.assigned_to_user_id = ?)";
        params.push(req.user.id, req.user.id);
      }
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar tarefas em massa
router.post("/bulk-delete", async (req, res) => {
  console.log("[API] Recebida solicitação de exclusão em massa:", req.body);
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Nenhum ID fornecido." });
    }

    await pool.query("DELETE FROM tasks WHERE id IN (?)", [ids]);
    res.json({ message: `${ids.length} tarefas deletadas com sucesso.` });
  } catch (error) {
    console.error("[API] Erro na exclusão em massa:", error);
    res.status(500).json({ error: error.message });
  }
});

// Criar nova tarefa
router.post("/", async (req, res) => {
  try {
    const { title, status, company_id, due_date } = req.body;

    if (!title || !company_id) {
      return res
        .status(400)
        .json({ message: "Título e ID da empresa são obrigatórios." });
    }

    const [result] = await pool.query(
      "INSERT INTO tasks (company_id, created_by_user_id, assigned_to_user_id, title, status, due_date) VALUES (?, ?, ?, ?, ?, ?)",
      [
        company_id,
        req.user.id,
        req.user.id,
        title,
        status || "Iniciada",
        due_date || null,
      ],
    );

    // Enviar notificação por WhatsApp (Opcional)
    try {
      // Buscar o telefone do criador
      const [userRows] = await pool.query(
        "SELECT whatsapp_number, email FROM users WHERE id = ?",
        [req.user.id],
      );
      if (userRows.length > 0 && userRows[0].whatsapp_number) {
        // Enviar mensagem para o número de WhatsApp do usuário
        await sendWhatsAppMessage(
          userRows[0].whatsapp_number,
          `✅ Nova tarefa criada: *${title}* \nStatus: ${status || "Iniciada"}`,
        );
      }
    } catch (wsErr) {
      console.error("[WhatsApp Integration] Falha no aviso:", wsErr.message);
    }

    res.status(201).json({
      id: result.insertId,
      title,
      status: status || "Iniciada",
      due_date: due_date || null,
      created_by_user_id: req.user.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar tarefa (Título, Status e Due Date)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status, due_date } = req.body;

    let query =
      "UPDATE tasks SET title = ?, status = ?, due_date = ? WHERE id = ?";
    let params = [title, status, due_date, id];

    await pool.query(query, params);
    res.json({ message: "Tarefa atualizada com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar status da tarefa (Simplificado)
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.query("UPDATE tasks SET status = ? WHERE id = ?", [status, id]);
    res.json({ message: "Status atualizado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar tarefa
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Apenas quem criou ou superadmin/gestor pode deletar?
    // Vamos simplificar para permitir deletar por enquanto.
    await pool.query("DELETE FROM tasks WHERE id = ?", [id]);
    res.json({ message: "Tarefa deletada com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
