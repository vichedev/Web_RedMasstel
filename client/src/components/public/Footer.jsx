import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  ArrowRight,
  Star,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  FileText,
  Globe,
  Gauge,
  Building2,
  Wrench,
  Share2,
} from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  XIcon,
  YoutubeIcon,
  LinkedInIcon,
  WhatsAppIcon,
} from "./BrandIcons";
import { emailService } from "../../services/emailService";
import { isValidEmail } from "../../utils/validators";
import defaultLogo from "../../assets/logo-redmaastel.svg";
import { useBrandingMap } from "../../hooks/useBranding";
import { useBranches } from "../../hooks/useBranches";
import { useFooterDocuments } from "../../hooks/useDocuments";
import { useFooterExternalLinks } from "../../hooks/useExternalLinks";
import { usePublicSocialLinks } from "../../hooks/useSocialLinks";
import { buildImageUrl } from "../../utils/imageUrl";
import { useMicrosite } from "../../microsites/MicrositeContext";
import { getMicrositeContent, getMicrositeNav } from "../../microsites/content";
import { brandHref, brandSlotSuffix } from "../../config/brand";
import { openCookieSettings } from "../../utils/cookieConsent";

/**
 * Metadatos visuales por plataforma. Las URLs vienen de la BD
 * (gestionadas en /dashboard/redes-sociales) — aquí sólo definimos
 * el icono y el color de hover de cada marca.
 */
const SOCIAL_PLATFORM_META = {
  FACEBOOK: { name: "Facebook", icon: FacebookIcon, color: "hover:bg-[#1877F2]" },
  INSTAGRAM: {
    name: "Instagram",
    icon: InstagramIcon,
    color:
      "hover:bg-gradient-to-br hover:from-purple-500 hover:via-pink-500 hover:to-orange-400",
  },
  TIKTOK: { name: "TikTok", icon: TikTokIcon, color: "hover:bg-black" },
  X: { name: "X", icon: XIcon, color: "hover:bg-black" },
  YOUTUBE: { name: "YouTube", icon: YoutubeIcon, color: "hover:bg-[#FF0000]" },
  LINKEDIN: {
    name: "LinkedIn",
    icon: LinkedInIcon,
    color: "hover:bg-[#0A66C2]",
  },
};

const schedule = [
  { day: "Lun - Vie", hours: "8:00 AM - 6:00 PM" },
  { day: "Sábado", hours: "8:30 AM - 12:30 PM" },
  { day: "Domingo", hours: "Cerrado" },
];

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function normalizeWa(raw) {
  if (!raw) return "";
  return String(raw).replace(/\D+/g, "");
}

function buildBranchWhatsApp(branch, message) {
  const phone = normalizeWa(branch?.whatsappPhone);
  if (!phone) return null;
  const text = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${text}`;
}

export function Footer() {
  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState({ state: "idle", message: "" });

  const { brandKey, brandName } = useMicrosite();
  const micrositeContent = getMicrositeContent(brandKey);
  const { map: branding } = useBrandingMap();
  const { data: branches = [] } = useBranches({ onlyActive: true });
  const { data: footerDocuments = [] } = useFooterDocuments(brandKey);
  const { data: footerLinks = [] } = useFooterExternalLinks(brandKey);
  const { data: socialLinks = [] } = usePublicSocialLinks(brandKey);

  const navigation = useMemo(
    () =>
      getMicrositeNav(brandKey).map((item) => ({
        label: item.label,
        to: brandHref(brandKey, item.path),
      })),
    [brandKey],
  );

  // Sucursales por marca (para el showcase y para la columna de contacto).
  const branchesByBrand = useMemo(() => {
    const out = {};
    for (const b of branches) if (b?.brand) out[b.brand] = b;
    return out;
  }, [branches]);

  // Sucursal "principal" del footer = la del microsite activo. Si por
  // alguna razón aún no está cargada, caemos a la primera disponible
  // (mantener un canal de contacto siempre visible es mejor que ocultarlo).
  const primaryBranch =
    branchesByBrand[brandKey] ||
    branchesByBrand.REDMAASTEL ||
    branches[0] ||
    null;

  const primaryWhatsAppLink = primaryBranch
    ? buildBranchWhatsApp(
        primaryBranch,
        `Hola ${brandName}, me interesa más información de sus servicios.`,
      )
    : null;

  // Logo principal del footer: prioriza el del microsite (FOOTER_LOGO_<MARCA>)
  // y cae al genérico FOOTER_LOGO_MAIN si esa marca todavía no tiene logo.
  const brandFooterSlot = `FOOTER_LOGO_${brandSlotSuffix(brandKey)}`;
  const mainLogoSrc =
    branding[brandFooterSlot]?.url ??
    branding.FOOTER_LOGO_MAIN?.url ??
    defaultLogo;
  const mainLogoAlt =
    branding[brandFooterSlot]?.alt ??
    branding.FOOTER_LOGO_MAIN?.alt ??
    brandName;

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setSubStatus({ state: "error", message: "Ingresa un correo válido" });
      return;
    }
    setSubStatus({ state: "sending", message: "" });
    try {
      await emailService.sendSubscription(email);
      setSubStatus({ state: "success", message: "¡Gracias por suscribirte!" });
      setEmail("");
      setTimeout(() => setSubStatus({ state: "idle", message: "" }), 5000);
    } catch {
      setSubStatus({
        state: "error",
        message: "No pudimos registrarte. Intenta luego.",
      });
    }
  };

  const isSubSending = subStatus.state === "sending";

  return (
    <footer className="relative overflow-hidden bg-graphite-950 text-maastel-100">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_20%_0%,rgba(237, 125, 43,0.3),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_80%_100%,rgba(222, 101, 23,0.18),transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Banda superior con CTA de suscripción */}
      <div className="relative border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-black text-white sm:text-3xl">
                Mantente al día con{" "}
                <span className="text-maastel-400">nuestras promociones</span>
              </h3>
              <p className="mt-1 text-sm text-maastel-200">
                Recibe ofertas en planes de internet y nuevas coberturas.
              </p>
            </div>

            <div className="w-full max-w-md">
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubSending}
                  placeholder="tu@correo.com"
                  required
                  className="flex-1 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder:text-maastel-300 backdrop-blur transition focus:border-maastel-400 focus:outline-none focus:ring-2 focus:ring-maastel-400/30 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isSubSending}
                  className="rounded-full bg-gradient-to-r from-maastel-500 to-maastel-600 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:from-maastel-600 hover:to-maastel-700 hover:shadow-maastel-500/50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubSending ? "..." : "Suscribirme"}
                </button>
              </form>

              {subStatus.state === "success" && (
                <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-green-400">
                  <CheckCircle2 size={16} />
                  {subStatus.message}
                </div>
              )}
              {subStatus.state === "error" && (
                <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-red-400">
                  <AlertCircle size={16} />
                  {subStatus.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Columna de marca */}
          <div className="lg:col-span-5">
            <Link
              to={brandHref(brandKey)}
              className="inline-block rounded-xl bg-white/95 p-3 shadow-lg"
            >
              <img
                src={mainLogoSrc}
                alt={mainLogoAlt}
                className="h-14 w-auto object-contain"
              />
            </Link>

            <p className="mt-5 text-sm leading-relaxed text-maastel-200">
              {micrositeContent.hero.subtitle}
            </p>

            {/* Contacto rápido — reactivo a la sucursal principal */}
            <div className="mt-6 space-y-3">
              {primaryBranch?.phone || primaryBranch?.whatsappPhone ? (
                <a
                  href={`tel:${(primaryBranch.phone ?? primaryBranch.whatsappPhone).replace(/\s+/g, "")}`}
                  className="group flex items-center gap-3 text-sm transition hover:text-maastel-400"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 transition group-hover:bg-maastel-500 group-hover:text-white">
                    <Phone size={15} />
                  </div>
                  <span>
                    {primaryBranch.phone ?? primaryBranch.whatsappPhone}
                  </span>
                </a>
              ) : (
                <div className="flex items-center gap-3 text-sm opacity-60">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                    <Phone size={15} />
                  </div>
                  <span>Teléfono no disponible</span>
                </div>
              )}

              {primaryBranch?.email && (
                <a
                  href={`mailto:${primaryBranch.email}`}
                  className="group flex items-center gap-3 text-sm transition hover:text-maastel-400"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 transition group-hover:bg-maastel-500 group-hover:text-white">
                    <Mail size={15} />
                  </div>
                  <span className="break-all">{primaryBranch.email}</span>
                </a>
              )}

              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                  <MapPin size={15} />
                </div>
                <span>{primaryBranch?.address ?? "Ecuador"}</span>
              </div>

              {primaryWhatsAppLink && (
                <a
                  href={primaryWhatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 text-sm transition hover:text-emerald-300"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 transition group-hover:bg-emerald-500 group-hover:text-white">
                    <WhatsAppIcon size={15} />
                  </div>
                  <span>{primaryBranch?.whatsappPhone ?? "WhatsApp"}</span>
                </a>
              )}
            </div>

            {/* Redes sociales — gestionadas desde /dashboard/redes-sociales */}
            {(socialLinks.length > 0 || primaryWhatsAppLink) && (
              <div className="mt-7">
                <div className="mb-3 text-xs font-bold uppercase tracking-wider text-maastel-400">
                  Síguenos
                </div>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((social) => {
                    const meta = SOCIAL_PLATFORM_META[social.platform];
                    if (!meta) return null;
                    const Icon = meta.icon;
                    return (
                      <a
                        key={social.id}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={meta.name}
                        className={`group relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-white ring-1 ring-white/10 transition hover:scale-110 hover:ring-transparent ${meta.color}`}
                      >
                        <Icon size={18} />
                        <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-graphite-900 opacity-0 transition group-hover:opacity-100">
                          {meta.name}
                        </span>
                      </a>
                    );
                  })}
                  {primaryWhatsAppLink && (
                    <a
                      href={primaryWhatsAppLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="WhatsApp"
                      className="group relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-white ring-1 ring-white/10 transition hover:scale-110 hover:bg-[#25D366] hover:ring-transparent"
                    >
                      <WhatsAppIcon size={18} />
                      <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-graphite-900 opacity-0 transition group-hover:opacity-100">
                        WhatsApp
                      </span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Columna de navegación */}
          <div className="lg:col-span-3">
            <h4 className="mb-5 text-xs font-black uppercase tracking-[0.2em] text-maastel-400">
              Navegación
            </h4>
            <ul className="space-y-3">
              {navigation.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={scrollToTop}
                    className="group flex items-center gap-2 text-sm text-maastel-200 transition hover:text-white"
                  >
                    <span className="h-px w-3 bg-maastel-700 transition group-hover:w-5 group-hover:bg-maastel-400" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Badge "En línea" */}
            <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-green-400">
                  Soporte 24/7
                </span>
              </div>
              <p className="mt-1 text-xs text-maastel-300">
                Estamos disponibles para ti.
              </p>
            </div>
          </div>

          {/* Columna de horario + garantía */}
          <div className="lg:col-span-4">
            <h4 className="mb-5 text-xs font-black uppercase tracking-[0.2em] text-maastel-400">
              Horario de atención
            </h4>

            <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              {schedule.map((s) => (
                <div
                  key={s.day}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2 text-maastel-200">
                    <Clock size={13} className="text-maastel-400" />
                    {s.day}
                  </span>
                  <span
                    className={`font-bold ${s.hours === "Cerrado" ? "text-red-400" : "text-white"}`}
                  >
                    {s.hours}
                  </span>
                </div>
              ))}
            </div>

            {/* Banner de confianza */}
            <div className="mt-6 rounded-xl border border-maastel-400/20 bg-gradient-to-br from-maastel-500/10 to-maastel-500/10 p-4 backdrop-blur">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-maastel-500 to-maastel-600 text-white">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="text-sm font-black text-white">
                    Conexión garantizada
                  </div>
                  <p className="mt-1 text-xs text-maastel-300">
                    Soporte técnico especializado y monitoreo proactivo de tu
                    red.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Documentos + Enlaces útiles (gestionados desde el dashboard) ─── */}
      {(footerDocuments.length > 0 || footerLinks.length > 0) && (
        <div className="relative border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-2">
              {/* Documentos */}
              {footerDocuments.length > 0 && (
                <div>
                  <h4 className="mb-5 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-maastel-400">
                    <FileText size={14} />
                    Documentos importantes
                  </h4>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {footerDocuments.map((doc) => (
                      <li key={doc.id}>
                        <a
                          href={buildImageUrl(doc.fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm transition hover:-translate-y-0.5 hover:border-maastel-400/40 hover:bg-white/10"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-maastel-500/15 text-maastel-300 transition group-hover:bg-maastel-500 group-hover:text-white">
                            <FileText size={15} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-semibold text-white">
                              {doc.title}
                            </div>
                            {doc.description && (
                              <div className="truncate text-[11px] text-maastel-300">
                                {doc.description}
                              </div>
                            )}
                          </div>
                          <ArrowRight
                            size={13}
                            className="shrink-0 text-maastel-300 transition group-hover:translate-x-1 group-hover:text-maastel-400"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3">
                    <Link
                      to={brandHref(brandKey, "/documentos")}
                      onClick={scrollToTop}
                      className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.18em] text-maastel-300 transition hover:text-maastel-200"
                    >
                      Ver todos los documentos
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              )}

              {/* Enlaces útiles */}
              {footerLinks.length > 0 && (
                <div>
                  <h4 className="mb-5 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-maastel-400">
                    <Globe size={14} />
                    Enlaces útiles
                  </h4>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {footerLinks.map((link) => (
                      <li key={link.id}>
                        <FooterExternalLink link={link} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Franja inferior */}
      <div className="relative border-t border-white/10 bg-graphite-950/50 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-maastel-300">
            <span>© {new Date().getFullYear()} {brandName}.</span>
            <span className="hidden sm:inline">
              Todos los derechos reservados.
            </span>
            <button
              type="button"
              onClick={openCookieSettings}
              className="underline-offset-2 transition hover:text-white hover:underline"
            >
              Cookies
            </button>
            <span className="flex items-center gap-1">
              Desarrollado por{" "}
              <Star size={12} className="fill-maastel-500 text-maastel-500" />
              JhonnVicTech
              <Star size={12} className="fill-maastel-500 text-maastel-500" />
            </span>
          </div>
          <button
            onClick={scrollToTop}
            className="group flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-maastel-200 ring-1 ring-white/10 transition hover:bg-maastel-500 hover:text-white hover:ring-transparent"
          >
            Subir
            <ArrowUp
              size={14}
              className="transition group-hover:-translate-y-1"
            />
          </button>
        </div>
      </div>

      {/* Botón flotante de WhatsApp — usa el WhatsApp de la sucursal principal */}
      {primaryWhatsAppLink && (
        <a
          href={primaryWhatsAppLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chatea por WhatsApp"
          className="group fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-green-500 p-4 shadow-2xl shadow-green-500/50 transition hover:bg-green-400 hover:shadow-green-400/70"
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-green-500 opacity-30" />
          <WhatsAppIcon size={24} />
          <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold text-white transition-all duration-500 group-hover:max-w-xs group-hover:pr-2 sm:inline">
            Chatea con nosotros
          </span>
        </a>
      )}
    </footer>
  );
}

/**
 * Mapea cada `kind` de enlace externo a un icono Lucide adecuado para
 * que el footer muestre rápidamente de qué tipo es (ARCOTEL/MINTEL,
 * Speedtest, etc.) sin requerir que el admin suba un logo.
 */
const EXTERNAL_LINK_ICONS = {
  ARCOTEL: Building2,
  MINTEL: Building2,
  SPEEDTEST: Gauge,
  GOVERNMENT: Building2,
  TOOL: Wrench,
  SOCIAL: Share2,
  GENERIC: Globe,
};

function FooterExternalLink({ link }) {
  const Icon = EXTERNAL_LINK_ICONS[link.kind] ?? Globe;
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm transition hover:-translate-y-0.5 hover:border-maastel-400/40 hover:bg-white/10"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-maastel-500/15 text-maastel-300 transition group-hover:bg-maastel-500 group-hover:text-white">
        <Icon size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold text-white">{link.label}</div>
        {link.description && (
          <div className="truncate text-[11px] text-maastel-300">
            {link.description}
          </div>
        )}
      </div>
      <ArrowRight
        size={13}
        className="shrink-0 text-maastel-300 transition group-hover:translate-x-1 group-hover:text-maastel-400"
      />
    </a>
  );
}

