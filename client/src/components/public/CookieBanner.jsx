import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";
import { cookieConsentService } from "../../services/cookieConsentService";
import { OPEN_COOKIE_SETTINGS_EVENT } from "../../utils/cookieConsent";

const STORAGE_KEY = "rm_cookie_consent";

/** UUID v4. crypto.randomUUID solo existe en HTTPS, así que hay respaldo. */
function uuidv4() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function readStored() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function writeStored(value) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // modo privado / almacenamiento bloqueado: el aviso volverá a salir
  }
}

/**
 * Aviso de cookies del sitio público. Guarda la decisión en el navegador
 * y la registra (anónima) en el backend para las estadísticas del panel.
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = readStored();
    let t;
    if (!stored?.decision) t = setTimeout(() => setVisible(true), 800);
    const open = () => setVisible(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, open);
    return () => {
      clearTimeout(t);
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, open);
    };
  }, []);

  const decide = (decision) => {
    const stored = readStored();
    const visitorId = stored?.visitorId || uuidv4();
    writeStored({ visitorId, decision, date: new Date().toISOString() });
    setVisible(false);
    cookieConsentService.record({ visitorId, decision }).catch(() => {
      // Si falla el registro no molestamos al visitante: su decisión
      // ya quedó guardada en el navegador.
    });
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="fixed inset-x-3 bottom-3 z-[1000] sm:inset-x-auto sm:bottom-5 sm:left-5 sm:max-w-md"
      style={{ animation: "rm-cookie-in 380ms cubic-bezier(.2,.8,.2,1)" }}
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-graphite-950/95 p-5 text-white shadow-2xl ring-1 ring-black/20 backdrop-blur">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-maastel-500/30 blur-2xl"
        />
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Cerrar"
          className="absolute right-3 top-3 rounded-lg p-1 text-white/50 transition hover:bg-white/10 hover:text-white"
        >
          <X size={16} />
        </button>

        <div className="relative flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-maastel-500 text-white shadow-lg">
            <Cookie size={20} />
          </div>
          <div className="pr-4">
            <div className="text-sm font-black">Usamos cookies</div>
            <p className="mt-1 text-xs leading-relaxed text-white/75">
              Utilizamos cookies propias para que el sitio funcione y para
              mejorar tu experiencia. Puedes aceptarlas o rechazarlas.{" "}
              <Link
                to="/documentos"
                className="font-bold text-maastel-300 underline-offset-2 hover:underline"
              >
                Más información
              </Link>
            </p>
          </div>
        </div>

        <div className="relative mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => decide("REJECTED")}
            className="flex-1 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            Rechazar
          </button>
          <button
            type="button"
            onClick={() => decide("ACCEPTED")}
            className="flex-1 rounded-xl bg-gradient-to-r from-maastel-500 to-maastel-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg transition hover:shadow-maastel-500/40"
          >
            Aceptar
          </button>
        </div>
      </div>

      <style>{`
        @keyframes rm-cookie-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
