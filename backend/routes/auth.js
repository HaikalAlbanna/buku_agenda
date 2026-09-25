const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../supabase");
const { verifyToken, JWT_SECRET } = require("../middleware/auth");

/* ==========================================
   POST /api/auth/login
   Autentikasi login admin via Supabase
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

    const { data: users, error } = await supabase
      .from("users")
      .select("id, username, nama, password, role")
      .eq("username", username.trim());

    if (error || !users || users.length === 0) {
      // Fallback untuk demo default jika tabel belum ada atau user belum terdaftar
      if (username.trim() === "admin" && password === "admin123") {
        const payload = {
          id: 1,
          username: "admin",
          nama: "Administrator",
          role: "admin",
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
        return res.json({
          success: true,
          message: "Login berhasil (Akun Admin).",
          token,
          user: payload,
        });
      }

      return res.status(401).json({
        success: false,
        message: "Username atau password salah.",
      });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Username atau password salah.",
      });
    }

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
