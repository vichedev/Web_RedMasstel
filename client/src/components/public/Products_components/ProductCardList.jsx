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

export function ProductCardList({ product, onQuickView, index = 0 }) {
  const brand = getBrand(product.brand);
  const internet = product.planType !== "TV";
  const buildLink = useWhatsAppLink();
  const waLink = buildLink(product.brand, product);
  const features = Array.isArray(product.features) ? product.features : [];

  return (
    <article
      className="group flex gap-4 overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 transition hover:border-maastel-200 hover:shadow-lg"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 sm:h-40 sm:w-40">
        <img
          src={buildImageUrl(product.imageUrl)}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {product.badge ? (
          <div className={`absolute left-2 top-2 rounded-full bg-gradient-to-r ${brand.accent} px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white`}>
            {product.badge}
          </div>
        ) : product.isFeatured ? (
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-gradient-to-r from-maastel-400 to-maastel-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
            <Sparkles size={9} />
            Destacado
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-maastel-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-maastel-700">
            {internet ? <Wifi size={10} /> : <Tv size={10} />}
            {brand.name}
          </div>
          <h3 className="text-2xl font-black tracking-tight text-graphite-900 group-hover:text-maastel-700">
            {product.name}
          </h3>

          {/* Atributo principal */}
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {internet && product.downloadSpeed ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-maastel-100 px-2 py-0.5 text-xs font-black text-maastel-700">
                <ArrowUpDown size={11} />
                {product.downloadSpeed}
                {product.uploadSpeed ? `/${product.uploadSpeed}` : ""} Mbps
              </span>
            ) : !internet && product.channels ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-maastel-100 px-2 py-0.5 text-xs font-black text-maastel-700">
                <Tv size={11} />
                {product.channels} canales
                {product.hdChannels ? ` · ${product.hdChannels} HD` : ""}
              </span>
            ) : null}
          </div>

          <p className="mt-2 line-clamp-2 text-sm text-gray-600">
            {product.description}
          </p>

          {features.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {features.slice(0, 4).map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-1 text-[11px] font-semibold text-gray-700"
                >
                  <CheckCircle2 size={11} className="text-maastel-600" />
                  <span className="line-clamp-1">{f}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-col items-start gap-1">
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
            {product.category?.name && (
              <div className="inline-flex items-center gap-1 rounded-full bg-maastel-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-maastel-700 ring-1 ring-maastel-100">
                <Tag size={10} />
                {product.category.name}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onQuickView(product)}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-maastel-700 transition hover:border-maastel-500 hover:bg-maastel-50"
            >
              <Eye size={14} />
              Detalle
            </button>
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${brand.accent} px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:shadow-lg`}
              >
                <WhatsAppIcon size={12} />
                {brand.ctaLabel}
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
