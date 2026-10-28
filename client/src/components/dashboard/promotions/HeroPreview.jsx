import { Eye, ExternalLink } from "lucide-react";
import { buildImageUrl } from "../../../utils/imageUrl";

/**
 * Mini-render del Hero del sitio público a partir de los valores actuales del
 * formulario de promoción. Sirve para que el admin vea cómo se verá ANTES de
 * publicar.
 */
export function HeroPreview({ promotion }) {
  const hasContent = promotion?.title || promotion?.imageUrl;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
          <Eye size={14} />
          Vista previa
        </div>
        <span className="text-[10px] text-gray-400">
          Cómo se verá en la página de inicio
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl ring-1 ring-gray-200">
        {!hasContent ? (
          <div className="flex aspect-[16/8] items-center justify-center bg-gray-50 text-sm text-gray-400">
            Empieza a llenar el formulario para ver la previa
          </div>
        ) : (
          <div className="relative aspect-[16/8] overflow-hidden bg-graphite-950">
            {promotion.imageUrl && (
              <img
                src={buildImageUrl(promotion.imageUrl)}
                alt={promotion.title || "Promoción"}
                className="absolute inset-0 h-full w-full object-cover opacity-70"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-graphite-950/90 via-graphite-950/60 to-transparent" />
            <div className="relative flex h-full flex-col justify-center gap-2 p-6">
              {promotion.title && (
                <h3 className="line-clamp-2 text-lg font-black leading-tight text-white sm:text-2xl">
                  {promotion.title}
                </h3>
              )}
              {promotion.description && (
                <p className="line-clamp-2 max-w-md text-xs text-maastel-100 sm:text-sm">
                  {promotion.description}
                </p>
              )}
              {promotion.ctaText && (
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-maastel-400 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-graphite-900 shadow">
                    {promotion.ctaText}
                    {promotion.ctaLink && <ExternalLink size={10} />}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {promotion?.startDate || promotion?.endDate ? (
        <div className="rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-600">
          <span className="font-semibold">Vigencia: </span>
          {promotion.startDate
            ? new Date(promotion.startDate).toLocaleDateString("es-EC")
            : "siempre"}
          {" — "}
          {promotion.endDate
            ? new Date(promotion.endDate).toLocaleDateString("es-EC")
            : "sin caducidad"}
        </div>
      ) : null}
    </div>
  );
}
