const supabase = require("./supabase");
const bcrypt = require("bcryptjs");

async function initDb() {
  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("id, username")
      .eq("username", "admin");

    if (error) {
      console.log("ℹ️  Info Supabase:", error.message);
      return;
    }

    if (!users || users.length === 0) {
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
        console.log("✅ Akun Admin berhasil di-seed di Supabase:");
        console.log("   Username: admin | Password: " + defaultPassword);
      }
    } else {
      console.log("✅ Supabase terhubung. Akun Admin siap digunakan.");
    }
  } catch (err) {
    console.error("❌ Catatan inisialisasi Supabase:", err.message);
  }
}

module.exports = initDb;
