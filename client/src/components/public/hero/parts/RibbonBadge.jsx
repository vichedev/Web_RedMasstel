import { Sparkles } from "lucide-react";

/**
 * Cinta diagonal estilo "anuncio de revista" para la esquina del slide.
 * Color según el `badgeColor` de la promoción (mapeado a Tailwind).
 */
const COLOR_MAP = {
  RED: "from-red-500 to-red-700 text-white",
  AMBER: "from-amber-400 to-amber-600 text-graphite-900",
  GREEN: "from-emerald-500 to-emerald-700 text-white",
  BLUE: "from-maastel-500 to-maastel-700 text-white",
  PURPLE: "from-purple-500 to-purple-700 text-white",
  SUN: "from-maastel-400 to-maastel-500 text-graphite-900",
};

export function RibbonBadge({
  text = "Oferta",
  color = "SUN",
  position = "top-left",
}) {
  const cls = COLOR_MAP[color] ?? COLOR_MAP.SUN;
  const positionCls = {
    "top-left": "left-0 top-0 origin-top-left -rotate-[30deg] -translate-x-[28%] translate-y-[80%]",
    "top-right": "right-0 top-0 origin-top-right rotate-[30deg] translate-x-[28%] translate-y-[80%]",
  }[position];

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <div
        className={`absolute flex w-[260px] items-center justify-center gap-2 bg-gradient-to-r py-2 text-[11px] font-black uppercase tracking-[0.25em] shadow-2xl ${cls} ${positionCls}`}
      >
        <Sparkles size={12} />
        {text}
        <Sparkles size={12} />
      </div>
    </div>
  );
}
