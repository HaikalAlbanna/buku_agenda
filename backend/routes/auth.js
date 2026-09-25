const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { verifyToken, JWT_SECRET } = require("../middleware/auth");

/* ==========================================
   POST /api/auth/login
   Autentikasi login admin via database
========================================== */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username dan password wajib diisi.",
      });
    }

    const [rows] = await db.query(
      "SELECT id, username, nama, password, role FROM users WHERE username = ?",
      [username.trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Username atau password salah.",
      });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Username atau password salah.",
      });
    }

    // Buat JWT Token berlaku selama 7 hari
    const payload = {
      id: user.id,
      username: user.username,
      nama: user.nama,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      success: true,
      message: "Login berhasil.",
      token,
      user: {
        id: user.id,
        username: user.username,
        nama: user.nama,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan internal pada server.",
    });
  }
});

/* ==========================================
   GET /api/auth/me
   Cek status session / token pengguna
========================================== */
router.get("/me", verifyToken, async (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
});

/* ==========================================
   GET /api/auth/demo
   Info kredensial akun demo admin
========================================== */
router.get("/demo", (req, res) => {
  return res.json({
    success: true,
    demo: {
      username: "admin",
      password: "admin123",
      role: "Administrator",
      note: "Akun bawaan default untuk demo sistem",
    },
  });
});

module.exports = router;
