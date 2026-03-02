const axios = require("axios");

async function test() {
  try {
    const response = await axios.get(
      "http://localhost:8080/instance/fetchInstances",
      {
        headers: {
          apikey: "96185328",
        },
      },
    );
    console.log("Evolution API is UP");
    console.log("Response:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("Evolution API Error:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
  }
}

test();
