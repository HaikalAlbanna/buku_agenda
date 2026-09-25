const { createClient } = require("@supabase/supabase-js");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://trdtkjupfevddwfpbmlc.supabase.co";

const SUPABASE_KEY =
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_wApXcE_OIo8g0dZRKSt2Vw_-kSspZxe";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = supabase;
