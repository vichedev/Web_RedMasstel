/** Evento para reabrir el aviso de cookies desde cualquier parte (ej. footer). */
export const OPEN_COOKIE_SETTINGS_EVENT = "rm:open-cookie-settings";

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT));
}
