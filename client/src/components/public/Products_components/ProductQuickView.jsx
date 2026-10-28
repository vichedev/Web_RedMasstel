import { useEffect, useState } from "react";
import {
  X,
  Sparkles,
  Tag,
  ArrowUpDown,
  Wifi,
  Tv,
  CheckCircle2,
  ZoomIn,
} from "lucide-react";
import { buildImageUrl } from "../../../utils/imageUrl";
import { ImageLightbox } from "../ImageLightbox";
import { WhatsAppIcon } from "../BrandIcons";
import { getBrand } from "../../../config/brand";
import { useWhatsAppLink } from "../../../hooks/useWhatsAppLink";

export function ProductQuickView({ product, onClose }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && !lightboxOpen) onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose, lightboxOpen]);

  if (!product) return null;

  const brand = getBrand(product.brand);
  const internet = product.planType !== "TV";
  const buildLink = useWhatsAppLink();
  const waLink = buildLink(product.brand, product);
  const features = Array.isArray(product.features) ? product.features : [];

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative my-8 w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-lg backdrop-blur transition hover:bg-white"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>

          <div className="grid md:grid-cols-2">
            {/* Imagen clickeable */}
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="group relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 md:aspect-auto"
              aria-label={`Ampliar imagen: ${product.name}`}
            >
              <img
                src={buildImageUrl(product.imageUrl)}
                alt={product.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 flex items-center justify-center bg-graphite-950/0 opacity-0 transition duration-300 group-hover:bg-graphite-950/40 group-hover:opacity-100">
                <div className="flex items-center gap-2 rounded-full bg-white/95 px-5 py-3 text-sm font-black text-graphite-900 shadow-2xl">
                  <ZoomIn size={18} />
                  Ver imagen
                </div>
              </div>

              {product.badge ? (
                <div className={`absolute left-4 top-4 rounded-full bg-gradient-to-r ${brand.accent} px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-lg`}>
                  {product.badge}
                </div>
              ) : product.isFeatured ? (
                <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-gradient-to-r from-maastel-400 to-maastel-500 px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-lg">
                  <Sparkles size={12} />
                  Destacado
                </div>
              ) : null}
            </button>

            {/* Información del plan */}
            <div className="flex flex-col justify-between p-8">
              <div>
                <div className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${brand.accent} px-3 py-1 text-xs font-black uppercase tracking-wider text-white`}>
                  {internet ? <Wifi size={12} /> : <Tv size={12} />}
                  {brand.name}
                </div>

                <h2 className="mt-4 text-3xl font-black leading-tight text-graphite-900">
                  {product.name}
                </h2>

                {/* Atributo principal */}
                {internet && product.downloadSpeed ? (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-maastel-50 px-4 py-2 text-graphite-800">
                    <ArrowUpDown size={16} />
                    <span className="text-lg font-black">
                      {product.downloadSpeed}
                      {product.uploadSpeed ? `/${product.uploadSpeed}` : ""}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-maastel-700">
                      Mbps
                    </span>
                  </div>
                ) : !internet && product.channels ? (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-maastel-50 px-4 py-2 text-maastel-800">
                    <Tv size={16} />
                    <span className="text-lg font-black">
                      {product.channels} canales
                    </span>
                    {product.hdChannels ? (
                      <span className="text-xs font-bold uppercase tracking-wider text-maastel-700">
                        · {product.hdChannels} en HD
                      </span>
                    ) : null}
                  </div>
                ) : null}

                {product.price ? (
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-4xl font-black text-maastel-700">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    <span className="text-sm font-semibold text-gray-500">
                      USD / mes
                    </span>
                  </div>
                ) : (
                  <div className="mt-4 inline-block rounded-full bg-maastel-100 px-4 py-2 text-sm font-bold text-maastel-700">
                    Precio a consultar
                  </div>
                )}

                {product.category?.name && (
                  <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-maastel-50 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-maastel-700 ring-1 ring-maastel-100">
                    <Tag size={11} />
                    {product.category.name}
                  </div>
                )}

                <div className="mt-6">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Descripción
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-gray-700">
                    {product.description}
                  </p>
                </div>

                {features.length > 0 && (
                  <div className="mt-5">
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Lo que incluye
                    </div>
                    <ul className="mt-2 space-y-1.5">
                      {features.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <CheckCircle2
                            size={16}
                            className="mt-0.5 shrink-0 text-maastel-600"
                          />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-8">
                {waLink ? (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${brand.accent} px-6 py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg transition hover:shadow-2xl hover:shadow-maastel-500/30`}
                  >
                    <WhatsAppIcon size={18} />
                    {brand.ctaLabel}
                  </a>
                ) : (
                  <div className="rounded-xl bg-amber-50 px-4 py-3 text-center text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                    Configura el WhatsApp de la sucursal en el panel
                    administrativo para habilitar el botón de contacto.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <ImageLightbox
          images={[
            {
              url: product.imageUrl,
              title: product.name,
              description: product.description,
            },
          ]}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
