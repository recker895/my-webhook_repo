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
      responseText = "Your name is Sahil.";
    } else if (intentName === "GetTime") {
      const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      responseText = `The current time is ${now}.`;
    } else if (intentName === "GreetUser") {
      const name =
        params?.person?.name || params?.name || params?.given_name || "there";
      responseText = `Hello, ${name}! How can I help you today?`;
    } else if (intentName === "AskTeammateName") {
      // User asks: "What is my teammate name?"
      responseText = "Your teammate name is Unnati.";
    } else if (intentName === "AskOtherTeammates") {
      // User asks: "What will be my other teammate names?"
      responseText = "Your other teammates are Abinav, Sejal and Arpan.";
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


