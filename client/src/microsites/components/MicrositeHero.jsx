import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import { useMicrosite } from "../MicrositeContext";
import { getMicrositeContent } from "../content";
import { useBrandingMap } from "../../hooks/useBranding";
import { useActivePromotions } from "../../hooks/usePromotions";
import { brandSlotSuffix } from "../../config/brand";
import { PromotionsHero } from "../../components/public/hero/PromotionsHero";
import defaultLogo from "../../assets/logo-redmaastel.svg";

/**
 * Hero del microsite — versión "fascinante".
 *
 * Layout: full-viewport (`min-h-screen`) en 12 columnas, contenido a
 * la izquierda (7 cols) y bloque visual del logo a la derecha (5 cols)
 * con un anillo decorativo y dos badges flotantes.
 *
 * Capas de fondo:
 *   1. Gradiente cónico animado con la paleta de la marca.
 *   2. Grid técnico tenue (cuadrícula).
 *   3. Orbes desenfocados (glow) flotando.
 *   4. Líneas SVG diagonales para "circuit feel".
 *
 * Animaciones del proyecto reusadas: `animate-text-rise`, `animate-pulse-glow`,
 * `animate-gradient-shift`, `animate-float-slow`, `animate-float-medium`,
 * `animate-bounce-soft` (definidas en index.css).
 */

// Tema visual de Red MaasTel. Clases estáticas para que Tailwind las
// detecte en build time — NO concatenamos strings dinámicos.
const HERO_THEME = {
    REDMAASTEL: {
        chip: "border-maastel-300/40 bg-maastel-500/10 text-maastel-200",
        chipDot: "bg-maastel-300",
        ctaGradient: "from-maastel-500 to-maastel-700",
        ctaShadow: "shadow-maastel-500/40",
        ctaHover: "hover:from-maastel-600 hover:to-graphite-800",
        glowSm: "bg-maastel-500/30",
        glowMd: "bg-maastel-500/40",
        glowLg: "bg-maastel-400/30",
        highlight: "from-maastel-200 via-white to-maastel-100",
        statBorder: "border-maastel-300/30",
        statValue: "text-maastel-200",
        ringOuter: "border-maastel-300/30",
        ringInner: "border-maastel-400/50",
        floatBadge1: "from-maastel-500 to-maastel-700",
        floatBadge2: "from-maastel-500 to-maastel-700",
    },
};

export function MicrositeHero() {
    const { brandKey, brand } = useMicrosite();
    const content = getMicrositeContent(brandKey);
    const theme = HERO_THEME[brandKey] ?? HERO_THEME.REDMAASTEL;
    const { map: branding } = useBrandingMap();

    // Promociones activas filtradas al microsite actual + globales.
    // Si hay al menos una, el carrusel de PromotionsHero toma el lugar
    // del hero default — así cualquier promo creada desde el dashboard
    // se ve aquí automáticamente.
    const { data: promotions = [], isLoading: promosLoading } =
        useActivePromotions(brandKey);

    if (!promosLoading && promotions.length > 0) {
        return <PromotionsHero promotions={promotions} />;
    }

    const Icon = content.icon;
    const heroSlot = `HERO_LOGO_${brandSlotSuffix(brandKey)}`;
    const logoUrl = branding[heroSlot]?.url ?? defaultLogo;
    const logoAlt = branding[heroSlot]?.alt ?? brand.name;

    const features = content.hero.features ?? [];

    return (
        <section className="relative isolate flex min-h-[calc(100vh-3rem)] items-center overflow-hidden bg-graphite-950 text-white">
            {/* ── Capa 1: gradientes cónicos animados ────────────────────── */}
            <div className="absolute inset-0 animate-gradient-shift bg-[radial-gradient(ellipse_70%_50%_at_15%_15%,rgba(237, 125, 43,0.45),transparent),radial-gradient(ellipse_55%_40%_at_85%_85%,rgba(222, 101, 23,0.32),transparent),radial-gradient(ellipse_45%_35%_at_50%_50%,rgba(237, 125, 43,0.18),transparent)]" />

            {/* ── Capa 2: grid técnico tenue ─────────────────────────────── */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_85%)]" />

            {/* ── Capa 3: líneas diagonales tipo circuit ─────────────────── */}
            <svg
                aria-hidden
                className="absolute inset-0 h-full w-full opacity-20"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
            >
                <defs>
                    <linearGradient id="hero-stripe" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                        <stop offset="50%" stopColor="rgba(255,255,255,0.5)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </linearGradient>
                </defs>
                <line x1="0" y1="22" x2="100" y2="22" stroke="url(#hero-stripe)" strokeWidth="0.12" />
                <line x1="0" y1="78" x2="100" y2="78" stroke="url(#hero-stripe)" strokeWidth="0.12" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="url(#hero-stripe)" strokeWidth="0.08" />
            </svg>

            {/* ── Capa 4: orbes desenfocados con la paleta de la marca ───── */}
            <div className={`absolute -left-32 top-12 h-96 w-96 animate-pulse-glow rounded-full blur-[140px] ${theme.glowMd}`} />
            <div
                className={`absolute -right-32 bottom-0 h-[32rem] w-[32rem] animate-pulse-glow rounded-full blur-[160px] ${theme.glowLg}`}
                style={{ animationDelay: "2.5s" }}
            />

            {/* ── Esquinas tipo HUD ──────────────────────────────────────── */}
            <CornerBracket position="top-left" />
            <CornerBracket position="top-right" />
            <CornerBracket position="bottom-left" />
            <CornerBracket position="bottom-right" />

            {/* ── Contenido principal ───────────────────────────────────── */}
            <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:py-24 lg:px-8">
                {/* ── Columna izquierda: texto + CTAs + stats ──────────── */}
                <div className="space-y-7 lg:col-span-7">
                    {/* Chip "estado" con punto pulsante */}
                    <div
                        className={`animate-text-rise inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.22em] backdrop-blur ${theme.chip}`}
                        style={{ animationDelay: "0ms" }}
                    >
                        <span className="relative flex h-2 w-2">
                            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${theme.chipDot}`} />
                            <span className={`relative inline-flex h-2 w-2 rounded-full ${theme.chipDot}`} />
                        </span>
                        <Sparkles size={12} />
                        {content.chip}
                    </div>

                    {/* Titular masivo */}
                    <h1
                        className="animate-text-rise text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl xl:text-[5.5rem]"
                        style={{ animationDelay: "120ms", textWrap: "balance" }}
                    >
                        <span className="block text-white">{content.hero.title}</span>
                        <span className="relative inline-block">
                            <span
                                className={`bg-gradient-to-r bg-clip-text text-transparent animate-neon-glow ${theme.highlight}`}
                            >
                                {content.hero.highlight}
                            </span>
                            <span
                                aria-hidden
                                className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"
                            />
                        </span>
                        {content.hero.tail ? (
                            <span className="block text-white">{content.hero.tail}</span>
                        ) : null}
                    </h1>

                    {/* Subtitular */}
                    <p
                        className="animate-text-rise max-w-xl text-base leading-relaxed text-maastel-100/85 sm:text-lg"
                        style={{ animationDelay: "240ms" }}
                    >
                        {content.hero.subtitle}
                    </p>

                    {/* CTAs */}
                    <div
                        className="animate-text-rise flex flex-wrap gap-3 pt-1"
                        style={{ animationDelay: "360ms" }}
                    >
                        <Link
                            to={content.hero.ctaPrimary.to}
                            className={`group inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-7 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-xl transition ${theme.ctaGradient} ${theme.ctaShadow} ${theme.ctaHover}`}
                        >
                            {content.hero.ctaPrimary.label}
                            <ArrowRight
                                size={16}
                                className="transition group-hover:translate-x-1"
                            />
                        </Link>
                        <Link
                            to={content.hero.ctaSecondary.to}
                            className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-black uppercase tracking-wider text-white backdrop-blur transition hover:border-white/40 hover:bg-white/10"
                        >
                            {content.hero.ctaSecondary.label}
                        </Link>
                    </div>

                    {/* Stats por marca — card row */}
                    {features.length > 0 && (
                        <div
                            className="animate-text-rise grid grid-cols-2 gap-3 pt-6 sm:grid-cols-4"
                            style={{ animationDelay: "480ms" }}
                        >
                            {features.map((f, i) => (
                                <div
                                    key={`${f.value}-${i}`}
                                    className={`relative overflow-hidden rounded-2xl border bg-white/[0.03] px-4 py-3 backdrop-blur transition hover:bg-white/[0.06] ${theme.statBorder}`}
                                >
                                    <div
                                        className={`text-xl font-black tracking-tight sm:text-2xl ${theme.statValue}`}
                                    >
                                        {f.value}
                                    </div>
                                    <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">
                                        {f.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Columna derecha: visual del logo con anillos ──────── */}
                <div className="relative hidden items-center justify-center lg:col-span-5 lg:flex">
                    <div className="relative h-[420px] w-[420px]">
                        {/* Anillo exterior rotando */}
                        <div
                            aria-hidden
                            className={`absolute inset-0 rounded-full border-2 border-dashed ${theme.ringOuter}`}
                            style={{
                                animation: "spin 28s linear infinite",
                            }}
                        />
                        {/* Anillo interior contra-rotando */}
                        <div
                            aria-hidden
                            className={`absolute inset-8 rounded-full border ${theme.ringInner}`}
                            style={{
                                animation: "spin 22s linear infinite reverse",
                            }}
                        />

                        {/* Halo central */}
                        <div
                            aria-hidden
                            className={`absolute inset-16 rounded-full blur-2xl ${theme.glowMd}`}
                        />

                        {/* Card del logo (centrado): fondo blanco para que el
                            logo (texto oscuro + naranja) se lea bien. */}
                        <div className="absolute inset-x-6 top-1/2 flex h-48 -translate-y-1/2 items-center justify-center overflow-hidden rounded-3xl bg-white px-8 py-6 ring-4 ring-white/25 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.65),0_0_60px_-10px_rgba(237,125,43,0.55)]">
                            <span
                                aria-hidden
                                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-maastel-50/60 via-transparent to-transparent"
                            />
                            {logoUrl ? (
                                <img
                                    src={logoUrl}
                                    alt={logoAlt}
                                    className="relative h-full w-full object-contain"
                                />
                            ) : (
                                <Icon
                                    size={140}
                                    strokeWidth={1.4}
                                    className="relative text-maastel-600"
                                />
                            )}
                        </div>

                        {/* Badge flotante 1 (icono circular, top-right) */}
                        <div
                            className={`absolute -right-2 top-6 flex h-16 w-16 animate-float-slow items-center justify-center rounded-2xl bg-gradient-to-br shadow-2xl ring-2 ring-white/20 ${theme.floatBadge1}`}
                        >
                            <Icon size={28} strokeWidth={2} className="text-white" />
                        </div>

                        {/* Badge flotante 2 (sparkles, bottom-left) */}
                        <div
                            className={`absolute -left-3 bottom-8 flex h-14 w-14 animate-float-medium items-center justify-center rounded-2xl bg-gradient-to-br shadow-2xl ring-2 ring-white/20 ${theme.floatBadge2}`}
                            style={{ animationDelay: "1s" }}
                        >
                            <Sparkles size={22} strokeWidth={2.2} className="text-white" />
                        </div>

                        {/* LED "online" */}
                        <span className="absolute right-12 top-12 flex h-3 w-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-graphite-950" />
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Indicador de scroll ────────────────────────────────────── */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                <div className="flex flex-col items-center gap-1 text-white/40">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
                        Scroll
                    </span>
                    <ChevronDown size={16} className="animate-bounce-soft" />
                </div>
            </div>
        </section>
    );
}

/**
 * Pequeñas esquinas tipo HUD — refuerzan la sensación "tech" sin
 * agregar texto. Cuatro instancias en cada esquina del hero.
 */
function CornerBracket({ position }) {
    const map = {
        "top-left": "left-4 top-4 border-l-2 border-t-2",
        "top-right": "right-4 top-4 border-r-2 border-t-2",
        "bottom-left": "left-4 bottom-4 border-l-2 border-b-2",
        "bottom-right": "right-4 bottom-4 border-r-2 border-b-2",
    };
    return (
        <span
            aria-hidden
            className={`pointer-events-none absolute h-6 w-6 border-maastel-400/30 ${map[position]}`}
        />
    );
}
