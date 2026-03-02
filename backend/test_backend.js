const axios = require("axios");

async function test() {
  try {
    const response = await axios.get("http://localhost:3001/");
    console.log("Backend API is UP");
    console.log("Response:", response.data);
  } catch (error) {
    console.error("Backend API Error:", error.message);
  }
}

test();
