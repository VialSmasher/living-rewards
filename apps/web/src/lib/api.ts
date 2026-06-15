const ENV_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api";

const API_BASE = ENV_BASE.replace(/\/$/, "");

export const apiUrl = (p: string) => {
  const path = p.startsWith("/") ? p : `/${p}`;
  if (!API_BASE) return path;
  if (API_BASE.endsWith("/api") && path.startsWith("/api")) {
    return `${API_BASE}${path.slice(4)}`;
  }
  return `${API_BASE}${path}`;
};
