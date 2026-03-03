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

      // Evitar loops: não processa se a mensagem foi enviada por mim mesmo
      if (key.fromMe) return res.sendStatus(200);

      // Tentar capturar texto de diversas formas (Texto simples, Texto estendido, Legenda de imagem/vídeo)
      let text =
        message.conversation ||
        message.extendedTextMessage?.text ||
        message.imageMessage?.caption ||
        message.videoMessage?.caption ||
        "";

      // Se não houver texto, verificar se a Evolution API já forneceu transcrição em algum campo customizado
      if (!text && data.message && typeof data.message === "string")
        text = data.message;

      // Se for apenas áudio sem transcrição ainda
      const isAudio = !!message.audioMessage;

      if (!text && isAudio) {
        console.log(`[Webhook] Áudio recebido de ${remoteJid}.`);
        // Aqui poderíamos integrar com Whisper futuramente se necessário
        await sendReply(
          instanceName,
          remoteJid,
          "🎙️ *Recebi seu áudio!* Por favor, mande o comando escrito `create [título]` ou aguarde a implementação da transcrição automática.",
        );
        return res.sendStatus(200);
      }

      if (!text) return res.sendStatus(200);

      console.log(`[Webhook] Texto detectado: "${text}" de: ${remoteJid}`);

      // COMANDO: create [Título da Tarefa]
      const match = text.trim().match(/^create\s+(.*)$/i);
      if (match) {
        const title = match[1].trim() || "Nova tarefa via WhatsApp";

        // Localizar o usuário vinculado a esta instância de WhatsApp
        // Se a instância for "zap", buscamos quem tem wa_instance = "zap"
        // Como fallback, tentamos id=1 (o primeiro admin) se não houver vínculo específico
        const [users] = await pool.query(
          "SELECT id, company_id, name FROM users WHERE LOWER(wa_instance) = LOWER(?) OR (wa_instance IS NULL AND id = 1) LIMIT 1",
          [instanceName],
        );

        if (users.length > 0) {
          const user = users[0];

          await pool.query(
            "INSERT INTO tasks (company_id, created_by_user_id, title, status, description) VALUES (?, ?, ?, 'Pendente', ?)",
            [
              user.company_id || 1,
              user.id,
              `[Zap] ${title}`,
              `Criada via WhatsApp por "${user.name}" (${remoteJid})`,
            ],
          );

          console.log(
            `[Webhook] SUCESSO: Tarefa "${title}" criada para ${user.name}`,
          );

          // Responder ao usuário no WhatsApp com confirmação
          await sendReply(
            instanceName,
            remoteJid,
            `✅ *Tarefa registrada com sucesso!* \n\n📌 *Título:* ${title}\n👤 *Para:* ${user.name}\n🚀 *Status:* Pendente\n\n_Para ver na plataforma, acesse o painel._`,
          );
        } else {
          console.log(
            `[Webhook] ERRO: Nenhuma conta vinculada à instância "${instanceName}"`,
          );
          await sendReply(
            instanceName,
            remoteJid,
            `⚠️ *Erro de Configuração:* Sua conta de WhatsApp não está vinculada a nenhum usuário no Gestor de Tarefas.`,
          );
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("[Webhook] ERRO CRÍTICO NO WEBHOOK:", error);
    res.status(500).json({ error: error.message });
  }
};

router.post("/whatsapp", handleWebhook);
module.exports = router;
