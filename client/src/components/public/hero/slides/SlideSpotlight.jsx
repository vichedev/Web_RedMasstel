import { ArrowRight, Star, ZoomIn } from "lucide-react";
import { buildImageUrl } from "../../../../utils/imageUrl";
import { Countdown } from "../parts/Countdown";
import { MagneticButton } from "../parts/MagneticButton";

/**
 * Spotlight: la imagen al centro como un producto sobre un pedestal con
 * iluminación radial detrás. Ideal para una promoción de un solo producto
 * estrella.
 */
export function SlideSpotlight({ promotion, slideKey, onImageClick }) {
  return (
    <div className="absolute inset-0">
      {/* Fondo: degradados radiales que simulan un foco */}
      <div className="absolute inset-0 bg-graphite-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,rgba(255,209,0,0.18),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,102,204,0.25),transparent_70%)]" />

      <div className="relative z-10 mx-auto grid h-full max-w-7xl grid-cols-1 items-center gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-12 lg:px-8">
        {/* Texto izquierda */}
        <div
          key={`${slideKey}-left`}
          className="animate-text-rise space-y-4 text-left lg:text-right"
          style={{ animationDelay: "0ms" }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-maastel-400/40 bg-maastel-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-maastel-300">
            <Star size={11} className="fill-maastel-400" />
            Producto estrella
          </div>
          <h1
            className="text-4xl font-black leading-tight text-white sm:text-5xl"
            style={{ textWrap: "balance" }}
          >
            <span className="bg-gradient-to-r from-maastel-300 via-maastel-200 to-maastel-400 bg-clip-text text-transparent animate-neon-glow">
              {promotion.title}
            </span>
          </h1>
          <p className="text-base leading-relaxed text-maastel-100/85 sm:text-lg">
            {promotion.description}
          </p>
        </div>

        {/* Imagen al centro como pedestal */}
        <button
          type="button"
          onClick={() => onImageClick(promotion)}
          className="group relative mx-auto block aspect-square w-full max-w-[400px] cursor-zoom-in"
          aria-label={`Ampliar imagen: ${promotion.title}`}
          key={`${slideKey}-img`}
        >
          {/* Halo radiante detrás */}
          <div className="absolute -inset-12 rounded-full bg-[conic-gradient(from_0deg,rgba(255,209,0,0.4),rgba(0,102,204,0.4),rgba(255,209,0,0.4))] opacity-60 blur-3xl animate-pulse-glow" />
          {/* Pedestal sutil */}
          <div className="absolute -bottom-8 left-1/2 h-8 w-3/4 -translate-x-1/2 rounded-full bg-black/40 blur-2xl" />

          <div className="relative h-full w-full overflow-hidden rounded-3xl border-[6px] border-white/10 shadow-2xl shadow-maastel-400/20 transition group-hover:border-maastel-400/40 group-hover:shadow-maastel-400/40">
            <img
              src={buildImageUrl(promotion.imageUrl)}
              alt={promotion.title}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105 animate-ken-burns"
              draggable={false}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-graphite-950/0 transition group-hover:bg-graphite-950/40">
              <span className="flex items-center gap-2 rounded-full bg-white/95 px-5 py-3 text-sm font-black text-graphite-900 opacity-0 transition group-hover:opacity-100">
                <ZoomIn size={16} /> Ver imagen
              </span>
            </div>
          </div>
        </button>

        {/* CTA derecha */}
        <div
          key={`${slideKey}-right`}
          className="animate-text-rise flex flex-col items-start gap-4 lg:items-start"
          style={{ animationDelay: "200ms" }}
        >
          {promotion.endDate && <Countdown endDate={promotion.endDate} />}
          <MagneticButton
            href={promotion.ctaLink || "/productos"}
            className="group inline-flex items-center gap-2 rounded-full bg-maastel-400 px-7 py-4 text-base font-black uppercase tracking-wider text-graphite-900 shadow-xl shadow-maastel-400/30 transition hover:bg-maastel-300"
          >
            {promotion.ctaText || "Quiero esto"}
            <ArrowRight
              size={18}
              className="transition group-hover:translate-x-1"
            />
          </MagneticButton>
          <a
            href="/contacto"
            className="text-sm font-bold uppercase tracking-wider text-maastel-200 underline-offset-4 transition hover:text-maastel-300 hover:underline"
          >
            Solicitar cotización →
          </a>
        </div>
      </div>
    </div>
  );
}
