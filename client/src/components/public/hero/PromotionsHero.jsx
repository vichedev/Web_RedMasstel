import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { ImageLightbox } from "../ImageLightbox";
import { buildImageUrl } from "../../../utils/imageUrl";
import { SlideCinematic } from "./slides/SlideCinematic";
import { SlideBillboard } from "./slides/SlideBillboard";
import { SlideSpotlight } from "./slides/SlideSpotlight";
import { FloatingParticles } from "./parts/FloatingParticles";
import { ScrollIndicator } from "./parts/ScrollIndicator";
import { CustomCursor } from "./parts/CustomCursor";

const SLIDE_DURATION = 6000;

const SLIDE_COMPONENTS = {
  CINEMATIC: SlideCinematic,
  BILLBOARD: SlideBillboard,
  SPOTLIGHT: SlideSpotlight,
};

export function PromotionsHero({ promotions }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [progressKey, setProgressKey] = useState(0);

  const containerRef = useRef(null);
  const lastTick = useRef(0);

  const total = promotions.length;

  // Auto-play (se pausa al hacer hover, abrir lightbox o cambiar de pestaña)
  useEffect(() => {
    if (total <= 1) return;
    if (paused || lightboxIndex !== null) return;

    const id = setTimeout(() => {
      setCurrent((c) => (c + 1) % total);
      setProgressKey((k) => k + 1);
    }, SLIDE_DURATION);
    return () => clearTimeout(id);
  }, [current, paused, lightboxIndex, total]);

  // Pausar autoplay si la pestaña no está visible
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const goTo = (idx) => {
    if (Date.now() - lastTick.current < 200) return; // evita spam
    lastTick.current = Date.now();
    setCurrent(((idx % total) + total) % total);
    setProgressKey((k) => k + 1);
  };

  const handleImageClick = (promo) => {
    const idx = promotions.findIndex((p) => p.id === promo.id);
    setLightboxIndex(idx >= 0 ? idx : 0);
  };

  // Soporte de teclado (←/→)
  useEffect(() => {
    const onKey = (e) => {
      if (lightboxIndex !== null) return;
      if (e.key === "ArrowLeft") goTo(current - 1);
      else if (e.key === "ArrowRight") goTo(current + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, total, lightboxIndex]);

  const lightboxImages = promotions.map((p) => ({
    url: p.imageUrl,
    title: p.title,
    description: p.description,
  }));

  return (
    <>
      <section
        ref={containerRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="relative min-h-[640px] overflow-hidden bg-graphite-950 text-white"
      >
        {/* Slides cross-fade */}
        <div className="relative h-[640px]">
          {promotions.map((promo, idx) => {
            const Slide = SLIDE_COMPONENTS[promo.layout] ?? SlideCinematic;
            const isActive = idx === current;
            return (
              <div
                key={promo.id}
                aria-hidden={!isActive}
                className={`absolute inset-0 transition-opacity duration-700 ${isActive
                    ? "opacity-100"
                    : "pointer-events-none opacity-0"
                  }`}
              >
                <Slide
                  promotion={promo}
                  slideKey={`${promo.id}-${progressKey}`}
                  onImageClick={handleImageClick}
                />
              </div>
            );
          })}

          {/* Partículas globales sobre todos los slides */}
          <FloatingParticles count={14} />
        </div>

        {/* Barra de progreso superior */}
        {total > 1 && !paused && (
          <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 h-1 bg-white/10">
            <div
              key={progressKey}
              className="h-full bg-gradient-to-r from-maastel-400 via-maastel-300 to-maastel-400"
              style={{
                animation: `progressBar ${SLIDE_DURATION}ms linear forwards`,
              }}
            />
          </div>
        )}

        {/* Controles laterales */}
        {total > 1 && (
          <>
            <button
              onClick={() => goTo(current - 1)}
              className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:scale-110 hover:bg-white/20 sm:left-6"
              aria-label="Anterior"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={() => goTo(current + 1)}
              className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:scale-110 hover:bg-white/20 sm:right-6"
              aria-label="Siguiente"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {/* Botón "Ver imagen" — abre el lightbox del slide actual */}
        <button
          type="button"
          onClick={() => handleImageClick(promotions[current])}
          aria-label="Ver imagen en grande"
          className="group absolute bottom-6 right-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-white backdrop-blur transition hover:border-white/40 hover:bg-white/20 sm:right-6"
        >
          <ZoomIn size={14} />
          Ver imagen
        </button>

        {/* Thumbnails de slides */}
        {total > 1 && (
          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {promotions.map((p, idx) => {
              const isActive = idx === current;
              return (
                <button
                  key={p.id}
                  onClick={() => goTo(idx)}
                  className={`group relative h-12 overflow-hidden rounded-lg border transition-all ${isActive
                      ? "w-20 border-maastel-400 shadow-lg shadow-maastel-400/30"
                      : "w-12 border-white/30 opacity-70 hover:opacity-100"
                    }`}
                  aria-label={`Ir a ${p.title}`}
                  title={p.title}
                >
                  <img
                    src={buildImageUrl(p.imageUrl)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  {!isActive && (
                    <div className="absolute inset-0 bg-graphite-950/40 transition group-hover:bg-graphite-950/0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        <ScrollIndicator />

        {/* Cursor custom solo dentro del Hero */}
        <CustomCursor containerRef={containerRef} label="Ver" />
      </section>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
