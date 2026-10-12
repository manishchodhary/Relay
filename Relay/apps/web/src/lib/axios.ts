import axios from "axios";

const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .trim()
  .replace(/^["']|["']$/g, "")
  .replace(/\/$/, "");

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default api;
