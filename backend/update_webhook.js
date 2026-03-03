const axios = require("axios");
require("dotenv").config();

async function updateWebhook() {
  try {
    const response = await axios.post(
      "https://trainee-teste-api-whatsapp-v2.k6fcpj.easypanel.host/webhook/set/ofc",
      {
        url: "https://gestor-de-tarefas-leonardo-api.vercel.app/webhooks/whatsapp",
        webhookByEvents: false,
        events: ["MESSAGES_UPSERT"],
      },
      {
        headers: {
          apikey: "96185328",
          "Content-Type": "application/json",
        },
      },
    );
    console.log("Webhook updated successfully:", response.data);
    process.exit(0);
  } catch (err) {
    console.error("Error updating webhook:", err.response?.data || err.message);
    process.exit(1);
  }
}

updateWebhook();
