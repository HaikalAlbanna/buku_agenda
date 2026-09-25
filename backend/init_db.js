const db = require("./db");
const bcrypt = require("bcryptjs");

async function initDb() {
  try {
    // 1. Pastikan tabel users sudah dibuat
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        nama VARCHAR(100) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Cek apakah admin sudah ada
    const [rows] = await db.query(
      "SELECT id, username FROM users WHERE username = ?",
      ["admin"]
    );

    if (rows.length === 0) {
      const defaultPassword = "admin123";
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);

      await db.query(
        "INSERT INTO users (username, nama, password, role) VALUES (?, ?, ?, ?)",
        ["admin", "Administrator", hashedPassword, "admin"]
      );

      console.log("✅ Akun Admin berhasil di-generate di database:");
      console.log("   Username: admin");
      console.log("   Password: " + defaultPassword);
    } else {
      console.log("ℹ️  Akun Admin sudah tersedia di database.");
    }
  } catch (err) {
    console.error("❌ Gagal inisialisasi tabel users / admin:", err.message);
  }
}

module.exports = initDb;
