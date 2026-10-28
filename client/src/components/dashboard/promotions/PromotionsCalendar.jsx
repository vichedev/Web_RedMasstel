import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

/**
 * Calendario mensual sencillo. Sin dependencias externas, solo Date.
 * Pinta cada promoción como una "barra" sobre los días en los que está activa.
 *
 * Reglas:
 *  - Una promo sin startDate se trata como activa "desde antes del mes mostrado".
 *  - Una promo sin endDate se trata como activa "hasta después del mes mostrado".
 *  - isActive=false → sale a opacidad reducida.
 */
const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}
function addMonths(date, n) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}
function clampDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function dayDiff(a, b) {
  return Math.round((clampDay(b) - clampDay(a)) / 86400000);
}

export function PromotionsCalendar({ promotions = [], onPromotionClick }) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));

  const monthLabel = useMemo(
    () =>
      cursor.toLocaleDateString("es-EC", {
        month: "long",
        year: "numeric",
      }),
    [cursor],
  );

  const grid = useMemo(() => buildMonthGrid(cursor), [cursor]);
  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);

  // Promos visibles en este mes con su rango clampeado dentro del mes.
  const visiblePromos = useMemo(() => {
    return promotions
      .map((p) => {
        const start = p.startDate ? new Date(p.startDate) : monthStart;
        const end = p.endDate ? new Date(p.endDate) : monthEnd;
        if (end < monthStart || start > monthEnd) return null;
        const clampedStart = start < monthStart ? monthStart : start;
        const clampedEnd = end > monthEnd ? monthEnd : end;
        return { promo: p, start: clampedStart, end: clampedEnd };
      })
      .filter(Boolean);
  }, [promotions, monthStart, monthEnd]);

  const today = clampDay(new Date());

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-gray-100">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-maastel-700" />
          <h3 className="text-sm font-black uppercase tracking-wider text-graphite-900">
            {monthLabel}
          </h3>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setCursor((d) => addMonths(d, -1))}
            className="rounded-lg p-1.5 text-gray-600 transition hover:bg-gray-100"
            aria-label="Mes anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => setCursor(startOfMonth(new Date()))}
            className="rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-maastel-700 transition hover:bg-maastel-50"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => setCursor((d) => addMonths(d, 1))}
            className="rounded-lg p-1.5 text-gray-600 transition hover:bg-gray-100"
            aria-label="Mes siguiente"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl bg-gray-200">
        {WEEK_DAYS.map((d) => (
          <div
            key={d}
            className="bg-gray-50 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-gray-500"
          >
            {d}
          </div>
        ))}
        {grid.map((cell, idx) => {
          const inMonth = cell.getMonth() === cursor.getMonth();
          const isToday = clampDay(cell).getTime() === today.getTime();
          const promosToday = visiblePromos.filter(
            ({ start, end }) =>
              clampDay(cell) >= clampDay(start) &&
              clampDay(cell) <= clampDay(end),
          );
          return (
            <div
              key={idx}
              className={`relative min-h-[80px] bg-white p-1.5 ${
                inMonth ? "" : "bg-gray-50/60"
              }`}
            >
              <div
                className={`mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                  isToday
                    ? "bg-maastel-700 text-white"
                    : inMonth
                      ? "text-gray-700"
                      : "text-gray-400"
                }`}
              >
                {cell.getDate()}
              </div>
              <div className="space-y-1">
                {promosToday.slice(0, 3).map(({ promo }) => (
                  <button
                    type="button"
                    key={promo.id}
                    onClick={() => onPromotionClick?.(promo)}
                    title={promo.title}
                    className={`block w-full truncate rounded-md px-1.5 py-0.5 text-left text-[10px] font-semibold transition hover:opacity-80 ${
                      promo.isActive
                        ? "bg-maastel-100 text-graphite-800"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {promo.title}
                  </button>
                ))}
                {promosToday.length > 3 && (
                  <div className="text-[10px] font-semibold text-gray-500">
                    +{promosToday.length - 3} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Devuelve un grid de 6 semanas (42 días) que encuadra el mes. */
function buildMonthGrid(cursor) {
  const first = startOfMonth(cursor);
  // ISO: lunes = 1 ... domingo = 7. JS: 0=domingo. Ajustamos.
  const startWeekday = first.getDay() === 0 ? 6 : first.getDay() - 1;
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - startWeekday);
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    cells.push(d);
  }
  return cells;
}

// Mantengo este helper exportado por si alguna otra vista lo necesita.
export { dayDiff };
