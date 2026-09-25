import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock, User, Eye, EyeOff, ShieldCheck, KeyRound, AlertCircle, Info, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!username.trim() || !password) {
      setErrorMessage("Silakan masukkan username dan password.");
      return;
    }

    setLoading(true);
    try {
      const result = await login(username.trim(), password);
      if (result.success) {
        toast({
          title: "Login Berhasil",
          description: "Selamat datang di Sistem Penomoran Surat.",
        });
        navigate(from, { replace: true });
      } else {
        setErrorMessage(result.message || "Username atau password salah.");
        toast({
          variant: "destructive",
          title: "Login Gagal",
          description: result.message || "Username atau password salah.",
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setUsername("admin");
    setPassword("admin123");
    setErrorMessage("");
    toast({
      title: "Akun Demo Terpasang",
      description: "Kredensial admin telah otomatis diisi ke form.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-zinc-900 p-4 sm:p-6">
      <div className="w-full max-w-sm space-y-6">
        {/* Header / Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white shadow-sm">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-black">
            Buku Agenda
          </h1>
          <p className="text-xs text-zinc-500">
            Sistem Manajemen Penomoran Surat Masuk & Keluar
          </p>
        </div>

        {/* Card Login Polos Hitam Putih */}
        <Card className="border border-zinc-200 bg-white shadow-sm rounded-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-black">
              <ShieldCheck className="h-5 w-5 text-black" />
              Masuk ke Akun
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Masukkan username dan password administrator Anda.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-black mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs font-medium text-zinc-700 uppercase tracking-wider">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-9 bg-white border-zinc-300 text-black placeholder:text-zinc-400 focus-visible:ring-black focus-visible:border-black rounded-lg text-sm"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium text-zinc-700 uppercase tracking-wider">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 bg-white border-zinc-300 text-black placeholder:text-zinc-400 focus-visible:ring-black focus-visible:border-black rounded-lg text-sm"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                className="w-full bg-black hover:bg-zinc-800 text-white font-medium py-2 rounded-lg transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2 text-sm">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memproses...
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-sm">
                    <KeyRound className="h-4 w-4" />
                    Masuk
                  </span>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Demo Account Box (Polos Hitam Putih) */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-black">
              <Info className="h-4 w-4 text-black" />
              <span>Akun Demo Administrator</span>
            </div>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-200 text-zinc-800 border border-zinc-300">
              Database
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-white border border-zinc-200">
              <span className="text-zinc-500 block text-[10px]">Username:</span>
              <code className="font-mono font-semibold text-black">admin</code>
            </div>
            <div className="p-2 rounded bg-white border border-zinc-200">
              <span className="text-zinc-500 block text-[10px]">Password:</span>
              <code className="font-mono font-semibold text-black">admin123</code>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fillDemoAccount}
            className="w-full text-xs border-zinc-300 bg-white hover:bg-zinc-100 text-black font-medium"
          >
            Gunakan Akun Demo
          </Button>
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-zinc-400">
          Sistem Penomoran Surat © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
