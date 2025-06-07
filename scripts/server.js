require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");

const app = express();
const PORT = 3000;
const uploadsPath = path.join(__dirname, "../uploads");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use((req, res, next) => {
  if (req.path === "/admin-panel.html" && (!req.session || !req.session.loggedIn)) {
    return res.redirect("/login.html");
  }
  next();
});
app.use(express.static(path.join(__dirname, "..")));


const storage = multer.memoryStorage();
const upload = multer({ storage });

function requireAuth(req, res, next) {
  if (req.session && req.session.loggedIn) return next();
  return res.redirect("/login.html");
}

app.post("/api/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    req.session.loggedIn = true;
    return res.redirect("/admin-panel.html");
  }
  return res.redirect("/login.html?error=1");
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.setHeader("Cache-Control", "no-store");
    res.redirect("/index.html");
  });
});

app.get("/admin-panel.html", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "../admin-panel.html"));
});

//Mioty
app.get("/api/mioty", (req, res) => {
  fs.readdir(uploadsPath, { withFileTypes: true }, (err, dirs) => {
    if (err) return res.status(500).json({ error: "Błąd czytania katalogu uploads" });
    const mioty = dirs.filter(d => d.isDirectory()).map(d => d.name);
    res.json(mioty);
  });
});

//Szczegolny miot
app.get("/api/miot", (req, res) => {
  const litterName = decodeURIComponent(req.query.name);
  if (!litterName) return res.status(400).json({ error: "Brak nazwy miotu" });

  const litterPath = path.join(uploadsPath, litterName);
  if (!fs.existsSync(litterPath)) return res.status(404).json({ error: "Miot nie istnieje" });

  const cats = fs.readdirSync(litterPath, { withFileTypes: true });
  const result = [];

  cats.forEach(cat => {
    if (cat.isDirectory()) {
      const catName = cat.name;
      const catFolder = path.join(litterPath, catName);
      let images = [];

      try {
        images = fs.readdirSync(catFolder).filter(file => /\.(jpe?g|png|gif|webp)$/i.test(file));
      } catch (_) {}

      result.push({
        name: catName,
        images: images.map(img =>
          `/uploads/${encodeURIComponent(litterName)}/${encodeURIComponent(catName)}/${encodeURIComponent(img)}`
        )
      });
    }
  });

  res.json(result);
});

//Dodawanie miotu
app.post("/api/dodaj-miot", requireAuth, upload.any(), (req, res) => {
  const litterName = req.body.litterName?.trim();
  const kittenNames = Array.isArray(req.body.kittenNames)
    ? req.body.kittenNames.map(k => k.trim())
    : [req.body.kittenNames?.trim()];

  if (!litterName || !kittenNames || !kittenNames.length) {
    return res.status(400).send("Nieprawidłowe dane");
  }

  const litterPath = path.join(uploadsPath, litterName);
  if (!fs.existsSync(litterPath)) fs.mkdirSync(litterPath);

  kittenNames.forEach((name, index) => {
    if (!name) return;

    const kittenPath = path.join(litterPath, name);
    if (!fs.existsSync(kittenPath)) fs.mkdirSync(kittenPath);

    const files = req.files.filter(f => f.fieldname === `kittenImages${index}`);
    files.forEach(file => {
      const safeName = file.originalname.replace(/[^\w.\-]/g, "_");
      const filepath = path.join(kittenPath, safeName);
      fs.writeFileSync(filepath, file.buffer);
    });
  });

  res.redirect("/admin-panel.html");
});


app.listen(PORT, () => {
  console.log(`✅ Serwer działa: http://localhost:${PORT}`);
});
