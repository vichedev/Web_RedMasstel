import { useMemo, useState } from "react";
import {
  ImagePlus,
  LayoutDashboard,
  Wifi,
  PanelTop,
  PanelBottom,
} from "lucide-react";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { Skeleton } from "../../components/dashboard/Skeleton";
import { ImageUploader } from "../../components/dashboard/ImageUploader";
import { useBranding, useUpdateBrandingAsset } from "../../hooks/useBranding";
import { buildImageUrl } from "../../utils/imageUrl";

/**
 * Metadatos visuales de cada slot. La copia explica al admin DÓNDE va
 * a verse el logo en el sitio público y le sugiere el formato ideal.
 */
const SLOT_META = {
  NAVBAR_LOGO: {
    title: "Navbar",
    icon: PanelTop,
    accent: "from-maastel-600 to-maastel-700",
    section: "header",
    hint: "Logo del navbar del sitio. PNG/SVG con fondo transparente, alto ~80px.",
    aspect: "aspect-[3/1]",
  },
  HERO_LOGO: {
    title: "Hero",
    icon: Wifi,
    accent: "from-maastel-500 to-maastel-700",
    section: "hero",
    hint: "Logo que aparece en el showcase del hero del home. PNG/SVG con fondo transparente.",
    aspect: "aspect-square",
  },
  FOOTER_LOGO_MAIN: {
    title: "Footer",
    icon: PanelBottom,
    accent: "from-maastel-600 to-maastel-500",
    section: "footer",
    hint: "Logo grande del bloque de marca en el pie de página.",
    aspect: "aspect-[3/1]",
  },
};

const SECTIONS = [
  {
    key: "header",
    title: "Cabecera (navbar)",
    description:
      "Logo del navbar del sitio. Si lo dejas vacío, se usa el logo por defecto del proyecto.",
  },
  {
    key: "hero",
    title: "Hero del home",
    description: "Logo destacado en el hero de la página de inicio.",
  },
  {
    key: "footer",
    title: "Footer",
    description: "Logo destacado del bloque de marca en el pie de página.",
  },
];

export function BrandingPage() {
  const { data: assets = [], isLoading } = useBranding();
  const updateMut = useUpdateBrandingAsset();

  const grouped = useMemo(() => {
    const out = {
      header: [],
      hero: [],
      footer: [],
    };
    for (const a of assets) {
      const meta = SLOT_META[a.slot];
      if (!meta) continue;
      out[meta.section].push(a);
    }
    return out;
  }, [assets]);

  return (
    <>
      <PageHeader
        title="Identidad visual"
        description="Sube los logos que se muestran en el sitio público de Red MaasTel. Si dejas un slot vacío, se usa el logo por defecto del proyecto."
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-72 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {SECTIONS.map((section) => {
            const items = grouped[section.key] ?? [];
            if (items.length === 0) return null;
            return (
              <section key={section.key}>
                <header className="mb-4">
                  <h2 className="text-lg font-black text-graphite-900">
                    {section.title}
                  </h2>
                  <p className="text-sm text-gray-500">{section.description}</p>
                </header>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((asset) => (
                    <SlotCard
                      key={asset.id}
                      asset={asset}
                      onUpdate={(payload) =>
                        updateMut.mutateAsync({ slot: asset.slot, payload })
                      }
                      submitting={updateMut.isPending}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}

function SlotCard({ asset, onUpdate, submitting }) {
  const meta = SLOT_META[asset.slot] ?? {
    title: asset.label,
    icon: LayoutDashboard,
    accent: "from-maastel-500 to-maastel-700",
    hint: "",
    aspect: "aspect-[3/1]",
  };
  const Icon = meta.icon;

  const [alt, setAlt] = useState(asset.alt ?? "");
  const [altDirty, setAltDirty] = useState(false);

  const handleUploaderChange = async (newUrl) => {
    try {
      await onUpdate({ url: newUrl || null });
    } catch {
      /* toast en hook */
    }
  };

  const handleAltSave = async () => {
    if (!altDirty) return;
    try {
      await onUpdate({ alt });
      setAltDirty(false);
    } catch {
      /* toast en hook */
    }
  };

  // Fondo de previsualización: oscuro para los logos que se muestran sobre
  // fondo oscuro en el sitio (footer, hero), claro para los del navbar.
  const darkPreview =
    asset.slot.startsWith("FOOTER_") || asset.slot.startsWith("HERO_");

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      <div
        className={`flex items-center gap-3 bg-gradient-to-r ${meta.accent} px-5 py-4 text-white`}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
            {asset.label}
          </div>
          <div className="truncate text-base font-black">{meta.title}</div>
        </div>
        <span
          className={`ml-auto inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ring-1 ${
            asset.url
              ? "bg-emerald-400/30 text-white ring-emerald-200/50"
              : "bg-amber-400/30 text-white ring-amber-200/50"
          }`}
        >
          {asset.url ? "Cargado" : "Por defecto"}
        </span>
      </div>

      <div className="space-y-4 p-5">
        {/* Preview con el aspect ratio adecuado */}
        <div
          className={`flex w-full items-center justify-center overflow-hidden rounded-xl ring-1 ring-gray-100 ${meta.aspect} ${
            darkPreview
              ? "bg-graphite-950"
              : "bg-gradient-to-br from-gray-50 to-gray-100"
          }`}
        >
          {asset.url ? (
            <img
              src={buildImageUrl(asset.url)}
              alt={asset.alt ?? meta.title}
              className="h-full w-auto max-w-full object-contain p-4"
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-xs text-gray-400">
              <ImagePlus size={22} />
              Sin logo cargado
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
            Archivo
          </label>
          <ImageUploader
            value={asset.url ?? ""}
            onChange={handleUploaderChange}
            disabled={submitting}
          />
          {meta.hint && (
            <p className="mt-2 text-[11px] text-gray-500">{meta.hint}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
            Texto alternativo (accesibilidad)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={alt}
              maxLength={200}
              onChange={(e) => {
                setAlt(e.target.value);
                setAltDirty(true);
              }}
              placeholder={meta.title}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 transition focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100"
            />
            <button
              type="button"
              disabled={!altDirty || submitting}
              onClick={handleAltSave}
              className={`shrink-0 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-wider text-white shadow transition bg-gradient-to-r ${meta.accent} ${
                !altDirty || submitting
                  ? "cursor-not-allowed opacity-50"
                  : "hover:shadow-lg"
              }`}
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
