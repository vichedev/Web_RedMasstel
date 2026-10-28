import { Link } from "react-router-dom";
import { ArrowRight, ZoomIn, Sparkles } from "lucide-react";
import { buildImageUrl } from "../../../../utils/imageUrl";
import { Countdown } from "../parts/Countdown";
import { RibbonBadge } from "../parts/RibbonBadge";
import { MagneticButton } from "../parts/MagneticButton";

/**
 * Cinematic: imagen full-bleed de fondo con Ken Burns, glassmorphism panel
 * a la izquierda con el texto. Funciona como un poster de película.
 */
export function SlideCinematic({ promotion, slideKey, onImageClick }) {
  return (
    <div className="absolute inset-0">
      {/* Fondo full-bleed con Ken Burns */}
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

      {/* Vignettes y degradado oscuro */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-graphite-950/95 via-graphite-950/70 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-graphite-950/80 via-transparent to-transparent" />

      <RibbonBadge text="Oferta especial" color="SUN" position="top-left" />

      {/* Panel glassmorphism a la izquierda */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div
          key={slideKey}
          className="relative w-full max-w-xl rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-2xl shadow-2xl sm:p-8 lg:p-10"
        >
          <div
            className="mb-3 inline-flex animate-text-rise items-center gap-2 rounded-full border border-maastel-400/40 bg-maastel-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-maastel-300"
            style={{ animationDelay: "0ms" }}
          >
            <Sparkles size={12} />
            Promoción activa
          </div>

          <h1
            className="animate-text-rise text-4xl font-black leading-[1.05] text-white sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "100ms", textWrap: "balance" }}
          >
            {promotion.title}
          </h1>

          <p
            className="mt-4 animate-text-rise text-base leading-relaxed text-maastel-100/85 sm:text-lg"
            style={{ animationDelay: "200ms" }}
          >
            {promotion.description}
          </p>

          {promotion.endDate && (
            <div
              className="mt-5 animate-text-rise"
              style={{ animationDelay: "300ms" }}
            >
              <Countdown endDate={promotion.endDate} />
            </div>
          )}

          <div
            className="mt-6 flex animate-text-rise flex-wrap gap-3"
            style={{ animationDelay: "400ms" }}
          >
            <MagneticButton
              href={promotion.ctaLink || "/productos"}
              className="group inline-flex items-center gap-2 rounded-full bg-maastel-400 px-7 py-4 text-base font-black uppercase tracking-wider text-graphite-900 shadow-2xl shadow-maastel-400/30 transition hover:bg-maastel-300"
            >
              {promotion.ctaText || "Ver ofertas"}
              <ArrowRight
                size={18}
                className="transition group-hover:translate-x-1"
              />
            </MagneticButton>

            <button
              type="button"
              onClick={() => onImageClick(promotion)}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-4 text-sm font-bold text-white backdrop-blur transition hover:border-white/40 hover:bg-white/10"
            >
              <ZoomIn size={16} />
              Ver imagen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
