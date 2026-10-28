/**
 * Convierte un error de axios en un mensaje legible para el usuario.
 *
 * - Si el backend manda { message }, lo usamos (puede ser string o array).
 * - Si no hay respuesta (timeout, red caída, CORS), mensaje genérico.
 * - Nunca devolvemos el stack ni info técnica de bajo nivel.
 */
export function getErrorMessage(error, fallback = "Ocurrió un error inesperado") {
  if (!error) return fallback;

  // Errores de timeout / red.
  if (error.code === "ECONNABORTED") {
    return "La operación tardó demasiado. Intenta de nuevo.";
  }
  if (!error.response) {
    return "No se pudo conectar con el servidor.";
  }

  const status = error.response.status;
  const data = error.response.data;
  const raw = data?.message;

  if (Array.isArray(raw)) return raw.join(", ");
  if (typeof raw === "string" && raw.trim()) return raw;

  if (status === 401) return "Sesión expirada o credenciales inválidas.";
  if (status === 403) return "No tienes permisos para realizar esta acción.";
  if (status === 404) return "Recurso no encontrado.";
  if (status === 409) return "Conflicto con un recurso existente.";
  if (status === 429) return "Demasiados intentos. Espera un momento.";
  if (status >= 500) return "El servidor no pudo procesar la petición.";

  return fallback;
}
