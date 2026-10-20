const supabase = require("./supabase");
const bcrypt = require("bcryptjs");

async function initDb() {
  try {
    // 1. Cek & Seed Users Admin jika belum ada
    const { data: users, error: userErr } = await supabase
      .from("users")
      .select("id, username")
      .eq("username", "admin");

    if (!userErr && (!users || users.length === 0)) {
      const defaultPassword = "admin123";
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);

      const { error: insertErr } = await supabase.from("users").insert([
        {
          username: "admin",
          nama: "Administrator",
          password: hashedPassword,
          role: "admin",
        },
      ]);
      if (!insertErr) {
        console.log("✅ Akun Admin berhasil di-seed di Supabase.");
      }
    } else if (!userErr && users && users.length > 0) {
      console.log("✅ Database Supabase terhubung & akun admin siap.");
    }
  } catch (err) {
    console.error("❌ Catatan inisialisasi Supabase:", err.message);
  }
}

module.exports = initDb;

