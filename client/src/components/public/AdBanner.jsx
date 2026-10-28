import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowUpRight,
  Sparkles,
  Zap,
  TrendingUp,
  Flame,
  Gift,
  Tag,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import { useActiveAds } from "../../hooks/useActiveAds";
import { buildImageUrl } from "../../utils/imageUrl";
import { ImageLightbox } from "./ImageLightbox";
import { TiltCard3D } from "./hero/parts/TiltCard3D";
import { useMicrosite } from "../../microsites/MicrositeContext";

const AUTO_ROTATE_MS = 5000; // 5 segundos entre cambios
const PAUSE_AFTER_INTERACTION_MS = 10000; // 10s de pausa tras interacción manual

const BADGE_COLORS = {
  SUN: {
    bg: "bg-maastel-400",
    text: "text-graphite-900",
    glow: "shadow-maastel-400/50",
  },
  RED: { bg: "bg-red-500", text: "text-white", glow: "shadow-red-500/50" },
  AMBER: {
    bg: "bg-amber-500",
    text: "text-white",
    glow: "shadow-amber-500/50",
  },
  GREEN: {
    bg: "bg-emerald-500",
    text: "text-white",
    glow: "shadow-emerald-500/50",
  },
  BLUE: {
    bg: "bg-maastel-600",
    text: "text-white",
    glow: "shadow-maastel-500/50",
  },
  PURPLE: {
    bg: "bg-purple-500",
    text: "text-white",
    glow: "shadow-purple-500/50",
  },
};

function getBadgeIcon(text) {
  if (!text) return Sparkles;
  const t = text.toLowerCase();
  if (t.includes("oferta") || t.includes("descuento") || t.includes("%"))
    return Tag;
  if (t.includes("nuevo") || t.includes("exclusivo")) return Sparkles;
  if (t.includes("hot") || t.includes("flash")) return Flame;
  if (t.includes("regalo") || t.includes("gift")) return Gift;
  if (t.includes("limite") || t.includes("ultima")) return Zap;
  return TrendingUp;
}

// ─── Hook de paginación con auto-rotación ───
function useAutoPagination(items, perPage = 4, autoMs = AUTO_ROTATE_MS) {
  const [page, setPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false); // pausa manual (botón)
  const [isHovered, setIsHovered] = useState(false); // pausa por hover
  const [tick, setTick] = useState(0); // reinicia la barra de progreso
  const interactionTimerRef = useRef(null);

  const totalPages = Math.ceil(items.length / perPage);
  const start = page * perPage;
  const current = items.slice(start, start + perPage);

  // Indica si debe rotar
  const shouldAutoRotate = totalPages > 1 && !isPaused && !isHovered;

  // Auto-rotación
  useEffect(() => {
    if (!shouldAutoRotate) return;
    const timer = setTimeout(() => {
      setPage((p) => (p + 1) % totalPages);
      setTick((t) => t + 1);
    }, autoMs);
    return () => clearTimeout(timer);
  }, [shouldAutoRotate, page, totalPages, autoMs, tick]);

  // Handlers manuales — pausan brevemente la auto-rotación
  const pauseBriefly = useCallback(() => {
    setIsPaused(true);
    if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
    interactionTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, PAUSE_AFTER_INTERACTION_MS);
  }, []);

  const goNext = useCallback(() => {
    setPage((p) => (p + 1) % totalPages);
    setTick((t) => t + 1);
    pauseBriefly();
  }, [totalPages, pauseBriefly]);

  const goPrev = useCallback(() => {
    setPage((p) => (p - 1 + totalPages) % totalPages);
    setTick((t) => t + 1);
    pauseBriefly();
  }, [totalPages, pauseBriefly]);

  const goTo = useCallback(
    (n) => {
      setPage(n);
      setTick((t) => t + 1);
      pauseBriefly();
    },
    [pauseBriefly],
  );

  const togglePause = useCallback(() => {
    if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
    setIsPaused((p) => !p);
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (interactionTimerRef.current)
        clearTimeout(interactionTimerRef.current);
    };
  }, []);

  return {
    current,
    page,
    totalPages,
    goNext,
    goPrev,
    goTo,
    togglePause,
    isPaused,
    isAutoRunning: shouldAutoRotate,
    tick, // sirve como key para reiniciar la animación de progreso
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };
}

export function AdBanner({ position, variant = "auto" }) {
  const { brandKey } = useMicrosite();
  const { ads, loading } = useActiveAds(position, brandKey);
  const [lightboxAd, setLightboxAd] = useState(null);

  if (loading || ads.length === 0) return null;

  const resolvedVariant =
    variant === "auto" ? positionToVariant(position) : variant;
  const openLightbox = (ad) => setLightboxAd(ad);
  const closeLightbox = () => setLightboxAd(null);

  let content;
  switch (resolvedVariant) {
    case "hero-top":
      content = <HeroTopBanner ads={ads} onImageClick={openLightbox} />;
      break;
    case "showcase":
      content = <ShowcaseBanner ads={ads} onImageClick={openLightbox} />;
      break;
    case "cta-bottom":
      content = <CtaBottomBanner ads={ads} onImageClick={openLightbox} />;
      break;
    default:
      content = <ShowcaseBanner ads={ads} onImageClick={openLightbox} />;
  }

  return (
    <>
      {content}
      {lightboxAd && (
        <ImageLightbox images={lightboxAd.imageUrl} onClose={closeLightbox} />
      )}
    </>
  );
}

function positionToVariant(position) {
  const map = {
    HOME_TOP: "hero-top",
    HOME_MIDDLE: "showcase",
    HOME_BOTTOM: "cta-bottom",
  };
  return map[position] || "showcase";
}

// ─── Paginación con auto-rotación ───
function Pagination({
  page,
  totalPages,
  goNext,
  goPrev,
  goTo,
  togglePause,
  isPaused,
  isAutoRunning,
  tick,
  theme = "light",
}) {
  if (totalPages <= 1) return null;

  const styles = {
    light: {
      nav: "bg-white text-maastel-700 ring-1 ring-gray-200 hover:bg-maastel-50 hover:ring-maastel-400",
      dotActive: "bg-maastel-700 w-8",
      dotInactive: "bg-gray-300 hover:bg-gray-400 w-2",
      text: "text-gray-600",
      progressTrack: "bg-gray-200",
      progressBar: "bg-maastel-700",
    },
    dark: {
      nav: "bg-white/10 text-white ring-1 ring-white/20 backdrop-blur hover:bg-white/20",
      dotActive: "bg-maastel-400 w-8",
      dotInactive: "bg-white/30 hover:bg-white/50 w-2",
      text: "text-white/80",
      progressTrack: "bg-white/10",
      progressBar: "bg-maastel-400",
    },
  };
  const s = styles[theme];

  return (
    <div className="mt-10 flex flex-col items-center gap-4">
      {/* Barra de progreso (visible cuando auto-rota) */}
      <div
        className={`h-0.5 w-40 overflow-hidden rounded-full ${s.progressTrack}`}
      >
        {isAutoRunning ? (
          <div
            key={tick}
            className={`h-full ${s.progressBar}`}
            style={{
              animation: `progressBar ${AUTO_ROTATE_MS}ms linear forwards`,
            }}
          />
        ) : (
          <div className={`h-full w-full ${s.progressBar} opacity-30`} />
        )}
      </div>

      {/* Indicador "Página X de Y" */}
      <div className={`text-xs font-bold uppercase tracking-wider ${s.text}`}>
        Página <span className="text-maastel-500">{page + 1}</span> de {totalPages}
        {isPaused && (
          <span className="ml-2 text-[10px] opacity-60">· En pausa</span>
        )}
      </div>

      {/* Controles */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={goPrev}
          className={`flex h-10 w-10 items-center justify-center rounded-full shadow transition ${s.nav}`}
          aria-label="Página anterior"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all ${i === page ? s.dotActive : s.dotInactive}`}
              aria-label={`Ir a página ${i + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={goNext}
          className={`flex h-10 w-10 items-center justify-center rounded-full shadow transition ${s.nav}`}
          aria-label="Página siguiente"
        >
          <ChevronRight size={18} />
        </button>

        {/* Separador visual */}
        <div
          className={`h-6 w-px ${theme === "dark" ? "bg-white/20" : "bg-gray-300"}`}
        />

        {/* Play / Pause */}
        <button
          type="button"
          onClick={togglePause}
          className={`flex h-10 w-10 items-center justify-center rounded-full shadow transition ${s.nav}`}
          aria-label={
            isPaused ? "Reanudar auto-rotación" : "Pausar auto-rotación"
          }
          title={isPaused ? "Reanudar" : "Pausar"}
        >
          {isPaused ? <Play size={16} /> : <Pause size={16} />}
        </button>
      </div>

      {/* Hint sutil */}
      <p className={`text-[10px] italic ${s.text} opacity-60`}>
        {isPaused
          ? "Pulsa ▶ para reanudar"
          : "Pasa el cursor para pausar · Cambia cada 5s"}
      </p>
    </div>
  );
}

// ─── CTA Button ───
function CtaButton({ link, ctaText, variant = "default" }) {
  const isExternal = /^https?:\/\//.test(link);

  const styles = {
    default:
      "bg-maastel-400 px-6 py-3 text-sm text-graphite-900 shadow-xl shadow-maastel-400/40 hover:bg-maastel-300 hover:shadow-2xl",
    small:
      "bg-maastel-400 px-4 py-2 text-xs text-graphite-900 shadow-xl hover:bg-maastel-300 hover:shadow-2xl",
    big: "bg-maastel-400 px-7 py-4 text-sm text-graphite-900 shadow-2xl shadow-maastel-400/40 hover:bg-maastel-300 hover:shadow-maastel-400/60 hover:scale-105",
  };

  const iconSize = variant === "big" ? 18 : 16;
  const className = `group/cta inline-flex items-center gap-2 rounded-full font-black uppercase tracking-wider transition ${styles[variant]}`;
  const handleClick = (e) => e.stopPropagation();

  if (isExternal) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={className}
      >
        {ctaText}
        <ArrowUpRight
          size={iconSize}
          className="transition group-hover/cta:translate-x-1 group-hover/cta:-translate-y-1"
        />
      </a>
    );
  }

  return (
    <a href={link} onClick={handleClick} className={className}>
      {ctaText}
      <ArrowUpRight
        size={iconSize}
        className="transition group-hover/cta:translate-x-1 group-hover/cta:-translate-y-1"
      />
    </a>
  );
}

// ─── HOME_TOP ───
function HeroTopBanner({ ads, onImageClick }) {
  const pag = useAutoPagination(ads, 1);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-maastel-50 via-white to-maastel-50 py-12">
      <div className="absolute left-0 top-0 h-40 w-40 animate-pulse rounded-full bg-maastel-200/40 blur-3xl" />
      <div
        className="absolute bottom-0 right-0 h-60 w-60 animate-pulse rounded-full bg-maastel-200/50 blur-3xl"
        style={{ animationDelay: "1s" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,102,204,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,102,204,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-maastel-600 to-graphite-800 px-4 py-1 text-xs font-black uppercase tracking-wider text-white shadow-lg">
            <Zap size={12} className="animate-pulse" />
            No te lo pierdas
          </div>
        </div>

        <div
          key={pag.page}
          className="animate-in fade-in duration-500"
          onMouseEnter={pag.onMouseEnter}
          onMouseLeave={pag.onMouseLeave}
        >
          {pag.current.map((ad) => (
            <HeroTopCard key={ad.id} ad={ad} onImageClick={onImageClick} />
          ))}
        </div>

        <Pagination {...pag} theme="light" />
      </div>
    </section>
  );
}

function HeroTopCard({ ad, onImageClick }) {
  const BadgeIcon = getBadgeIcon(ad.badgeText);
  const badgeStyle = BADGE_COLORS[ad.badgeColor] || BADGE_COLORS.SUN;

  return (
    <TiltCard3D maxTilt={5} className="group relative overflow-hidden rounded-3xl shadow-2xl shadow-maastel-500/10 transition duration-700 hover:shadow-maastel-500/30">
      <div className="relative aspect-[21/7] overflow-hidden">
        <button
          type="button"
          onClick={() => onImageClick(ad)}
          className="absolute inset-0 h-full w-full cursor-zoom-in"
          aria-label={`Ver imagen de ${ad.title}`}
        >
          <img
            src={buildImageUrl(ad.imageUrl)}
            alt={ad.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-110"
          />
        </button>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-graphite-950/80 via-graphite-950/30 to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-maastel-400/20 blur-3xl transition duration-1000 group-hover:scale-150" />

        {ad.badgeText && (
          <div
            className={`pointer-events-none absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-black uppercase tracking-wider shadow-2xl ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.glow}`}
          >
            <BadgeIcon size={12} className="animate-pulse" />
            {ad.badgeText}
          </div>
        )}

        <div className="pointer-events-none absolute inset-y-0 left-0 flex max-w-2xl flex-col justify-center p-8 text-white sm:p-12">
          <h3 className="text-3xl font-black leading-tight drop-shadow-lg sm:text-5xl">
            {ad.title}
          </h3>
          {ad.subtitle && (
            <p className="mt-3 text-base text-white/90 drop-shadow-md sm:text-lg">
              {ad.subtitle}
            </p>
          )}
          {ad.link && ad.ctaText && (
            <div className="pointer-events-auto mt-5">
              <CtaButton
                link={ad.link}
                ctaText={ad.ctaText}
                variant="default"
              />
            </div>
          )}
        </div>
      </div>
    </TiltCard3D>
  );
}

// ─── HOME_MIDDLE ───
function ShowcaseBanner({ ads, onImageClick }) {
  const pag = useAutoPagination(ads, 4);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-maastel-50/30 to-white py-16">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,102,204,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,102,204,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-maastel-200/30 blur-3xl" />
      <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-maastel-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-maastel-400 to-maastel-500 px-4 py-1 text-xs font-black uppercase tracking-wider text-graphite-900 shadow-lg">
            <TrendingUp size={12} />
            Ofertas imperdibles
          </div>
          <h3 className="text-3xl font-black text-graphite-900 sm:text-5xl">
            Promociones{" "}
            <span className="bg-gradient-to-r from-maastel-600 via-maastel-700 to-graphite-900 bg-clip-text text-transparent">
              exclusivas
            </span>
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-gray-600">
            Descubre las mejores oportunidades seleccionadas para ti.
          </p>
        </div>

        <div
          key={pag.page}
          className="grid animate-in fade-in gap-6 duration-500 sm:grid-cols-2"
          onMouseEnter={pag.onMouseEnter}
          onMouseLeave={pag.onMouseLeave}
        >
          {pag.current.map((ad, idx) => (
            <ShowcaseCard
              key={ad.id}
              ad={ad}
              idx={pag.page * 4 + idx}
              onImageClick={onImageClick}
            />
          ))}
        </div>

        <Pagination {...pag} theme="light" />
      </div>
    </section>
  );
}

function ShowcaseCard({ ad, idx, onImageClick }) {
  const BadgeIcon = getBadgeIcon(ad.badgeText);
  const badgeStyle = BADGE_COLORS[ad.badgeColor] || BADGE_COLORS.SUN;

  return (
    <TiltCard3D maxTilt={10} className="group relative overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100 transition duration-700 hover:shadow-2xl hover:shadow-maastel-500/30 hover:ring-maastel-200">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-maastel-500 via-maastel-400 to-maastel-500 opacity-0 transition duration-500 group-hover:opacity-100" />

      <div className="relative aspect-[4/3] overflow-hidden">
        <button
          type="button"
          onClick={() => onImageClick(ad)}
          className="absolute inset-0 h-full w-full cursor-zoom-in"
          aria-label={`Ver imagen de ${ad.title}`}
        >
          <img
            src={buildImageUrl(ad.imageUrl)}
            alt={ad.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-110"
          />
        </button>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-graphite-950/90 via-graphite-950/40 to-transparent transition duration-500 group-hover:from-graphite-950/95" />

        <div className="pointer-events-none absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-maastel-400 to-maastel-500 text-base font-black text-graphite-900 shadow-2xl shadow-maastel-400/50">
          {String(idx + 1).padStart(2, "0")}
        </div>

        {ad.badgeText && (
          <div
            className={`pointer-events-none absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider shadow-2xl ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.glow}`}
          >
            <BadgeIcon size={11} className="animate-pulse" />
            {ad.badgeText}
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6">
          <div className="min-w-0 flex-1">
            <h4 className="text-2xl font-black leading-tight text-white drop-shadow-lg sm:text-3xl">
              {ad.title}
            </h4>
            {ad.subtitle && (
              <p className="mt-2 text-sm text-white/90 drop-shadow-md">
                {ad.subtitle}
              </p>
            )}
            {ad.link && ad.ctaText && (
              <div className="pointer-events-auto mt-4">
                <CtaButton
                  link={ad.link}
                  ctaText={ad.ctaText}
                  variant="small"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-1.5 w-full bg-gradient-to-r from-maastel-500 via-maastel-400 to-maastel-500 opacity-0 transition duration-500 group-hover:opacity-100" />
    </TiltCard3D>
  );
}

// ─── HOME_BOTTOM ───
function CtaBottomBanner({ ads, onImageClick }) {
  const pag = useAutoPagination(ads, 1);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-graphite-950 via-graphite-900 to-graphite-950 py-20">
      <div className="absolute inset-0 animate-pulse bg-[radial-gradient(ellipse_70%_50%_at_30%_0%,rgba(0,102,204,0.4),transparent),radial-gradient(ellipse_60%_50%_at_70%_100%,rgba(255,209,0,0.15),transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute -left-20 top-10 h-72 w-72 animate-pulse rounded-full bg-maastel-500/30 blur-[120px]" />
      <div
        className="absolute -right-20 bottom-10 h-96 w-96 animate-pulse rounded-full bg-maastel-400/20 blur-[140px]"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div
          key={pag.page}
          className="animate-in fade-in duration-500"
          onMouseEnter={pag.onMouseEnter}
          onMouseLeave={pag.onMouseLeave}
        >
          {pag.current.map((ad) => (
            <CtaBottomCard key={ad.id} ad={ad} onImageClick={onImageClick} />
          ))}
        </div>

        <Pagination {...pag} theme="dark" />
      </div>
    </section>
  );
}

function CtaBottomCard({ ad, onImageClick }) {
  const BadgeIcon = getBadgeIcon(ad.badgeText);
  const badgeStyle = BADGE_COLORS[ad.badgeColor] || BADGE_COLORS.SUN;

  return (
    <TiltCard3D maxTilt={6} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur transition duration-700 hover:border-maastel-400/40 hover:shadow-maastel-400/20">
      <div className="grid items-stretch gap-0 md:grid-cols-[1.2fr_1fr]">
        <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto">
          <button
            type="button"
            onClick={() => onImageClick(ad)}
            className="absolute inset-0 h-full w-full cursor-zoom-in"
            aria-label={`Ver imagen de ${ad.title}`}
          >
            <img
              src={buildImageUrl(ad.imageUrl)}
              alt={ad.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-1000 group-hover:scale-110"
            />
          </button>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent to-graphite-950/95 md:bg-gradient-to-l" />

          {ad.badgeText && (
            <div
              className={`pointer-events-none absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-black uppercase tracking-wider shadow-2xl ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.glow}`}
            >
              <BadgeIcon size={12} className="animate-pulse" />
              {ad.badgeText}
            </div>
          )}
        </div>

        <div className="relative flex flex-col justify-center p-8 text-white md:p-12">
          <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-maastel-400/10 blur-3xl transition duration-1000 group-hover:bg-maastel-400/20 group-hover:scale-150" />

          <div className="relative space-y-5">
            <h3 className="text-3xl font-black leading-tight drop-shadow-lg sm:text-5xl">
              {ad.title}
            </h3>
            <svg className="h-2 w-40" viewBox="0 0 300 12" fill="none">
              <path
                d="M2 9C60 3 120 3 180 6C220 8 260 9 298 6"
                stroke="rgb(255, 209, 0)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            {ad.subtitle && (
              <p className="text-lg leading-relaxed text-maastel-100/90">
                {ad.subtitle}
              </p>
            )}
            {ad.link && ad.ctaText && (
              <div className="pt-2">
                <CtaButton link={ad.link} ctaText={ad.ctaText} variant="big" />
              </div>
            )}
          </div>
        </div>
      </div>
    </TiltCard3D>
  );
}
