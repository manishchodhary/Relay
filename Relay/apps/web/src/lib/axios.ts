import axios from "axios";
import { clearSession } from "./session";

function normalizeApiUrl(value: string | undefined): string {
  const cleaned = (value || "http://localhost:5000")
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .replace(/^(https?):\/(?!\/)/i, "$1://")
    .replace(/\/+$/, "");

  try {
    const parsed = new URL(cleaned);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("VITE_API_URL must use http:// or https://");
    }
    return parsed.origin;
  } catch {
    if (import.meta.env.PROD) {
      console.error("Invalid VITE_API_URL. Set it to the API origin, e.g. https://api.example.com");
      return "";
    }
    return "http://localhost:5000";
  }
}

export const apiBaseUrl = normalizeApiUrl(import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const requestUrl = error.config?.url ?? "";
      const path = requestUrl.split("?")[0];
      const isAuthRequest = path.endsWith("/auth/login") || path.endsWith("/auth/register");

      if (!isAuthRequest && localStorage.getItem("accessToken")) {
        clearSession();
        if (window.location.pathname !== "/auth/login") {
          window.location.replace("/auth/login?reason=session-expired");
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
