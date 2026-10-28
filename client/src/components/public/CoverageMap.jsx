import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Sparkles, Wifi, CheckCircle2 } from "lucide-react";
import { COVERAGE, COVERAGE_COLORS, COVERAGE_DEFAULT_VIEW } from "../../data/coverage";

const TAB_ICON = {
  REDMAASTEL: Wifi,
};

const BRAND_LABEL = {
  REDMAASTEL: "Red MaasTel",
};

/**
 * Crea un divIcon de Leaflet con un punto pulsante. Como el HTML
 * vive fuera del árbol de React, los anillos animados se hacen con
 * CSS keyframes inyectadas en el componente.
 */
function buildPulseIcon(color, ring) {
  return L.divIcon({
    className: "coverage-pulse-marker",
    html: `
      <span class="cm-pulse" style="--cm-fill:${color};--cm-ring:${ring}">
        <span class="cm-ring"></span>
        <span class="cm-dot"></span>
      </span>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });
}

/**
 * Subcomponente con acceso al objeto `map` para hacer fitBounds /
 * flyTo cuando cambia la marca activa.
 */
function MapAutoFit({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.flyTo([points[0].lat, points[0].lng], COVERAGE_DEFAULT_VIEW.zoom, { duration: 1.0 });
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.flyToBounds(bounds, { padding: [40, 40], duration: 1.0, maxZoom: 14 });
  }, [points, map]);

  return null;
}

export function CoverageMap({ brand }) {
  const points = useMemo(() => COVERAGE[brand] ?? [], [brand]);
  const colors = COVERAGE_COLORS[brand] ?? COVERAGE_COLORS.REDMAASTEL;
  const icon = useMemo(
    () => buildPulseIcon(colors.fill, colors.ring),
    [colors.fill, colors.ring],
  );
  const Icon = TAB_ICON[brand] ?? Wifi;
  const brandName = BRAND_LABEL[brand] ?? "Red MaasTel";

  // Centro inicial: promedio de los puntos del brand activo
  const center = useMemo(() => {
    if (!points.length) return COVERAGE_DEFAULT_VIEW.center;
    const lat = points.reduce((s, p) => s + p.lat, 0) / points.length;
    const lng = points.reduce((s, p) => s + p.lng, 0) / points.length;
    return [lat, lng];
  }, [points]);

  // Estado para resaltar la zona desde la lista lateral
  const [hover, setHover] = useState(null);

  return (
    <section className="relative isolate overflow-hidden bg-graphite-950 py-16 text-white">
      {/* Capas tech de fondo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_15%_10%,rgba(237, 125, 43,0.32),transparent),radial-gradient(ellipse_50%_40%_at_85%_85%,rgba(222, 101, 23,0.22),transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_85%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-maastel-400/30 bg-maastel-500/10 px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-maastel-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-maastel-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-maastel-400" />
              </span>
              Mapa de cobertura
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              ¿Llegamos a tu{" "}
              <span className="bg-gradient-to-r from-maastel-300 via-white to-maastel-300 bg-clip-text text-transparent">
                zona?
              </span>
            </h2>
            <p className="mt-2 max-w-xl text-sm text-maastel-100/70 sm:text-base">
              Mira en tiempo real dónde tenemos cobertura de{" "}
              <strong className="text-white">{brandName}</strong> en Shushufindi,
              Sucumbíos. Pasa el cursor por una zona para resaltarla.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/70 backdrop-blur">
              <Icon size={13} />
              {brandName}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/70 backdrop-blur">
              <MapPin size={13} className="text-maastel-300" />
              {points.length} zonas
            </span>
          </div>
        </div>

        {/* Layout: mapa + lista de zonas */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Mapa */}
          <div className="lg:col-span-8">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl ring-1 ring-graphite-800/40 backdrop-blur">
              {/* Esquinas HUD */}
              <span className="pointer-events-none absolute left-3 top-3 z-[500] h-5 w-5 border-l-2 border-t-2 border-maastel-400/60" />
              <span className="pointer-events-none absolute right-3 top-3 z-[500] h-5 w-5 border-r-2 border-t-2 border-maastel-400/60" />
              <span className="pointer-events-none absolute left-3 bottom-3 z-[500] h-5 w-5 border-b-2 border-l-2 border-maastel-400/60" />
              <span className="pointer-events-none absolute right-3 bottom-3 z-[500] h-5 w-5 border-b-2 border-r-2 border-maastel-400/60" />

              {/* Pequeño label flotante arriba */}
              <div className="pointer-events-none absolute left-4 top-4 z-[500] inline-flex items-center gap-2 rounded-full bg-graphite-950/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg backdrop-blur">
                <Sparkles size={12} className="text-maastel-300" />
                Cobertura · {brandName}
              </div>

              <MapContainer
                center={center}
                zoom={COVERAGE_DEFAULT_VIEW.zoom}
                scrollWheelZoom={false}
                zoomControl={false}
                style={{ height: "480px", width: "100%", background: "#161a1e" }}
                className="z-0"
              >
                {/* OpenStreetMap (gratis, sin API key). Se oscurece con CSS
                    (.cm-dark-tiles) para que combine con el diseño. */}
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                  maxZoom={19}
                  className="cm-dark-tiles"
                />
                <MapAutoFit points={points} />

                {/* Área de cobertura sombreada */}
                {points
                  .filter((p) => p.radius)
                  .map((p) => (
                    <Circle
                      key={`area-${p.name}`}
                      center={[p.lat, p.lng]}
                      radius={p.radius}
                      pathOptions={{
                        color: colors.fill,
                        weight: 2,
                        dashArray: "6 6",
                        fillColor: colors.fill,
                        fillOpacity: hover === p.name ? 0.28 : 0.16,
                      }}
                    />
                  ))}

                {points.map((p) => (
                  <Marker
                    key={`${brand}-${p.name}`}
                    position={[p.lat, p.lng]}
                    icon={icon}
                    eventHandlers={{
                      mouseover: () => setHover(p.name),
                      mouseout: () => setHover(null),
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                      <span className="text-xs font-black uppercase tracking-wider">
                        {p.name}
                      </span>
                    </Tooltip>
                    <Popup>
                      <div className="text-sm">
                        <div className="font-black text-graphite-900">
                          {p.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          Cobertura {brandName} disponible
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              {/* Leyenda inferior */}
              <div className="border-t border-white/10 bg-graphite-950/80 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 backdrop-blur">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full ring-2 ring-white/30"
                      style={{ background: colors.fill }}
                    />
                    Zona con cobertura
                  </span>
                  <span className="text-white/30">·</span>
                  <span>Haz scroll en el mapa con dos dedos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de zonas */}
          <div className="lg:col-span-4">
            <div className="relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
              <span
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full blur-3xl"
                style={{ background: colors.ring, opacity: 0.5 }}
              />
              <div className="relative">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-maastel-300">
                      Zonas disponibles
                    </div>
                    <div className="mt-0.5 text-xl font-black text-white">
                      {brandName}
                    </div>
                  </div>
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg"
                    style={{ background: colors.fill }}
                  >
                    <Icon size={18} />
                  </span>
                </div>

                <ul
                  key={brand}
                  className="max-h-[400px] space-y-1.5 overflow-y-auto pr-1"
                >
                  {points.map((p, idx) => (
                    <li
                      key={p.name}
                      onMouseEnter={() => setHover(p.name)}
                      onMouseLeave={() => setHover(null)}
                      className={`group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 transition cursor-default ${
                        hover === p.name
                          ? "border-maastel-400/40 bg-white/10"
                          : "hover:border-white/20 hover:bg-white/[0.07]"
                      }`}
                      style={{
                        opacity: 0,
                        animation: `fade-in 500ms ease ${idx * 50}ms forwards`,
                      }}
                    >
                      <CheckCircle2
                        size={14}
                        className="shrink-0"
                        style={{ color: colors.fill }}
                      />
                      <span className="flex-1 text-sm font-bold text-white">
                        {p.name}
                      </span>
                      <span
                        className="h-1.5 w-1.5 rounded-full ring-2 ring-white/20 transition group-hover:scale-125"
                        style={{ background: colors.fill }}
                      />
                    </li>
                  ))}
                </ul>

                <div className="mt-4 rounded-xl border border-white/10 bg-graphite-900/40 p-3 text-xs text-white/70">
                  ¿No ves tu zona?{" "}
                  <a
                    href="#contacto"
                    className="font-black text-maastel-300 underline-offset-4 hover:underline"
                  >
                    Escríbenos
                  </a>
                  {" "}— ampliamos la red cada mes.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos del marker pulsante */}
      <style>{`
        .cm-dark-tiles {
          filter: invert(1) hue-rotate(180deg) brightness(0.92) contrast(0.88) saturate(0.6);
        }
        .leaflet-container {
          font-family: 'Inter', system-ui, sans-serif;
          background: #161a1e;
        }
        .leaflet-popup-content-wrapper {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.4);
        }
        .leaflet-popup-tip {
          background: #ffffff;
        }
        .coverage-pulse-marker {
          background: transparent !important;
          border: 0 !important;
        }
        .cm-pulse {
          position: relative;
          display: block;
          width: 18px;
          height: 18px;
        }
        .cm-pulse .cm-ring {
          position: absolute;
          inset: -4px;
          border-radius: 9999px;
          background: var(--cm-ring);
          animation: cm-ping 1.8s cubic-bezier(0,0,0.2,1) infinite;
        }
        .cm-pulse .cm-dot {
          position: absolute;
          inset: 3px;
          border-radius: 9999px;
          background: var(--cm-fill);
          box-shadow: 0 0 0 2px rgba(255,255,255,0.6),
                      0 0 12px 2px var(--cm-fill);
        }
        @keyframes cm-ping {
          0%   { transform: scale(0.6); opacity: 0.9; }
          80%  { transform: scale(1.7); opacity: 0; }
          100% { transform: scale(1.7); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
