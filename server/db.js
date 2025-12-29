// Cria e conecta no SQLite
import sqlite3 from "sqlite3";

export const db = new sqlite3.Database("./freezing3moji.db");

// Criação das tabelas básicas
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT,
      role TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS emojis (
      id INTEGER PRIMARY KEY,
      unicode TEXT,
      author TEXT,
      file TEXT,
      status TEXT,
      admin_note TEXT
    )
  `);
});
