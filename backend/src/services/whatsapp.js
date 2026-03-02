const axios = require("axios");

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

module.exports = { sendWhatsAppMessage };
