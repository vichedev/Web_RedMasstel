import axios from "axios";

/**
 * Cliente HTTP único.
 *
 * Auth: el backend autentica vía cookie httpOnly (`ws_session`). El navegador
 * la envía automáticamente porque pasamos `withCredentials: true`. No
 * guardamos tokens en localStorage para mitigar el riesgo de XSS.
 *
 * Proxy en dev: en `vite.config.js` redirigimos /api/* al backend, así estamos
 * en el mismo origen y no hay problemas de CORS ni cookies cross-site.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 20_000,
});

// Evento personalizado: el AuthContext lo escucha y reacciona en SPA
// (sin un window.location.href que reinicia la app y pierde estado).
export const AUTH_EXPIRED_EVENT = "auth:expired";

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 = sesión expirada o no autenticado. No emitimos para llamadas a /auth/login
    // porque ese 401 es esperado durante el login fallido.
    if (error.response?.status === 401) {
      const url = error.config?.url ?? "";
      const isLoginAttempt = url.includes("/auth/login");
      if (!isLoginAttempt && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
      }
    }
    return Promise.reject(error);
  },
);

export default api;
