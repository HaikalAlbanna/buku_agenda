const { createClient } = require("@supabase/supabase-js");
const ws = require("ws");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY =
  process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn(
    "⚠️  PERINGATAN: Variabel SUPABASE_URL dan SUPABASE_KEY belum disetel pada environment."
  );
}

const supabase = createClient(
  SUPABASE_URL || "https://placeholder.supabase.co",
  SUPABASE_KEY || "placeholder-key",
  {
    realtime: { transport: ws },
    auth: { persistSession: false },
  }
);

module.exports = supabase;
