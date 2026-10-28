import { ArrowRight, Sparkles } from "lucide-react";
import { buildImageUrl } from "../../../../utils/imageUrl";
import { Countdown } from "../parts/Countdown";
import { RibbonBadge } from "../parts/RibbonBadge";
import { MagneticButton } from "../parts/MagneticButton";

/**
 * Billboard: imagen full-bleed con texto centrado, drop-shadow fuerte.
 * Para una imagen impactante que ya cuenta la historia.
 */
export function SlideBillboard({ promotion, slideKey, onImageClick }) {
  return (
    <div className="absolute inset-0">
      <button
        type="button"
        onClick={() => onImageClick(promotion)}
        className="absolute inset-0 cursor-zoom-in"
        aria-label={`Ampliar imagen: ${promotion.title}`}
      >
        <img
          key={slideKey}
          src={buildImageUrl(promotion.imageUrl)}
          alt={promotion.title}
          className="absolute inset-0 h-full w-full object-cover animate-ken-burns"
          draggable={false}
        />
      </button>

      {/* Degradado uniforme oscuro */}
      <div className="pointer-events-none absolute inset-0 bg-graphite-950/55" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-graphite-950/30 via-transparent to-graphite-950/70" />

      <RibbonBadge text="Solo por hoy" color="RED" position="top-right" />

      <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-4 text-center">
        <div
          key={slideKey}
          className="animate-text-rise mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.3em] text-white backdrop-blur"
        >
          <Sparkles size={14} />
          Promoción destacada
        </div>

        <h1
          key={`${slideKey}-title`}
          className="animate-text-rise font-black uppercase leading-[0.95] tracking-tight text-white drop-shadow-2xl"
          style={{
            fontSize: "clamp(2.5rem, 9vw, 7.5rem)",
            textWrap: "balance",
            animationDelay: "100ms",
            textShadow: "0 8px 60px rgba(0,0,0,0.6)",
          }}
        >
          {promotion.title}
        </h1>

        <p
          className="animate-text-rise mt-5 max-w-2xl text-lg font-medium text-maastel-100/90 sm:text-xl"
          style={{ animationDelay: "250ms", textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}
        >
          {promotion.description}
        </p>

        {promotion.endDate && (
          <div
            className="animate-text-rise mt-6"
            style={{ animationDelay: "350ms" }}
          >
            <Countdown endDate={promotion.endDate} />
          </div>
        )}

        <div
          className="animate-text-rise mt-8"
          style={{ animationDelay: "450ms" }}
        >
          <MagneticButton
            href={promotion.ctaLink || "/productos"}
            className="group inline-flex items-center gap-3 rounded-full bg-maastel-400 px-10 py-5 text-base font-black uppercase tracking-[0.15em] text-graphite-900 shadow-2xl shadow-maastel-400/40 transition hover:bg-maastel-300"
          >
            {promotion.ctaText || "Aprovéchalo ahora"}
            <ArrowRight
              size={20}
              className="transition group-hover:translate-x-1"
            />
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}
