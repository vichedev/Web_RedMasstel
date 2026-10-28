import {
  Eye,
  Sparkles,
  Wifi,
  Tv,
  ArrowUpDown,
  CheckCircle2,
  Tag,
} from "lucide-react";
import { buildImageUrl } from "../../../utils/imageUrl";
import { WhatsAppIcon } from "../BrandIcons";
import { getBrand } from "../../../config/brand";
import { useWhatsAppLink } from "../../../hooks/useWhatsAppLink";

export function ProductCard({ product, onQuickView, index = 0 }) {
  const brand = getBrand(product.brand);
  const internet = product.planType !== "TV";
  const buildLink = useWhatsAppLink();
  const waLink = buildLink(product.brand, product);
  const features = Array.isArray(product.features) ? product.features : [];

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition duration-500 hover:-translate-y-2 hover:border-maastel-200 hover:shadow-2xl hover:shadow-maastel-500/10"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Badge personalizado o "Destacado" */}
      {product.badge ? (
        <div className={`absolute left-3 top-3 z-10 rounded-full bg-gradient-to-r ${brand.accent} px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg`}>
          {product.badge}
        </div>
      ) : product.isFeatured ? (
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-gradient-to-r from-maastel-400 to-maastel-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
          <Sparkles size={11} />
          Destacado
        </div>
      ) : null}

      {/* Pill con marca */}
      <div className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-maastel-700 shadow-md backdrop-blur">
        {internet ? <Wifi size={10} /> : <Tv size={10} />}
        {brand.name}
      </div>

      <div className="aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <img
          src={buildImageUrl(product.imageUrl)}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
        />
        <button
          onClick={() => onQuickView(product)}
          className="absolute inset-0 flex items-center justify-center bg-graphite-900/0 opacity-0 transition duration-300 group-hover:bg-graphite-900/30 group-hover:opacity-100"
          aria-label="Vista rápida"
        >
          <span className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-graphite-900 shadow-xl">
            <Eye size={16} />
            Vista rápida
          </span>
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="line-clamp-2 text-xl font-black tracking-tight text-graphite-900 group-hover:text-maastel-700 sm:text-2xl">
          {product.name}
        </h3>

        {/* Atributo principal: velocidad o canales */}
        {internet && product.downloadSpeed ? (
          <div className="inline-flex items-center gap-1.5 self-start rounded-lg bg-maastel-50 px-2.5 py-1 text-xs font-black text-maastel-700">
            <ArrowUpDown size={12} />
            {product.downloadSpeed}
            {product.uploadSpeed ? `/${product.uploadSpeed}` : ""} Mbps
          </div>
        ) : !internet && product.channels ? (
          <div className="inline-flex items-center gap-1.5 self-start rounded-lg bg-maastel-50 px-2.5 py-1 text-xs font-black text-maastel-700">
            <Tv size={12} />
            {product.channels} canales
            {product.hdChannels ? ` · ${product.hdChannels} HD` : ""}
          </div>
        ) : null}

        <p className="line-clamp-2 text-xs text-gray-600">
          {product.description}
        </p>

        {/* Lista de features */}
        {features.length > 0 && (
          <ul className="mt-1 space-y-1">
            {features.slice(0, 3).map((f) => (
              <li
                key={f}
                className="flex items-start gap-1.5 text-[11px] font-semibold text-gray-700"
              >
                <CheckCircle2
                  size={12}
                  className="mt-0.5 shrink-0 text-maastel-600"
                />
                <span className="line-clamp-1">{f}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Precio + Etiqueta */}
        <div className="mt-auto pt-3">
          <div className="flex items-end justify-between gap-2">
            {product.price ? (
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-maastel-700">
                  ${Number(product.price).toFixed(2)}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  /mes
                </span>
              </div>
            ) : (
              <span className="rounded-full bg-maastel-50 px-3 py-1 text-xs font-bold text-maastel-700">
                Consultar precio
              </span>
            )}
          </div>
          {product.category?.name && (
            <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-maastel-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-maastel-700 ring-1 ring-maastel-100">
              <Tag size={10} />
              {product.category.name}
            </div>
          )}
        </div>

        {waLink ? (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${brand.accent} px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:shadow-lg`}
          >
            <WhatsAppIcon size={14} />
            {brand.ctaLabel}
          </a>
        ) : (
          <button
            onClick={() => onQuickView(product)}
            className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${brand.accent} px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:shadow-lg`}
          >
            {brand.ctaLabel}
          </button>
        )}
      </div>

      <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-maastel-500 to-maastel-400 transition-all duration-500 group-hover:w-full" />
    </article>
  );
}
