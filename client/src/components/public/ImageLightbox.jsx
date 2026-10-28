import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { buildImageUrl } from "../../utils/imageUrl";

/**
 * Lightbox reutilizable para visualizar imágenes.
 * Props:
 * - images: array de { url, title, description } O una sola string (url)
 * - initialIndex: índice inicial (default 0)
 * - onClose: callback al cerrar
 */
export function ImageLightbox({ images, initialIndex = 0, onClose }) {
  // Normaliza: si nos pasan un string, lo convertimos a array
  const items = Array.isArray(images)
    ? images
    : [{ url: images, title: "", description: "" }];

  const [current, setCurrent] = useState(initialIndex);
  const total = items.length;
  const active = items[current];

  useEffect(() => {
    setCurrent(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % total);
      if (e.key === "ArrowLeft") setCurrent((c) => (c - 1 + total) % total);
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [total, onClose]);

  // Guarda: si no hay imagen válida, no renderiza nada
  if (!active || !active.url) return null;

  const goPrev = (e) => {
    e?.stopPropagation();
    setCurrent((c) => (c - 1 + total) % total);
  };

  const goNext = (e) => {
    e?.stopPropagation();
    setCurrent((c) => (c + 1) % total);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-label="Visor de imagen"
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
        aria-label="Cerrar visor"
      >
        <X size={22} />
      </button>

      {total > 1 && (
        <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-white backdrop-blur">
          {current + 1} / {total}
        </div>
      )}

      {total > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:left-8"
            aria-label="Imagen anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:right-8"
            aria-label="Imagen siguiente"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[90vh] max-w-[90vw] flex-col items-center gap-4"
      >
        <img
          src={buildImageUrl(active.url)}
          alt={active.title || "Imagen"}
          className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl animate-in zoom-in-95 duration-300"
        />

        {(active.title || active.description) && (
          <div className="max-w-2xl rounded-2xl bg-white/10 p-4 text-center text-white backdrop-blur">
            {active.title && (
              <h3 className="text-lg font-black">{active.title}</h3>
            )}
            {active.description && (
              <p className="mt-1 text-sm text-white/80">{active.description}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
