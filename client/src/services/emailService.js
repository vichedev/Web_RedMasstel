import emailjs from "@emailjs/browser";
import api from "../api/axios";

/**
 * Servicio de envío de correos vía EmailJS.
 *
 * Las credenciales se cargan desde la API (`/email-config`) y se
 * cachean en memoria para evitar refetches en cada envío. El cache
 * se invalida llamando `clearEmailServiceCache()` (lo hace el hook
 * `useUpdateEmailConfig` al guardar cambios desde el dashboard).
 *
 * Se mantiene compatibilidad con las variables de entorno
 * `VITE_EMAILJS_*` como respaldo: si la BD no tiene credenciales,
 * caemos a las del .env. Esto facilita el despliegue inicial.
 */

const ENV_FALLBACK = {
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY ?? null,
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID ?? null,
  templateContact: import.meta.env.VITE_EMAILJS_TEMPLATE_CONTACT ?? null,
  templateSubscribe: import.meta.env.VITE_EMAILJS_TEMPLATE_SUBSCRIBE ?? null,
  adminEmail: import.meta.env.VITE_ADMIN_EMAIL ?? null,
};

let cachedConfig = null;
let configPromise = null;
let initializedKey = null;

function mergeWithFallback(remote) {
  return {
    publicKey: remote?.publicKey || ENV_FALLBACK.publicKey,
    serviceId: remote?.serviceId || ENV_FALLBACK.serviceId,
    templateContact:
      remote?.templateContact || ENV_FALLBACK.templateContact,
    templateSubscribe:
      remote?.templateSubscribe || ENV_FALLBACK.templateSubscribe,
    adminEmail: remote?.adminEmail || ENV_FALLBACK.adminEmail,
  };
}

async function loadConfig() {
  if (cachedConfig) return cachedConfig;
  if (!configPromise) {
    configPromise = api
      .get("/email-config")
      .then((res) => mergeWithFallback(res.data))
      .catch(() => mergeWithFallback(null));
  }
  cachedConfig = await configPromise;

  // Inicializa EmailJS sólo cuando el publicKey cambia, para evitar
  // llamadas redundantes al SDK.
  if (cachedConfig.publicKey && cachedConfig.publicKey !== initializedKey) {
    emailjs.init({ publicKey: cachedConfig.publicKey });
    initializedKey = cachedConfig.publicKey;
  }
  return cachedConfig;
}

/** Limpia el cache (lo llama el hook useUpdateEmailConfig). */
export function clearEmailServiceCache() {
  cachedConfig = null;
  configPromise = null;
}

function ensureCredentials(config, requiredTemplate) {
  if (!config.publicKey || !config.serviceId) {
    throw new Error(
      "EmailJS no está configurado. Configura las credenciales en /dashboard/email.",
    );
  }
  if (!config[requiredTemplate]) {
    throw new Error(
      `EmailJS no tiene definido el template "${requiredTemplate}".`,
    );
  }
}

export const emailService = {
  async sendContactForm({ name, email, phone, subject, message }) {
    const config = await loadConfig();
    ensureCredentials(config, "templateContact");
    return emailjs.send(config.serviceId, config.templateContact, {
      from_name: name,
      from_email: email,
      from_phone: phone || "No proporcionado",
      subject,
      message,
      admin_email: config.adminEmail ?? "",
    });
  },

  async sendSubscription(email) {
    const config = await loadConfig();
    ensureCredentials(config, "templateSubscribe");
    return emailjs.send(config.serviceId, config.templateSubscribe, {
      subscriber_email: email,
      subscription_date: new Date().toLocaleString("es-EC", {
        dateStyle: "full",
        timeStyle: "short",
      }),
      admin_email: config.adminEmail ?? "",
    });
  },
};
