import { useEffect, useMemo, useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Wifi,
  Router,
  HelpCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { z } from "zod";
import { WhatsAppIcon } from "./BrandIcons";
import { emailService } from "../../services/emailService";
import { useBranches } from "../../hooks/useBranches";
import { useMicrosite } from "../../microsites/MicrositeContext";

/* ── Validación ───────────────────────────────────────────────────── */

const contactSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(100),
  email: z.string().trim().email("El correo no es válido"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  subject: z.string().trim().min(1).max(120),
  message: z
    .string()
    .trim()
    .min(10, "El mensaje debe tener al menos 10 caracteres")
    .max(2000, "El mensaje es demasiado largo"),
});

/* ── Datos ────────────────────────────────────────────────────────── */

// Motivos de consulta con icono propio. Funciona como selector visual.
// `brand` enlaza el motivo con una sucursal de la BD (gestionada en
// /dashboard/sucursales). Si es null el selector muestra todas las
// sucursales para que el cliente elija dónde escribir.
const TOPICS = [
  {
    value: "Internet residencial",
    label: "Internet hogar",
    sub: "Fibra óptica",
    brand: "REDMAASTEL",
    icon: Wifi,
    accent: "from-maastel-500 to-maastel-700",
    ring: "ring-maastel-500",
    bg: "bg-maastel-50",
    text: "text-maastel-700",
  },
  {
    value: "Internet empresarial",
    label: "Empresarial",
    sub: "Fibra dedicada",
    brand: "REDMAASTEL",
    icon: Router,
    accent: "from-maastel-500 to-maastel-700",
    ring: "ring-maastel-500",
    bg: "bg-maastel-50",
    text: "text-maastel-700",
  },
  {
    value: "Soporte técnico",
    label: "Soporte técnico",
    sub: "Asistencia",
    brand: null,
    icon: HelpCircle,
    accent: "from-emerald-500 to-emerald-700",
    ring: "ring-emerald-500",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
];

// Metadatos visuales de la marca para el selector de sucursales.
const BRAND_META = {
  REDMAASTEL: {
    name: "Red MaasTel",
    label: "Internet de fibra óptica",
    icon: Wifi,
    accent: "from-maastel-500 to-maastel-700",
  },
};

// Horario por defecto si la sucursal aún no tiene uno configurado.
const DEFAULT_SCHEDULE = [
  { label: "Lunes a Viernes", hours: "8:00 — 18:00", days: [1, 2, 3, 4, 5] },
  { label: "Sábado", hours: "8:30 — 12:30", days: [6] },
  { label: "Domingo", hours: "Cerrado", days: [0], closed: true },
];

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  subject: TOPICS[0].value,
  message: "",
  website: "", // honeypot
};

/* ── Helpers ──────────────────────────────────────────────────────── */

function getOpenStatus() {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const min = now.getMinutes();
  const t = hour * 60 + min;

  if (day >= 1 && day <= 5 && t >= 8 * 60 && t < 18 * 60) return true; // L-V 8-18
  if (day === 6 && t >= 8 * 60 + 30 && t < 12 * 60 + 30) return true; // S 8:30-12:30
  return false;
}

/** Quita separadores y conserva sólo dígitos para wa.me. */
function normalizeForWa(raw) {
  if (!raw) return "";
  return String(raw).replace(/\D+/g, "");
}

/**
 * Construye el enlace de WhatsApp para una sucursal con un saludo
 * adaptado al motivo de la consulta.
 */
function buildBranchWhatsappLink(branch, topic) {
  const phone = normalizeForWa(branch?.whatsappPhone);
  if (!phone) return null;
  const brandName = BRAND_META[branch?.brand]?.name ?? branch?.name ?? "Red MaasTel";
  const intro =
    topic?.brand
      ? `Hola, escribo desde la web. Me interesa información de *${brandName}* (${topic.label}).`
      : `Hola, escribo desde la web. Necesito *${topic?.label ?? "ayuda"}* y me gustaría hablar con la sucursal de ${brandName}.`;
  const text = encodeURIComponent(`${intro} ¿Pueden ayudarme?`);
  return `https://wa.me/${phone}?text=${text}`;
}

function buildTelHref(raw) {
  if (!raw) return null;
  const cleaned = String(raw).replace(/\s+/g, "");
  return `tel:${cleaned}`;
}

/* ── Componente principal ─────────────────────────────────────────── */

export function ContactSection() {
  const { brandKey, brandName } = useMicrosite();

  // Topic por defecto: el primer servicio de Red MaasTel.
  const defaultTopic =
    TOPICS.find((t) => t.brand === brandKey)?.value ?? TOPICS[0].value;

  const [form, setForm] = useState({ ...INITIAL_FORM, subject: defaultTopic });
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [isOpen, setIsOpen] = useState(getOpenStatus());
  const { data: branches = [] } = useBranches({ onlyActive: true });

  // Mantiene el selector sincronizado con el topic por defecto.
  useEffect(() => {
    setForm((prev) => ({ ...prev, subject: defaultTopic }));
  }, [defaultTopic]);

  // Refresca el estado de "abierto ahora" cada minuto.
  useEffect(() => {
    const id = setInterval(() => setIsOpen(getOpenStatus()), 60_000);
    return () => clearInterval(id);
  }, []);

  const activeTopic =
    TOPICS.find((t) => t.value === form.subject) ?? TOPICS[0];

  // Sucursales indexadas por marca para acceso O(1).
  const branchesByBrand = useMemo(() => {
    const map = {};
    for (const branch of branches) {
      if (branch?.brand) map[branch.brand] = branch;
    }
    return map;
  }, [branches]);

  // En cada microsite mostramos SIEMPRE su propia sucursal — el selector
  // de motivo es sólo un campo del formulario para que el usuario diga
  // qué servicio quiere consultar; los datos de contacto (teléfono,
  // dirección, WhatsApp) son los de este microsite y nada más.
  const activeBranch = branchesByBrand[brandKey] ?? null;

  const branchEmail = activeBranch?.email?.trim() || null;
  const schedule =
    Array.isArray(activeBranch?.schedule) && activeBranch.schedule.length > 0
      ? activeBranch.schedule
      : DEFAULT_SCHEDULE;

  const whatsappLink = activeBranch
    ? buildBranchWhatsappLink(activeBranch, activeTopic)
    : null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.website) {
      setStatus({ state: "success", message: "Mensaje enviado." });
      return;
    }

    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      setStatus({
        state: "error",
        message: parsed.error.issues[0]?.message ?? "Datos inválidos",
      });
      return;
    }

    setStatus({ state: "sending", message: "" });
    try {
      await emailService.sendContactForm(parsed.data);
      setStatus({
        state: "success",
        message: "¡Mensaje enviado! Te respondemos en menos de 24 horas.",
      });
      setForm(INITIAL_FORM);
    } catch {
      setStatus({
        state: "error",
        message:
          branchEmail
            ? `No pudimos enviar tu mensaje. Inténtalo de nuevo o escríbenos a ${branchEmail}`
            : "No pudimos enviar tu mensaje. Inténtalo de nuevo o contáctanos por WhatsApp.",
      });
    }
  };

  const isSending = status.state === "sending";
  const messageLen = form.message.length;

  return (
    <section
      id="contacto"
      className="relative isolate overflow-hidden bg-white py-24"
    >
      {/* Capas tech de fondo */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,28,80,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,28,80,0.04)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_85%)]" />
      <div className="absolute -left-32 top-32 h-96 w-96 rounded-full bg-maastel-100/60 blur-3xl" />
      <div className="absolute -right-32 bottom-0 h-[28rem] w-[28rem] rounded-full bg-maastel-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Encabezado ─────────────────────────────────────────── */}
        <div className="mb-12 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-maastel-200 bg-maastel-50 px-4 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-maastel-600">
            <Sparkles size={12} />
            Contacto
          </div>
          <h2 className="text-4xl font-black leading-tight text-graphite-900 sm:text-5xl lg:text-6xl">
            Hablemos de tu{" "}
            <span className="bg-gradient-to-r from-maastel-600 via-maastel-500 to-maastel-600 bg-clip-text text-transparent">
              conexión
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Cuéntanos qué necesitas y te respondemos rápido. Soporte humano,
            asesoría comercial y ayuda técnica por el canal que prefieras.
          </p>
        </div>

        {/* ── Banner de estado en vivo ───────────────────────────── */}
        <div className="mb-10 overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-r from-maastel-50 via-white to-maastel-50/50 px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                    isOpen ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
                <span
                  className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                    isOpen ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
              </span>
              <div>
                <div
                  className={`text-xs font-black uppercase tracking-[0.2em] ${
                    isOpen ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {isOpen ? "Abierto ahora" : "Fuera de horario"}
                </div>
                <div className="text-xs text-gray-600">
                  {isOpen
                    ? "Un asesor está disponible para atenderte."
                    : "Déjanos un mensaje y te respondemos al volver."}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Stat icon={ShieldCheck} value="<24h" label="Respuesta" />
              <Stat
                icon={WhatsAppIcon}
                value="WhatsApp"
                label="Canal preferido"
              />
              <Stat icon={Clock} value="24/7" label="Soporte técnico" />
            </div>
          </div>
        </div>

        {/* ── Bento grid principal ───────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* ─── Formulario ─── */}
          <div className="lg:col-span-7">
            <div className="relative h-full overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-xl ring-1 ring-maastel-100/30 sm:p-8 lg:p-10">
              {/* Borde superior con gradient */}
              <span
                aria-hidden
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${activeTopic.accent} transition-all duration-500`}
              />
              {/* Halo decorativo */}
              <span
                aria-hidden
                className={`pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br ${activeTopic.accent} opacity-10 blur-3xl transition`}
              />

              <div className="relative">
                <div className="mb-6 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-black text-graphite-900 sm:text-3xl">
                      Envíanos un mensaje
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Completa el formulario y un asesor te contactará pronto.
                    </p>
                  </div>
                  <span className="hidden rounded-full bg-maastel-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-maastel-700 sm:inline-flex">
                    01 / 02
                  </span>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  noValidate
                >
                  {/* Honeypot */}
                  <input
                    type="text"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                    className="absolute -left-[9999px] opacity-0"
                    aria-hidden="true"
                  />

                  {/* Selector visual de motivo */}
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-gray-700">
                      ¿Sobre qué quieres hablar?
                    </label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {TOPICS.map((t) => {
                        const Icon = t.icon;
                        const active = form.subject === t.value;
                        return (
                          <button
                            key={t.value}
                            type="button"
                            disabled={isSending}
                            onClick={() =>
                              setForm({ ...form, subject: t.value })
                            }
                            className={`group relative flex flex-col items-center gap-1.5 overflow-hidden rounded-xl border-2 px-3 py-3 text-center transition ${
                              active
                                ? `border-transparent bg-gradient-to-br ${t.accent} text-white shadow-lg`
                                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                            } disabled:opacity-60`}
                          >
                            <Icon
                              size={18}
                              strokeWidth={2.3}
                              className={
                                active ? "drop-shadow" : "text-gray-500"
                              }
                            />
                            <div
                              className={`text-[11px] font-black uppercase tracking-wider leading-tight ${
                                active ? "text-white" : "text-graphite-900"
                              }`}
                            >
                              {t.label}
                            </div>
                            <div
                              className={`text-[9px] font-semibold uppercase tracking-[0.15em] ${
                                active ? "text-white/80" : "text-gray-400"
                              }`}
                            >
                              {t.sub}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Nombre + Teléfono */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Nombre completo *"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Juan Pérez"
                      disabled={isSending}
                      required
                    />
                    <Field
                      label="Teléfono"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+593 999 999 999"
                      disabled={isSending}
                    />
                  </div>

                  {/* Email */}
                  <Field
                    label="Correo electrónico *"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    disabled={isSending}
                    required
                  />

                  {/* Mensaje */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-[0.18em] text-gray-700">
                        Mensaje *
                      </label>
                      <span
                        className={`text-[10px] font-bold ${
                          messageLen > 1900 ? "text-amber-600" : "text-gray-400"
                        }`}
                      >
                        {messageLen}/2000
                      </span>
                    </div>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      disabled={isSending}
                      rows={5}
                      maxLength={2000}
                      placeholder="Cuéntanos qué necesitas: zona donde vives, plan de interés, equipos, etc."
                      required
                      className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-maastel-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
                    />
                  </div>

                  {/* Mensajes de estado */}
                  {status.state === "success" && (
                    <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
                      <CheckCircle2
                        size={20}
                        className="mt-0.5 shrink-0 text-emerald-600"
                      />
                      <p className="text-sm font-semibold text-emerald-800">
                        {status.message}
                      </p>
                    </div>
                  )}
                  {status.state === "error" && (
                    <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 ring-1 ring-red-200">
                      <AlertCircle
                        size={20}
                        className="mt-0.5 shrink-0 text-red-600"
                      />
                      <p className="text-sm font-semibold text-red-800">
                        {status.message}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSending}
                    className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r ${activeTopic.accent} px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white shadow-lg transition hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition duration-700 group-hover:translate-x-full"
                    />
                    {isSending ? (
                      <>
                        <svg
                          className="h-4 w-4 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="opacity-25"
                          />
                          <path
                            d="M4 12a8 8 0 018-8"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                        Enviando...
                      </>
                    ) : (
                      <>
                        Enviar mensaje
                        <Send
                          size={16}
                          className="transition group-hover:translate-x-1"
                        />
                      </>
                    )}
                  </button>

                  <p className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <ShieldCheck size={12} className="text-maastel-600" />
                    Tus datos viajan cifrados. Nunca compartimos tu información.
                  </p>
                </form>
              </div>
            </div>
          </div>

          {/* ─── Panel derecho: contacto rápido ─── */}
          <div className="space-y-4 lg:col-span-5">
            {/* WhatsApp del microsite activo — CTA principal */}
            {whatsappLink ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 p-7 text-white shadow-xl transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/40"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/15 blur-2xl transition group-hover:scale-110"
                />
                <span className="pointer-events-none absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                  En línea
                </span>

                <div className="relative">
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-lg transition group-hover:scale-110">
                    <WhatsAppIcon size={28} />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] text-white/80">
                    Sucursal · {brandName}
                  </div>
                  <h4 className="mt-1 text-2xl font-black tracking-tight">
                    WhatsApp directo
                  </h4>
                  <p className="mt-2 text-sm text-white/90">
                    Tu mensaje llega al equipo de <strong>{brandName}</strong>{" "}
                    sin colas ni intermediarios.
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] backdrop-blur transition group-hover:bg-white/30">
                    Iniciar chat
                    <ArrowRight
                      size={14}
                      className="transition group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </a>
            ) : (
              <div className="rounded-3xl bg-amber-50 p-6 text-amber-900 ring-1 ring-amber-200">
                <div className="mb-2 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-700">
                  <AlertCircle size={14} />
                  WhatsApp no disponible
                </div>
                <p className="text-sm">
                  Aún no hay un WhatsApp configurado para <strong>{brandName}</strong>.
                  Usa el formulario para enviar tu mensaje.
                </p>
              </div>
            )}

            {/* Llamar + Email — duo (reactivos a la sucursal) */}
            <div className="grid gap-4 sm:grid-cols-2">
              <ContactQuickCard
                icon={Phone}
                label="Llámanos"
                value={
                  activeBranch?.phone ?? activeBranch?.whatsappPhone ?? "Sin línea"
                }
                href={
                  buildTelHref(
                    activeBranch?.phone ?? activeBranch?.whatsappPhone,
                  ) ?? undefined
                }
                accent="from-maastel-500 to-maastel-700"
                glow="rgba(237, 125, 43, 0.4)"
                hint={
                  activeBranch
                    ? `Sucursal ${brandName}`
                    : "Lun – Vie · 8 a 18"
                }
                disabled={
                  !activeBranch?.phone && !activeBranch?.whatsappPhone
                }
              />
              <ContactQuickCard
                icon={Mail}
                label="Escríbenos"
                value={branchEmail ?? "Sin correo"}
                href={branchEmail ? `mailto:${branchEmail}` : undefined}
                accent="from-maastel-500 to-maastel-700"
                glow="rgba(222, 101, 23, 0.4)"
                hint={activeBranch?.emailHint ?? undefined}
                disabled={!branchEmail}
              />
            </div>

            {/* Horario detallado */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-graphite-900 via-graphite-950 to-graphite-900 p-6 text-white shadow-xl">
              <span
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-maastel-500/30 blur-2xl"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-maastel-400/20 blur-2xl"
              />
              <span className="pointer-events-none absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-maastel-400/40" />
              <span className="pointer-events-none absolute right-3 top-3 h-5 w-5 border-r-2 border-t-2 border-maastel-400/40" />
              <span className="pointer-events-none absolute left-3 bottom-3 h-5 w-5 border-l-2 border-b-2 border-maastel-400/40" />
              <span className="pointer-events-none absolute right-3 bottom-3 h-5 w-5 border-r-2 border-b-2 border-maastel-400/40" />

              <div className="relative">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-maastel-500 text-white shadow-lg">
                    <Clock size={20} strokeWidth={2.3} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-maastel-300">
                      Horario de atención
                    </div>
                    <div className="text-base font-black">Comercial</div>
                  </div>
                </div>

                <ul className="space-y-2">
                  {schedule.map((s, i) => {
                    const today = (s.days ?? []).includes(new Date().getDay());
                    return (
                      <li
                        key={`${s.label}-${i}`}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                          today ? "bg-white/10 ring-1 ring-white/20" : ""
                        }`}
                      >
                        <span className="flex items-center gap-2 text-maastel-100">
                          {today && (
                            <span className="rounded-full bg-maastel-500 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-white">
                              Hoy
                            </span>
                          )}
                          {s.label}
                        </span>
                        <span
                          className={`font-bold ${
                            s.closed ? "text-red-400" : "text-white"
                          }`}
                        >
                          {s.hours}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-xs">
                  <span className="font-black text-emerald-300">
                    Soporte técnico 24/7
                  </span>
                  <span className="block text-emerald-100/80">
                    Para incidencias de red, atención todos los días.
                  </span>
                </div>
              </div>
            </div>

            {/* Ubicación — refleja la sucursal del microsite activo */}
            {(() => {
              const branchAddress = activeBranch?.address?.trim();
              const mapsHref = branchAddress
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branchAddress)}`
                : null;
              return (
                <a
                  href={mapsHref ?? "#"}
                  target={mapsHref ? "_blank" : undefined}
                  rel={mapsHref ? "noopener noreferrer" : undefined}
                  className={`group flex items-center gap-4 overflow-hidden rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition ${
                    mapsHref
                      ? "hover:-translate-y-0.5 hover:shadow-lg"
                      : "cursor-default"
                  }`}
                  onClick={(e) => {
                    if (!mapsHref) e.preventDefault();
                  }}
                >
                  <div className="relative shrink-0">
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-2xl bg-maastel-500/30 blur-xl transition group-hover:scale-110"
                    />
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-maastel-500 to-maastel-700 text-white shadow-lg">
                      <MapPin size={22} strokeWidth={2.3} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-maastel-700">
                      {activeBranch ? "Sucursal" : "Visítanos"}
                    </div>
                    <div className="truncate text-base font-black text-graphite-900">
                      {brandName}
                    </div>
                    <div className="truncate text-xs text-gray-500">
                      {branchAddress ?? "Ecuador"}
                    </div>
                  </div>
                  {mapsHref && (
                    <ArrowRight
                      size={16}
                      className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-maastel-600"
                    />
                  )}
                </a>
              );
            })()}
          </div>
        </div>
      </div>

      {/* WhatsApp flotante: lo dejamos en el Footer (ya existe) */}
    </section>
  );
}

/* ── Subcomponentes ───────────────────────────────────────────────── */

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 ring-1 ring-gray-200">
      <Icon size={13} className="text-maastel-700" />
      <div className="text-xs">
        <span className="font-black text-graphite-900">{value}</span>
        <span className="ml-1 text-gray-500">{label}</span>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  disabled,
  required,
  type = "text",
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-gray-700">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-maastel-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
      />
    </div>
  );
}

function ContactQuickCard({
  icon: Icon,
  label,
  value,
  href,
  accent,
  glow,
  hint,
  disabled,
}) {
  const baseClass =
    "group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition";
  const interactive = disabled
    ? "cursor-not-allowed opacity-60"
    : "hover:-translate-y-0.5 hover:shadow-xl";

  const Inner = (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl transition group-hover:scale-110"
        style={{ background: glow, opacity: 0.5 }}
      />
      <span
        aria-hidden
        className={`absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b ${accent}`}
      />

      <div className="relative">
        <div
          className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-lg`}
        >
          <Icon size={20} strokeWidth={2.3} />
        </div>
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
          {label}
        </div>
        <div className="mt-0.5 truncate text-sm font-black text-graphite-900">
          {value}
        </div>
        {hint && (
          <div className="mt-1 text-[11px] text-gray-500">{hint}</div>
        )}
      </div>
    </>
  );

  if (disabled || !href) {
    return <div className={`${baseClass} ${interactive}`}>{Inner}</div>;
  }

  return (
    <a href={href} className={`${baseClass} ${interactive}`}>
      {Inner}
    </a>
  );
}

