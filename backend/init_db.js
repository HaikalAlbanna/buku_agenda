const supabase = require("./supabase");
const bcrypt = require("bcryptjs");
const localStore = require("./local_store");

async function initDb() {
  try {
    // 1. Cek & Seed Users
    const { data: users, error: userErr } = await supabase
      .from("users")
      .select("id, username")
      .eq("username", "admin");

    if (!userErr) {
      if (!users || users.length === 0) {
        const defaultPassword = "admin123";
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        await supabase.from("users").insert([
          {
            username: "admin",
            nama: "Administrator",
            password: hashedPassword,
            role: "admin",
          },
        ]);
        console.log("✅ Akun Admin berhasil di-seed di Supabase.");
      } else {
        console.log("✅ Akun Admin aktif di Supabase.");
      }
    }

    // 2. Cek & Seed Buku
    const { data: buku, error: bukuErr } = await supabase
      .from("buku")
      .select("kode");

    if (!bukuErr && (!buku || buku.length === 0)) {
      const defaultBuku = localStore.getBuku();
      await supabase.from("buku").insert(defaultBuku);
      console.log(`✅ ${defaultBuku.length} Master Buku berhasil di-seed di Supabase.`);
    }

    // 3. Cek & Seed Tipe Surat
    const { data: tipe, error: tipeErr } = await supabase
      .from("tipe_surat")
      .select("kode");

    if (!tipeErr && (!tipe || tipe.length === 0)) {
      const defaultTipe = localStore.getTipeSurat();
      await supabase.from("tipe_surat").insert(defaultTipe);
      console.log(`✅ ${defaultTipe.length} Master Tipe Surat berhasil di-seed di Supabase.`);
    }
  } catch (err) {
    console.error("❌ Catatan inisialisasi Supabase:", err.message);
  }
}

module.exports = initDb;
