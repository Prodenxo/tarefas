const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const axios = require("axios");

// Função auxiliar para enviar resposta via WhatsApp
const sendReply = async (instance, number, text) => {
  try {
    const apiUrl = process.env.EVOLUTION_API_URL || "http://localhost:8080";
    const apiKey = process.env.EVOLUTION_API_KEY || "96185328";

    // Limpar o número (remover prefixo se houver @s.whatsapp.net)
    const cleanNumber = number.split("@")[0].replace(/\D/g, "");

    await axios.post(
      `${apiUrl}/message/sendText/${instance}`,
      {
        number: cleanNumber,
        text: text,
        linkPreview: true,
      },
      { headers: { apikey: apiKey } },
    );
  } catch (err) {
    console.error(`[Webhook Reply Error]`, err.response?.data || err.message);
  }
};

const handleWebhook = async (req, res) => {
  try {
    const payload = req.body;
    const event = (payload.event || "").toLowerCase().replace("_", ".");
    const instanceRaw = payload.instance || "zap";
    const instanceName = instanceRaw.split(":")[0];

    // Ignorar eventos irrelevantes para economizar log
    if (event === "presence.update" || event === "messages.update") {
      return res.sendStatus(200);
    }

    console.log(
      `[Webhook] RECEBIDO: "${event}" na instância: "${instanceName}"`,
    );

    if (event === "messages.upsert") {
      const data = payload.data || {};
      const key = data.key || {};
      const message = data.message || {};
      const remoteJid = key.remoteJid || "";

      // Capturar texto de diversas formas
      let text =
        message.conversation ||
        message.extendedTextMessage?.text ||
        message.imageMessage?.caption ||
        message.videoMessage?.caption ||
        "";

      if (!text && data.message && typeof data.message === "string")
        text = data.message;

      console.log(
        `[Webhook] Texto: "${text}" de: ${remoteJid} (fromMe: ${key.fromMe})`,
      );

      // COMANDO: create [Título da Tarefa]
      const match = text.trim().match(/^create\s+(.*)$/i);
      if (match) {
        const title = match[1].trim() || "Nova tarefa via WhatsApp";

        const [users] = await pool.query(
          "SELECT id, company_id, name FROM users WHERE LOWER(wa_instance) = LOWER(?) OR (wa_instance IS NULL AND id = 1) LIMIT 1",
          [instanceName],
        );

        if (users.length > 0) {
          const user = users[0];

          const [result] = await pool.query(
            "INSERT INTO tasks (company_id, created_by_user_id, title, status, description) VALUES (?, ?, ?, 'Pendente', ?)",
            [
              user.company_id || 1,
              user.id,
              `[Zap] ${title}`,
              `Criada via WhatsApp por "${user.name}" (${remoteJid})`,
            ],
          );

          console.log(
            `[Webhook] SUCESSO: Tarefa #${result.insertId} criada para ${user.name}`,
          );

          // Tentar responder, mas não falhar o webhook se a API estiver inacessível
          try {
            await sendReply(
              instanceName,
              remoteJid,
              `✅ *Tarefa registrada!* \n\n📌 *ID:* ${result.insertId}\n📌 *Título:* ${title}\n👤 *Para:* ${user.name}\n🚀 *Status:* Pendente`,
            );
          } catch (replyErr) {
            console.error(
              "[Webhook] Falha ao enviar resposta (URL da API inacessível):",
              replyErr.message,
            );
          }
        } else {
          console.log(
            `[Webhook] ERRO: Sem usuário para instância "${instanceName}"`,
          );
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("[Webhook] ERRO CRÍTICO:", error);
    res.status(500).json({ error: error.message });
  }
};

// Usar r* para capturar qualquer sub-rota (ex: /whatsapp/connection-update)
router.post("/whatsapp", handleWebhook);
module.exports = router;
