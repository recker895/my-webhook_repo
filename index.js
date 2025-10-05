const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());

// Serve static files (image, css, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Health check with background
app.get("/", (_req, res) => {
  res.send(`
    <html>
      <head>
        <style>
          body {
            margin: 0;
            height: 100vh;
            background: url('/background.png') no-repeat center center fixed;
            background-size: cover;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: Arial, sans-serif;
            color: white;
            text-shadow: 0 0 10px rgba(0,0,0,0.8);
          }
        </style>
      </head>
      <body>
        <h1>Dialogflow webhook is alive ✅</h1>
      </body>
    </html>
  `);
});

// Main webhook endpoint (Dialogflow ES)
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Webhook server is running on port ${PORT}`));
