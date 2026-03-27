const express = require("express");
const fetch = require("node-fetch");
const crypto = require("crypto");

const app = express();
app.use(express.static("public"));
app.set("trust proxy", true);

let sessions = {};
let cooldown = {};

// CLEAN SESSION (chống lag RAM)
setInterval(() => {
  const now = Date.now();
  for (let key in sessions) {
    if (now - sessions[key].created > 60000) {
      delete sessions[key];
    }
  }
}, 30000);

// GET LINK
app.get("/getlink", async (req, res) => {
  const ip = req.ip;

  // chống spam
  if (cooldown[ip] && Date.now() - cooldown[ip] < 10000) {
    return res.json({ error: "⏳ Chậm lại 10s!" });
  }

  cooldown[ip] = Date.now();

  const session = crypto.randomBytes(8).toString("hex");

  try {
    const response = await fetch("https://api.layma.net/api/admin/shortlink/quicklink?tokenUser=9e46fe261914b8e0623b4ab4488dc2ed&format=json&url=https://google.com&link_du_phong=https://google.com");
    const data = await response.json();

    if (data.success) {
      sessions[session] = {
        ip: ip,
        created: Date.now(),
        verified: false
      };

      res.json({
        link: data.html,
        session: session
      });
    } else {
      res.json({ error: "API lỗi!" });
    }
  } catch {
    res.json({ error: "Server lỗi!" });
  }
});

// VERIFY CLICK
app.get("/verify", (req, res) => {
  const { session } = req.query;

  if (sessions[session]) {
    sessions[session].verified = true;
    res.send("OK");
  } else {
    res.send("Session lỗi");
  }
});

// GET KEY
app.get("/getkey", (req, res) => {
  const { session } = req.query;
  const ip = req.ip;

  const s = sessions[session];

  if (!s) return res.json({ error: "❌ Session lỗi" });

  if (s.ip !== ip) return res.json({ error: "🚫 IP không hợp lệ" });

  if (Date.now() - s.created < 15000) {
    return res.json({ error: "⏳ Phải chờ 15s!" });
  }

  if (!s.verified) {
    return res.json({ error: "⚠️ Chưa vượt link!" });
  }

  const key = "VIP-" + Math.random().toString(36).substring(2,10).toUpperCase();

  delete sessions[session];

  res.json({ key });
});

app.listen(3000, () => console.log("🔥 Server chạy tại http://localhost:3000"));