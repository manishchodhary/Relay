import axios from "axios";

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

export default api;
