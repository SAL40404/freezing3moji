// server/index.js
import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import { db } from "./db.js";
import { setupAuth } from "./auth.js";
import { requireRole } from "./middleware.js";

dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.json());
app.use(express.static("public"));

setupAuth(app);

/* GLOBAL LIST */
app.get("/api/emojis", (req, res) => {
  db.all(
    "SELECT * FROM emojis WHERE status = 'approved'",
    (err, rows) => res.json(rows)
  );
});

/* UPLOAD p- */
app.post(
  "/api/upload",
  requireRole("p-"),
  upload.single("emoji"),
  (req, res) => {
    db.run(
      `INSERT INTO emojis (unicode, author, file, status)
       VALUES (?, ?, ?, 'pending')`,
      [req.body.unicode, req.user.username, req.file.filename],
      () => res.send("[sys] your emoji was submitted for review")
    );
  }
);

/* MODERAÇÃO p+ */
app.post(
  "/api/moderate",
  requireRole("p+"),
  (req, res) => {
    const { id, status, note } = req.body;

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

const PORT = process.env.PORT || 8787;
app.listen(PORT, () =>
  console.log(`freezing3moji ❄️ running on port ${PORT}`)
);
