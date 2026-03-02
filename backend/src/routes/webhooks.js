const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const fs = require("fs");
const path = require("path");

const logWebhook = (data) => {
  const logPath = path.join(__dirname, "../../webhook_debug.log");
  const timestamp = new Date().toISOString();
  fs.appendFileSync(
    logPath,
    `\n[${timestamp}] ${JSON.stringify(data, null, 2)}\n`,
  );
};

const handleWebhook = async (req, res) => {
  try {
    const payload = req.body;
    logWebhook(payload);
    const { event, instance, data } = payload;

    console.log(
      `[Webhook] Evento recebido: ${event} na instância: ${instance}`,
    );

    if (event === "messages.upsert") {
      const message = data.message;
      if (!message) return res.sendStatus(200);

      const remoteJid = data.key.remoteJid;
      const fromMe = data.key.fromMe;

      console.log(
        `[Webhook Debug] fromMe: ${fromMe}, messageType: ${data.messageType}`,
      );
      console.log(
        `[Webhook Debug] Message Content:`,
        JSON.stringify(message, null, 2),
      );

      let taskTitle = "";
      const text =
        message.conversation ||
        message.extendedTextMessage?.text ||
        message.imageMessage?.caption ||
        message.videoMessage?.caption ||
        "";

      if (text) {
        const trimmedText = text.trim();
        console.log(
          `[Webhook Debug] Texto recebido: "${trimmedText}" (fromMe: ${fromMe})`,
        );

        // Regex para capturar "create" seguido de qualquer coisa
        // Agora aceita apenas "create" ou "create algo"
        const match = trimmedText.match(/^create\s*(.*)$/i);
        if (match) {
          taskTitle = match[1].trim() || "Nova tarefa via WhatsApp";
          console.log(
            `[Webhook Debug] Comando 'create' detectado! Título extraído: "${taskTitle}"`,
          );
        }
      }

      // 3. Verificar se é áudio e tem transcrição
      else if (message.audioMessage || data.messageType === "audioMessage") {
        // Áudios costumam ser intenções diretas, então mantemos a criação automática se houver transcrição
        taskTitle = message.transcription || data.transcription || "";
        if (!taskTitle) {
          console.log("[Webhook] Áudio recebido sem transcrição ainda.");
          return res.sendStatus(200);
        }
      }
      if (taskTitle) {
        console.log(
          `[Webhook] Criando tarefa: "${taskTitle}" para a instância ${instance}`,
        );

        // Buscar o usuário dono desta instância
        const [users] = await pool.query(
          `SELECT u.id, uc.company_id 
           FROM users u 
           LEFT JOIN user_companies uc ON u.id = uc.user_id 
           WHERE u.wa_instance = ? LIMIT 1`,
          [instance],
        );

        console.log(
          `[Webhook Debug] Usuários encontrados para a instância "${instance}":`,
          users.length,
        );

        if (users.length > 0) {
          const user = users[0];
          const companyId = user.company_id;

          if (companyId) {
            // Criar a tarefa
            await pool.query(
              "INSERT INTO tasks (company_id, created_by_user_id, title, status) VALUES (?, ?, ?, 'Iniciada')",
              [companyId, user.id, `[Zap] ${taskTitle}`],
            );
            console.log(
              `[Webhook] Tarefa criada com sucesso para o usuário ${user.id}`,
            );
          } else {
            console.log(
              `[Webhook] Usuário ${user.id} encontrado, mas não está vinculado a nenhuma empresa.`,
            );
          }
        } else {
          console.log(
            `[Webhook] Nenhuma conta vinculada à instância "${instance}"`,
          );
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("[Webhook Error]:", error);
    res.status(500).json({ error: error.message });
  }
};

// Webhook para receber eventos da Evolution API
router.post("/whatsapp", handleWebhook);
router.post("/whatsapp/:event", handleWebhook);

module.exports = router;
