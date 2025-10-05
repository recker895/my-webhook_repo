const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());

// ✅ Serve files from the project root (so /unnamed.png works)
app.use(express.static(__dirname));

// ✅ Root page with your image as background
app.get("/", (_req, res) => {
  res.type("html").send(`
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Dialogflow Webhook</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body { height: 100%; margin: 0; }
      body {
        background: url('/unnamed.png') no-repeat center center fixed;
        background-size: cover;
        display: flex; align-items: center; justify-content: center;
        font-family: system-ui, Arial, sans-serif; color: #fff;
        text-shadow: 0 0 12px rgba(0,0,0,.6);
      }
      h1 { font-weight: 700; }
    </style>
  </head>
  <body>
    <h1>Dialogflow webhook is alive ✅</h1>
  </body>
</html>
  `);
});

// === Dialogflow ES webhook endpoint (unchanged) ===
app.post("/webhook", async (req, res) => {
  try {
    const intentName = req.body?.queryResult?.intent?.displayName || "Unknown";
    const params = req.body?.queryResult?.parameters || {};

    let responseText = "I didn’t understand that.";

    if (intentName === "AskName") {
      responseText = "Your name is Sahil.";
    } else if (intentName === "GetTime") {
      const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      responseText = `The current time is ${now}.`;
    } else if (intentName === "GreetUser") {
      const name = params?.person?.name || params?.name || params?.given_name || "there";
      responseText = `Hello, ${name}! How can I help you today?`;
    }

    return res.json({ fulfillmentText: responseText });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.json({ fulfillmentText: "Sorry, something went wrong on the server." });
  }
});

// Important for Render/other hosts
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Webhook server is running on port ${PORT}`));

