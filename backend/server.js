const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const app = express();
const initDb = require("./init_db");
const { verifyToken } = require("./middleware/auth");

app.use(cors());

// Limit body
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Inisialisasi Database & Seeding Admin Default
initDb();

/* ===============================
   IMPORT ROUTES
================================= */
const authRoutes = require("./routes/auth");
const masukRoutes = require("./routes/masuk");
const suratKeluarRoutes = require("./routes/surat_keluar");
const bukuRoutes = require("./routes/buku");
const tipeRoutes = require("./routes/tipe_surat");

/* ===============================
   GUNAKAN ROUTES
================================= */
// Route Public Status & Health Check
app.get("/api/status", async (req, res) => {
  const supabase = require("./supabase");
  let supabaseOk = false;
  let tablesOk = false;
  let details = {};

  try {
    const { error } = await supabase.from("users").select("id").limit(1);
    if (!error) {
      supabaseOk = true;
      tablesOk = true;
    } else if (error.code === "PGRST205") {
      supabaseOk = true;
      tablesOk = false;
      details.message = "Supabase terhubung, namun tabel belum dibuat.";
    } else {
      details.error = error.message;
    }
  } catch (e) {
    details.error = e.message;
  }

  res.json({
    status: "ok",
    backend: "running",
    supabase_connected: supabaseOk,
    supabase_tables_ready: tablesOk,
    details,
  });
});

// Route Public Autentikasi
app.use("/api/auth", authRoutes);

// Route Terproteksi Token
app.use("/api/masuk", verifyToken, masukRoutes);
app.use("/api/surat_keluar", verifyToken, suratKeluarRoutes);
app.use("/api/buku", verifyToken, bukuRoutes);
app.use("/api/tipe_surat", verifyToken, tipeRoutes);

/* ===============================
   JALANKAN SERVER
================================= */
const PORT = process.env.PORT || 5000;
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
