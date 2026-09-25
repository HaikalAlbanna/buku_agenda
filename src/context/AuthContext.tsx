import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE, getToken, setToken, authFetch } from "@/lib/api";

export interface User {
  id: number;
  username: string;
  nama: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("auth_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setAuthToken] = useState<string | null>(getToken);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function verifySession() {
      const currentToken = getToken();
      if (!currentToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await authFetch(`${API_BASE}/auth/me`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem("auth_user", JSON.stringify(data.user));
          } else {
            logout();
          }
        } else {
          logout();
        }
      } catch (err) {
        console.error("Session verification failed:", err);
      } finally {
        setIsLoading(false);
      }
    }

    verifySession();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || "Gagal masuk. Periksa kembali username dan password.",
        };
      }

      setToken(data.token);
      setAuthToken(data.token);
      setUser(data.user);
      localStorage.setItem("auth_user", JSON.stringify(data.user));

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || "Tidak dapat terhubung ke server backend.",
      };
    }
  };

  const logout = () => {
    setToken(null);
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
