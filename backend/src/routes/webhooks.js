const express = require("express");
const router = express.Router();
const pool = require("../config/database");

const handleWebhook = async (req, res) => {
  try {
    const payload = req.body;
    const eventRaw = payload.event || "";
    const event = eventRaw.toLowerCase();

    console.log(
      `[Vercel Hub] RECEBIDO: ${eventRaw} na instância: ${payload.instance}`,
    );

    // Suporte para messages.upsert e variações legadas
    if (event === "messages.upsert" || event === "messages_upsert") {
      const data = payload.data || {};
      const message = data.message || {};

      // Capturar texto de qualquer lugar (evitar undefined)
      const text =
        message.conversation ||
        message.extendedTextMessage?.text ||
        message.imageMessage?.caption ||
        "";

      console.log(`[Vercel Hub] Texto detectado: "${text}"`);

      const match = text.trim().match(/^create\s*(.*)$/i);
      if (match) {
        const title = match[1].trim() || "Nova tarefa via WhatsApp";
        const instanceRaw = payload.instance || "";
        const instanceName = instanceRaw.split(":")[0];

        // LOG DO BANCO: Buscar quem é o dono dessa instância
        const [users] = await pool.query(
          "SELECT id, company_id FROM users WHERE LOWER(wa_instance) = LOWER(?) OR id = 1 LIMIT 1",
          [instanceName],
        );

        if (users.length > 0) {
          const user = users[0];
          await pool.query(
            "INSERT INTO tasks (company_id, created_by_user_id, title, status) VALUES (?, ?, ?, 'Iniciada')",
            [user.company_id || 1, user.id, `[Zap] ${title}`],
          );
          console.log(
            `[Vercel Hub] SUCESSO: Tarefa "${title}" criada para Usuário ${user.id}`,
          );
        } else {
          console.log(
            `[Vercel Hub] ERRO: Nenhuma conta vinculada à instância "${instanceName}"`,
          );
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("[Vercel Hub] ERRO CRÍTICO NO WEBHOOK:", error);
    res.status(500).json({ error: error.message });
  }
};

router.post("/whatsapp", handleWebhook);
module.exports = router;
