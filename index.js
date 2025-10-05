const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ---- Helper: load image and cache as base64 data URL ----
let dataUrl = null;
let imageError = null;

(function loadBackground() {
  try {
    // EXACT filename expected in your repo root
    const imgPath = path.join(__dirname, "unnamed.png");
    const buf = fs.readFileSync(imgPath);          // throws if not found
    const b64 = buf.toString("base64");
    dataUrl = `data:image/png;base64,${b64}`;
    console.log("✅ Background image loaded and inlined.");
  } catch (err) {
    imageError = err;
    console.error("❌ Could not load unnamed.png:", err.message);
  }
})();

// ---- Minimal debug routes (to help if it still fails) ----
app.get("/debug/files", (_req, res) => {
  try {
    const files = fs.readdirSync(__dirname);
    res.json({ cwd: __dirname, files });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.get("/debug/status", (_req, res) => {
  res.json({
    hasDataUrl: Boolean(dataUrl),
    imageError: imageError ? imageError.message : null,
    cwd: __dirname,
  });
});

// ---- Root page with inline background (no static paths!) ----
app.get("/", (_req, res) => {
  const bg = dataUrl
    ? `url('${dataUrl}')`
    : // fallback gradient if image failed to load
      "linear-gradient(135deg, #0b1021 0%, #1b6d7b 100%)";

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
        background: ${bg} no-repeat center center fixed;
        background-size: cover;
        display: flex; align-items: center; justify-content: center;
        font-family: system-ui, Arial, sans-serif; color: #fff;
        text-shadow: 0 0 12px rgba(0,0,0,.7);
      }
      .card {
        background: rgba(0,0,0,.45);
        padding: 18px 22px; border-radius: 12px;
        backdrop-filter: blur(2px);
      }
      .hint { font-size: 12px; opacity: .85; margin-top: 6px; }
      code { background: rgba(255,255,255,.15); padding: 2px 6px; border-radius: 6px; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Dialogflow webhook is alive ✅</h1>
      <div class="hint">
        ${
          dataUrl
            ? "Background loaded from <code>unnamed.png</code>."
            : "Using fallback gradient (image not found). Check <code>/debug/status</code>."
        }
      </div>
    </div>
  </body>
</html>
  `);
});

// ---- Dialogflow ES webhook (your original handlers) ----
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
  console.log(`🚀 Webhook server running on port ${PORT}`);
});
