const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (so /unnamed.png works)
app.use(express.static(__dirname));
app.use(bodyParser.json());

// Root route → show page with background + Dialogflow Messenger
app.get("/", (_req, res) => {
  res.type("html").send(`
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>SDG Chatbot</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1"></script>
  <style>
    html, body { height: 100%; margin: 0; }
    body {
      background: url('/unnamed.png') no-repeat center center fixed;
      background-size: cover;
      font-family: system-ui, -apple-system, Arial, sans-serif;
    }
    df-messenger {
      --df-messenger-bot-message: #e8f0fe;
      --df-messenger-user-message: #fff;
      --df-messenger-font-color: #0b1021;
      --df-messenger-chat-background: rgba(12,18,34,0.55);
      --df-messenger-send-icon: #0b57d0;
      --df-messenger-button-titlebar-color: #0b57d0;
      position: fixed;
      right: 24px;
      bottom: 24px;
      z-index: 9999;
    }
  </style>
</head>
<body>
  <df-messenger
      intent="WELCOME"
      chat-title="SDG Chatbot"
      agent-id="YOUR-AGENT-ID"
      language-code="en">
  </df-messenger>
</body>
</html>
  `);
});

// Dialogflow Webhook endpoint
app.post("/webhook", (req, res) => {
  const tag = req.body.fulfillmentInfo?.tag || "";
  let responseText = "I didn’t understand that.";

  if (tag === "get_name") {
    responseText = "My name is Shreya!";
  }

  res.json({
    fulfillment_response: {
      messages: [{ text: { text: [responseText] } }],
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

