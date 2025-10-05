const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ---- DEBUG REQUEST LOGGING ----
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ---- STATIC SERVE FROM REPO ROOT (so /unnamed.png works) ----
app.use(express.static(__dirname, {
  fallthrough: true,
}));

// ---- EXTRA: explicit route for the same image (/bg.png) ----
app.get("/bg.png", (_req, res) => {
  const filePath = path.join(__dirname, "unnamed.png");
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("sendFile error for /bg.png:", err);
      res.status(err.statusCode || 500).end();
    }
  });
});

// ---- STATUS PAGE WITH BACKGROUND ----
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
        /* Try both paths; first is the explicit route, second is direct file */
        background:
          url('/bg.png') no-repeat center center fixed,
          url('/unnamed.png') no-repeat center center fixed;
        background-size: cover;
        display: flex; align-items: center; justify-content: center;
        font-family: system-ui, Arial, sans-serif; color: #fff;
        text-shadow: 0 0 12px rgba(0,0,0,.7);
      }
      h1 { font-weight: 700; }
      .hint {
        position: fixed; left: 12px; bottom: 12px; font-size: 12px; opacity: .8;
      }
    </style>
  </head>
  <body>
    <h1>Dialogflow webhook is alive ✅</h1>
    <div class="hint">If you don't see the image, open /bg.png or /unnamed.png directly.</div>
  </body>
</html>
  `);
});

// ---- DIALOGFLOW ES WEBHOOK (your original logic) ----
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

app.listen(PORT, () => {
  console.log(`🚀 Webhook server is running on port ${PORT}`);
});
