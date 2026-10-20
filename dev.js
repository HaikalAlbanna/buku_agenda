import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("==========================================");
console.log("🚀 Menjalankan Backend Express (Port 5000)...");
console.log("⚡ Menjalankan Frontend Vite (Port 8080)...");
console.log("==========================================");

// 1. Jalankan Backend Express di Port 5000
const backend = spawn("node", [path.join(__dirname, "backend", "server.js")], {
  stdio: "inherit",
});

// 2. Jalankan Frontend Vite di Port 8080
const npxCmd = process.platform === "win32" ? "npx.cmd" : "npx";
const frontend = spawn(npxCmd, ["vite"], {
  stdio: "inherit",
});

const cleanup = () => {
  try {
    backend.kill();
    frontend.kill();
  } catch {}
  process.exit();
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
process.on("exit", cleanup);
