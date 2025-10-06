const express = require("express");
const app = express();

app.use(express.json()); // parse JSON body

// Health check
app.get("/", (_req, res) => res.send("Dialogflow webhook is alive ✅"));

// Main webhook endpoint (Dialogflow ES)
app.post("/webhook", async (req, res) => {
  try {
    const intentName = req.body?.queryResult?.intent?.displayName || "Unknown";
    const params = req.body?.queryResult?.parameters || {};

    let responseText = "I didn’t understand that.";

    // === Intent handlers ===
    if (intentName === "AskName") {
      // Your requested fixed answer
      responseText = "Your name is Sahil.";
    } else if (intentName === "GetTime") {
      const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      responseText = `The current time is ${now}.`;
    } else if (intentName === "GreetUser") {
      const name =
        params?.person?.name || params?.name || params?.given_name || "there";
      responseText = `Hello, ${name}! How can I help you today?`;
    }

    // === Minimal Dialogflow ES response ===
    return res.json({ fulfillmentText: responseText });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.json({
      fulfillmentText: "Sorry, something went wrong on the server.",
    });
  }
});

// Important for Render/other hosts
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Webhook server is running on port ${PORT}`)
);
