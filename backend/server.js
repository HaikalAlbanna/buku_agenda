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
