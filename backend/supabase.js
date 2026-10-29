const { createClient } = require("@supabase/supabase-js");
const ws = require("ws");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://trdtkjupfevddwfpbmlc.supabase.co";

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_wApXcE_OIo8g0dZRKSt2Vw_-kSspZxe";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY,
  {
    realtime: { transport: ws },
    auth: { persistSession: false },
  }
);

module.exports = supabase;
