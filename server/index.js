import express from "express";
import multer from "multer";
import { db } from "./db.js";
import { fakeAuth } from "./auth.js";
import { requireRole } from "./middleware.js";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.json());
app.use(fakeAuth);
app.use(express.static("public"));

/* =========================
   GLOBAL LIST (público)
   ========================= */
app.get("/api/emojis", (req, res) => {
  db.all(
    "SELECT * FROM emojis WHERE status = 'approved'",
    (err, rows) => res.json(rows)
  );
});

/* =========================
   UPLOAD (p-)
   ========================= */
app.post(
  "/api/upload",
  requireRole("p-"),
  upload.single("emoji"),
  (req, res) => {
    db.run(
      `INSERT INTO emojis (unicode, author, file, status)
       VALUES (?, ?, ?, 'pending')`,
      [req.body.unicode, req.user.username, req.file.filename],
      () => res.send("[sys] emoji submitted for review")
    );
  }
);

/* =========================
   MODERAÇÃO (p+)
   ========================= */
app.post(
  "/api/moderate",
  requireRole("p+"),
  (req, res) => {
    const { id, status, note } = req.body;

    // Reject / Almost precisam de nota
    if ((status === "rejected" || status === "almost") && !note) {
      return res.status(400).send("admin note required");
    }

    db.run(
      `UPDATE emojis SET status = ?, admin_note = ? WHERE id = ?`,
      [status, note || null, id],
      () => res.send("[sys] moderation updated")
    );
  }
);

app.listen(3000, () =>
  console.log("freezing3moji running on http://localhost:3000")
);
