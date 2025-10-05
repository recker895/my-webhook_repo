const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Root route
app.get("/", (req, res) => {
  res.send("Dialogflow webhook is alive ✅");
});

// Webhook endpoint
app.post("/webhook", (req, res) => {
  const intent = req.body.queryResult.intent.displayName;

  let responseText = "Default response";

  if (intent === "GetTime") {
    const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    responseText = `The current time in India is ${now}`;
  } else if (intent === "GreetUser") {
    const name = req.body.queryResult.parameters["person"]
      ? req.body.queryResult.parameters["person"].name
      : "there";
    responseText = `Hello ${name}, nice to meet you!`;
  }

  res.json({ fulfillmentText: responseText });
});

// ✅ Important: use Render's PORT environment variable
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Webhook server is running on port ${PORT}`);
});
