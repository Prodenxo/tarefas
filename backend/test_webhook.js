const axios = require("axios");

async function test() {
  const payload = {
    event: "messages.upsert",
    instance: "Oficial",
    data: {
      key: {
        remoteJid: "test@s.whatsapp.net",
        fromMe: false,
      },
      message: {
        conversation: "CREATE TESTE_WEBHOOK",
      },
    },
  };

  try {
    const response = await axios.post(
      "http://localhost:3001/webhooks/whatsapp",
      payload,
    );
    console.log("Response Status:", response.status);
    console.log("Response Data:", response.data);
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.status : error.message,
    );
    if (error.response) console.error("Error Data:", error.response.data);
  }
}

test();
