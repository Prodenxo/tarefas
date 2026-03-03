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
    const instanceRaw = payload.instance || "ofc";
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

      // COMANDO: create [Título] para [Nome] data [DD/MM]
      const match = text.trim().match(/^create\s+(.*)$/i);
      if (match) {
        let fullText = match[1].trim();
        let title = fullText;
        let assignedToId = null;
        let assignedToName = null;
        let dueDate = null;

        // 1. EXTRAIR DATA (Ex: data 05/03)
        const dateMatch = fullText.match(
          /\bdata\s+(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/i,
        );
        if (dateMatch) {
          const day = dateMatch[1].padStart(2, "0");
          const month = dateMatch[2].padStart(2, "0");
          const year = dateMatch[3] || new Date().getFullYear();
          dueDate = `${year}-${month}-${day}`;
          title = title.replace(dateMatch[0], "").trim();
        }

        // 2. EXTRAIR RESPONSÁVEL (Ex: para Leonardo)
        const [allUsers] = await pool.query("SELECT id, name FROM users");
        const forMatch = fullText.match(/\bpara\s+([^\s\d]+)\b/i);
        if (forMatch) {
          const targetName = forMatch[1].toLowerCase();
          const userFound = allUsers.find((u) =>
            u.name.toLowerCase().includes(targetName),
          );
          if (userFound) {
            assignedToId = userFound.id;
            assignedToName = userFound.name;
            title = title.replace(forMatch[0], "").trim();
          }
        }

        // 3. BUSCAR USUÁRIO QUE ENVIOU
        const [users] = await pool.query(
          "SELECT u.id, u.name, uc.company_id FROM users u LEFT JOIN user_companies uc ON u.id = uc.user_id WHERE LOWER(u.wa_instance) = LOWER(?) OR (u.wa_instance IS NULL AND u.id = 1) LIMIT 1",
          [instanceName],
        );

        if (users.length > 0) {
          const creator = users[0];

          // 4. INSERIR TAREFA
          const [result] = await pool.query(
            "INSERT INTO tasks (company_id, created_by_user_id, assigned_to_user_id, title, status, due_date) VALUES (?, ?, ?, ?, 'Iniciada', ?)",
            [
              creator.company_id || 1,
              creator.id,
              assignedToId || creator.id, // Se não tiver, vai para quem criou
              `[Zap] ${title}`,
              dueDate,
            ],
          );

          console.log(
            `[Webhook] SUCESSO: Tarefa #${result.insertId} criada por ${creator.name} para ${assignedToName || creator.name}`,
          );

          // 5. RESPONDER NO WHATSAPP
          try {
            let replyText = `✅ *Tarefa registrada!* \n\n`;
            replyText += `📌 *ID:* ${result.insertId}\n`;
            replyText += `📌 *Título:* ${title}\n`;
            replyText += `👤 *Responsável:* ${assignedToName || creator.name}\n`;
            if (dueDate)
              replyText += `📅 *Prazo:* ${dateMatch[1]}/${dateMatch[2]}\n`;
            replyText += `🚀 *Status:* Iniciada`;

            await sendReply(instanceName, remoteJid, replyText);
          } catch (replyErr) {
            console.error("[Webhook] Erro ao responder:", replyErr.message);
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
// Rota simples para evitar erros de sintaxe na Vercel
// Usar .all ou .post sem parâmetros complexos para evitar erros na Vercel
router.post("/whatsapp", handleWebhook);
router.post("/whatsapp/messages-upsert", handleWebhook);
module.exports = router;
