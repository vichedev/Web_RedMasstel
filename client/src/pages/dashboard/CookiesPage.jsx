import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Cookie, CheckCircle2, XCircle, Percent, CalendarDays, RefreshCw } from "lucide-react";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { Skeleton } from "../../components/dashboard/Skeleton";
import { cookieConsentService } from "../../services/cookieConsentService";

const ACCEPT = "#10b981"; // emerald-500
const REJECT = "#ef4444"; // red-500

/** "Chrome · Windows" a partir del user-agent. */
function describeAgent(ua) {
  if (!ua) return "Desconocido";
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\/|Opera/.test(ua)
      ? "Opera"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Chrome\//.test(ua)
          ? "Chrome"
          : /Safari\//.test(ua)
            ? "Safari"
            : "Otro";
  const os = /Android/.test(ua)
    ? "Android"
    : /iPhone|iPad|iPod/.test(ua)
      ? "iOS"
      : /Windows/.test(ua)
        ? "Windows"
        : /Mac OS X/.test(ua)
          ? "macOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "Otro";
  return `${browser} · ${os}`;
}

const fmtDateTime = (d) =>
  new Date(d).toLocaleString("es-EC", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const fmtDay = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "short",
  });

export function CookiesPage() {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["cookie-consent", "stats"],
    queryFn: cookieConsentService.stats,
    refetchInterval: 60_000,
  });

  return (
    <>
      <PageHeader
        title="Cookies"
        description="Cuántos visitantes aceptaron o rechazaron el aviso de cookies del sitio. Se cuenta un registro por navegador; si alguien cambia de opinión se actualiza su registro."
      />

      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-gray-600 shadow-sm ring-1 ring-gray-100 transition hover:bg-gray-50"
        >
          <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      {isLoading || !data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={CheckCircle2} label="Aceptaron" value={data.accepted} color={ACCEPT} />
            <StatCard icon={XCircle} label="Rechazaron" value={data.rejected} color={REJECT} />
            <StatCard
              icon={Percent}
              label="Tasa de aceptación"
              value={`${data.acceptanceRate}%`}
              sub={`${data.total} respuestas en total`}
              color="#ed7d2b"
            />
            <StatCard
              icon={CalendarDays}
              label="Últimos 7 días"
              value={data.last7Days}
              sub="respuestas nuevas o actualizadas"
              color="#6366f1"
            />
          </div>

          <AcceptanceBar accepted={data.accepted} rejected={data.rejected} />
          <DailyChart rows={data.daily} />
          <RecentTable rows={data.recent} />
        </div>
      )}
    </>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow"
          style={{ background: color }}
        >
          <Icon size={18} />
        </div>
        <div className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</div>
      </div>
      <div className="mt-3 text-3xl font-black tabular-nums text-graphite-900">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-gray-500">{sub}</div>}
    </div>
  );
}

function AcceptanceBar({ accepted, rejected }) {
  const total = accepted + rejected;
  const pa = total ? (accepted / total) * 100 : 0;
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div className="mb-3 flex items-center gap-2 text-sm font-black text-graphite-900">
        <Cookie size={16} className="text-maastel-600" />
        Distribución total
      </div>
      {total === 0 ? (
        <p className="text-sm text-gray-500">
          Aún no hay respuestas. Aparecerán aquí cuando los visitantes acepten o rechacen el aviso.
        </p>
      ) : (
        <>
          <div className="flex h-4 w-full gap-0.5 overflow-hidden rounded-full bg-gray-100">
            {accepted > 0 && <div style={{ width: `${pa}%`, background: ACCEPT }} />}
            {rejected > 0 && <div style={{ width: `${100 - pa}%`, background: REJECT }} />}
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-600">
            <Legend color={ACCEPT} text={`Aceptaron ${accepted} (${pa.toFixed(1)}%)`} />
            <Legend color={REJECT} text={`Rechazaron ${rejected} (${(100 - pa).toFixed(1)}%)`} />
          </div>
        </>
      )}
    </div>
  );
}

function Legend({ color, text }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      {text}
    </span>
  );
}

function DailyChart({ rows = [] }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(1, ...rows.map((r) => r.accepted + r.rejected));
  const active = hover !== null ? rows[hover] : null;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-black text-graphite-900">Últimos 30 días</div>
        <div className="text-xs text-gray-500">
          {active
            ? `${fmtDay(active.date)} · ${active.accepted} aceptaron · ${active.rejected} rechazaron`
            : "Pasa el cursor sobre una barra para ver el detalle"}
        </div>
      </div>
      <div className="flex h-40 items-end gap-[3px]" onMouseLeave={() => setHover(null)}>
        {rows.map((r, i) => {
          const total = r.accepted + r.rejected;
          return (
            <div
              key={r.date}
              onMouseEnter={() => setHover(i)}
              className={`flex h-full flex-1 cursor-default flex-col justify-end rounded-sm ${
                hover === i ? "bg-gray-100" : ""
              }`}
              title={`${fmtDay(r.date)}: ${r.accepted} aceptaron, ${r.rejected} rechazaron`}
            >
              {total > 0 && (
                <div className="flex w-full flex-col gap-px" style={{ height: `${(total / max) * 100}%` }}>
                  {r.rejected > 0 && (
                    <div className="rounded-t-[3px]" style={{ flex: r.rejected, background: REJECT }} />
                  )}
                  {r.accepted > 0 && (
                    <div
                      className={r.rejected > 0 ? "" : "rounded-t-[3px]"}
                      style={{ flex: r.accepted, background: ACCEPT }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {rows.length > 0 && (
        <div className="mt-2 flex justify-between text-[11px] text-gray-400">
          <span>{fmtDay(rows[0].date)}</span>
          <span>Hoy</span>
        </div>
      )}
      <div className="mt-3 flex gap-4 text-xs text-gray-600">
        <Legend color={ACCEPT} text="Aceptaron" />
        <Legend color={REJECT} text="Rechazaron" />
      </div>
    </div>
  );
}

function RecentTable({ rows = [] }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      <div className="border-b border-gray-100 px-5 py-4 text-sm font-black text-graphite-900">
        Respuestas recientes
      </div>
      {rows.length === 0 ? (
        <p className="px-5 py-6 text-sm text-gray-500">Sin respuestas todavía.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-5 py-2.5">Fecha</th>
                <th className="px-5 py-2.5">Decisión</th>
                <th className="px-5 py-2.5">Navegador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="whitespace-nowrap px-5 py-2.5 tabular-nums text-gray-600">
                    {fmtDateTime(r.updatedAt)}
                  </td>
                  <td className="px-5 py-2.5">
                    {r.decision === "ACCEPTED" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                        <CheckCircle2 size={12} /> Aceptó
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700">
                        <XCircle size={12} /> Rechazó
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-5 py-2.5 text-gray-600">
                    {describeAgent(r.userAgent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
