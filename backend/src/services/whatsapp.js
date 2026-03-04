const axios = require("axios");
const fs = require("fs");
const path = require("path");

const sendWhatsAppMessage = async (number, message) => {
  try {
    const apiUrl = process.env.EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;
    const instance = process.env.EVOLUTION_INSTANCE || "main"; // Nome da instância que você criou no manager

    if (!apiUrl || !apiKey) {
      console.warn(
        "[WhatsApp Service] Credenciais não configuradas. Mensagem não enviada.",
      );
      return;
    }

    // Limpa o número para garantir que tenha apenas dígitos
    const cleanNumber = number.replace(/\D/g, "");

    const payload = {
      number: cleanNumber,
      text: message,
    };

    console.log(`[WhatsApp Service] Enviando para ${cleanNumber}...`);

    const response = await axios.post(
      `${apiUrl}/message/sendText/${instance}`,
      payload,
      {
        headers: {
          apikey: apiKey,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      "[WhatsApp Service] Erro ao enviar mensagem:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

const downloadMedia = async (instance, messageId) => {
  try {
    const apiUrl = process.env.EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;

    if (!apiUrl || !apiKey) {
      throw new Error(
        "[WhatsApp Service] Credenciais de download não configuradas.",
      );
    }

    const response = await axios.get(
      `${apiUrl}/message/getBase64FromMediaMessage/${instance}`,
      {
        params: { messageId, convertToMp4: false },
        headers: { apikey: apiKey },
      },
    );

    if (response.data && response.data.base64) {
      // Salva o base64 como arquivo físico para o Whisper ler
      const buffer = Buffer.from(response.data.base64, "base64");
      const tempPath = path.join(
        __dirname,
        "../../tmp",
        `audio_${messageId}.ogg`,
      );

      // Cria a pasta tmp se não existir
      if (!fs.existsSync(path.join(__dirname, "../../tmp"))) {
        fs.mkdirSync(path.join(__dirname, "../../tmp"), { recursive: true });
      }

      fs.writeFileSync(tempPath, buffer);
      return tempPath;
    }

    throw new Error("Base64 da mídia não retornado pela Evolution API.");
  } catch (error) {
    console.error(
      "[WhatsApp Service] Erro no downloadMedia:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

module.exports = { sendWhatsAppMessage, downloadMedia };
