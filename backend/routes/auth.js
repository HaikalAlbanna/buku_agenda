const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../supabase");
const { verifyToken, JWT_SECRET } = require("../middleware/auth");

/* ==========================================
   POST /api/auth/login
   Autentikasi login admin via Supabase / Admin Default
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

    const trimmedUser = username.trim();

    // 1. Cek query Supabase ke tabel users
    const { data: users, error } = await supabase
      .from("users")
      .select("id, username, nama, password, role")
      .eq("username", trimmedUser)
      .limit(1);

    if (error) {
      console.error("[auth] Supabase login error:", error);
      return res.status(500).json({
        success: false,
        message: "Gagal terhubung ke database: " + error.message,
      });
    }

    let matchedUser = users && users.length > 0 ? users[0] : null;

    if (matchedUser) {
      const isMatch =
        matchedUser.password === password ||
        (await bcrypt.compare(password, matchedUser.password).catch(() => false)) ||
        (trimmedUser === "admin" && password === "admin123");

      if (isMatch) {
        const payload = {
          id: matchedUser.id,
          username: matchedUser.username,
          nama: matchedUser.nama,
          role: matchedUser.role,
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
        return res.json({
          success: true,
          message: "Login berhasil.",
          token,
          user: payload,
        });
      }
    }

    // Akun admin bawaan jika users di database kosong / belum terjangkau
    if (trimmedUser === "admin" && password === "admin123") {
      const payload = {
        id: 1,
        username: "admin",
        nama: "Administrator",
        role: "admin",
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
      return res.json({
        success: true,
        message: "Login berhasil.",
        token,
        user: payload,
      });
    }

    return res.status(401).json({
      success: false,
      message: "Username atau password salah.",
    });

    const payload = {
      id: matchedUser.id,
      username: matchedUser.username,
      nama: matchedUser.nama,
      role: matchedUser.role,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
    return res.json({
      success: true,
      message: "Login berhasil.",
      token,
      user: payload,
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
    username: "admin",
    password: "admin123",
    role: "admin",
    info: "Gunakan kredensial ini untuk login ke Buku Agenda",
  });
});

module.exports = router;
