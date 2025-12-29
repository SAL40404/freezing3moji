// ==============================
// IMPORTS
// ==============================
import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import { db } from "./db.js";
import { setupAuth } from "./auth.js";
import { requireRole } from "./middleware.js";

// ==============================
// SETUP BÁSICO
// ==============================
dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.json());
app.use(express.static("public"));

// OAuth GitHub
setupAuth(app);

// ==============================
// API: LISTA DE EMOJIS
// - anônimo: approved
// - admin (p+): pending se ?pending=true
// ==============================
app.get("/api/emojis", (req, res) => {
  let query = "SELECT * FROM emojis WHERE status = 'approved'";

  // Se pedir pendentes e for admin
  if (req.query.pending === "true") {
    if (!req.user) {
      return res.status(401).send("not logged");
    }

    if (req.user.role !== "p+" && req.user.role !== "p=") {
      return res.status(403).send("access denied");
    }

    query = "SELECT * FROM emojis WHERE status = 'pending'";
  }

  db.all(query, (err, rows) => {
    if (err) return res.status(500).send("db error");
    res.json(rows);
  });
});

// ==============================
// API: UPLOAD (p-)
// ==============================
app.post(
  "/api/upload",
  requireRole("p-"),
  upload.single("emoji"),
  (req, res) => {
    db.run(
      `
      INSERT INTO emojis (unicode, author, file, status)
      VALUES (?, ?, ?, 'pending')
      `,
      [
        req.body.unicode,
        req.user.username,
        req.file.filename
      ],
      () => {
        res.send("[sys] your emoji was submitted for review");
      }
    );
  }
);

// ==============================
// API: MODERAÇÃO (p+)
// ==============================
app.post(
  "/api/moderate",
  requireRole("p+"),
  (req, res) => {
    const { id, status, note } = req.body;

    // almost e rejected precisam de nota
    if (
      (status === "almost" || status === "rejected") &&
      (!note || note.trim() === "")
    ) {
      return res.status(400).send("admin note required");
    }

    db.run(
      `
      UPDATE emojis
      SET status = ?, admin_note = ?
      WHERE id = ?
      `,
      [status, note || null, id],
      () => {
        res.send("[sys] moderation updated");
      }
    );
  }
);

// ==============================
// SERVER START
// ==============================
const PORT = process.env.PORT || 8787;

app.listen(PORT, () => {
  console.log(`freezing3moji ❄️ running on port ${PORT}`);
});
