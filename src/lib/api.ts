import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_URL || "/api";

export function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem("auth_token", token);
  } else {
    localStorage.removeItem("auth_token");
  }
}

export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return token
    ? {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    : {
        "Content-Type": "application/json",
      };
}

/**
 * Wrapper fetch yang secara otomatis menyertakan header Authorization Bearer token
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Jika body bukan FormData, pasang Content-Type application/json secara default jika belum ada
  if (!(options.body instanceof FormData) && !headers.has("Content-Type") && options.method && options.method !== "GET") {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token tidak valid atau kedaluwarsa
    setToken(null);
    localStorage.removeItem("auth_user");
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }

  return response;
}

// Konfigurasi Axios global interceptor
axios.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      setToken(null);
      localStorage.removeItem("auth_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
