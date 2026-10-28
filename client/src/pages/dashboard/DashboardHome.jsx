import { Link } from "react-router-dom";
import {
  Package,
  Tag,
  Megaphone,
  Image as ImageIcon,
  Eye,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import { useAuth } from "../../auth/useAuth";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import { useRecentActivity } from "../../hooks/useAuditLog";
import {
  Skeleton,
  SkeletonStatsCard,
} from "../../components/dashboard/Skeleton";
import { ActivityFeed } from "../../components/dashboard/ActivityFeed";

export function DashboardHome() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();
  const { data: activity = [], isLoading: activityLoading } =
    useRecentActivity(10);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-graphite-900 sm:text-3xl">
          Hola, {user?.name?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Resumen del catálogo de planes de Red MaasTel y la web pública.
        </p>
      </div>

      {/* KPIs principales */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <SkeletonStatsCard />
            <SkeletonStatsCard />
            <SkeletonStatsCard />
            <SkeletonStatsCard />
          </>
        ) : (
          <>
            <KpiCard
              label="Planes publicados"
              value={stats.products.active}
              total={stats.products.total}
              icon={Package}
              color="from-maastel-500 to-maastel-700"
              href="/dashboard/planes"
              footer={`${stats.products.featured} destacados`}
            />
            <KpiCard
              label="Etiquetas activas"
              value={stats.categories.active}
              total={stats.categories.total}
              icon={Tag}
              color="from-emerald-500 to-emerald-700"
              href="/dashboard/etiquetas"
              footer={
                stats.categories.empty > 0
                  ? `${stats.categories.empty} sin planes`
                  : undefined
              }
            />
            <KpiCard
              label="Promociones en vivo"
              value={stats.promotions.activeNow}
              total={stats.promotions.total}
              icon={Megaphone}
              color="from-maastel-400 to-maastel-500"
              darkText
              href="/dashboard/promociones"
              footer={
                stats.promotions.expiringIn7d > 0
                  ? `⚠ ${stats.promotions.expiringIn7d} expira(n) en 7 días`
                  : undefined
              }
            />
            <KpiCard
              label="Banners activos"
              value={stats.ads.active}
              total={stats.ads.total}
              icon={ImageIcon}
              color="from-purple-500 to-purple-700"
              href="/dashboard/publicidad"
              footer={Object.entries(stats.ads.byPosition)
                .map(([pos, n]) => `${shortPosition(pos)}: ${n}`)
                .join(" · ")}
            />
          </>
        )}
      </div>

      {/* Salud del catálogo + alertas */}
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CatalogHealth stats={stats} loading={isLoading} />
        </div>
        <div>
          <AlertsCard stats={stats} loading={isLoading} />
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-100">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-maastel-700" />
            <h3 className="text-sm font-black uppercase tracking-wider text-graphite-900">
              Actividad reciente
            </h3>
          </div>
          {user?.role === "SUPER_ADMIN" && (
            <Link
              to="/dashboard/actividad"
              className="text-xs font-bold uppercase tracking-wider text-maastel-700 transition hover:text-graphite-900"
            >
              Ver todo →
            </Link>
          )}
        </div>
        <ActivityFeed items={activity} loading={activityLoading} compact />
      </div>
    </>
  );
}

function KpiCard({ label, value, total, icon: Icon, color, darkText, footer, href }) {
  const Wrapper = href ? Link : "div";
  const wrapperProps = href ? { to: href } : {};
  const pct = total ? Math.round((value / total) * 100) : 0;

  return (
    <Wrapper
      {...wrapperProps}
      className={`group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition ${
        href ? "cursor-pointer hover:-translate-y-1 hover:shadow-lg" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            {label}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-black text-graphite-900">{value}</span>
            {total !== undefined && (
              <span className="text-xs font-semibold text-gray-400">
                / {total}
              </span>
            )}
          </div>
          {footer && (
            <div className="mt-1 truncate text-[11px] text-gray-500">{footer}</div>
          )}
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${color} shadow-md ${darkText ? "text-graphite-900" : "text-white"}`}
        >
          <Icon size={20} />
        </div>
      </div>
      {total > 0 && (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${color}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {href && (
        <div className="absolute right-3 top-3 opacity-0 transition group-hover:opacity-100">
          <ArrowUpRight size={14} className="text-gray-400" />
        </div>
      )}
    </Wrapper>
  );
}

function CatalogHealth({ stats, loading }) {
  if (loading || !stats) {
    return (
      <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-100">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="mt-4 h-2 w-full" />
        <div className="mt-4 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    );
  }
  const score = stats.catalogHealth.scorePct;
  const tone = score >= 80 ? "good" : score >= 50 ? "mid" : "bad";
  const toneColor = {
    good: "from-emerald-500 to-emerald-600",
    mid: "from-amber-500 to-amber-600",
    bad: "from-red-500 to-red-600",
  }[tone];
  const toneText = {
    good: "Excelente",
    mid: "Mejorable",
    bad: "Atención",
  }[tone];

  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-graphite-900">
            Salud del catálogo
          </h3>
          <p className="text-xs text-gray-500">
            Qué tan completos están tus planes.
          </p>
        </div>
        <div
          className={`flex items-center gap-2 rounded-full bg-gradient-to-r ${toneColor} px-3 py-1 text-xs font-black text-white shadow`}
        >
          <CheckCircle2 size={12} />
          {toneText}
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-3xl font-black text-graphite-900">{score}%</span>
          <span className="text-xs font-semibold text-gray-500">
            puntuación global
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${toneColor} transition-all`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {stats.catalogHealth.signals.map((s) => (
          <div key={s.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-700">{s.label}</span>
              <span className="font-bold text-gray-500">
                {s.ok}/{s.total} · {s.pct}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full ${
                  s.pct >= 80
                    ? "bg-emerald-500"
                    : s.pct >= 50
                      ? "bg-amber-500"
                      : "bg-red-500"
                }`}
                style={{ width: `${s.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertsCard({ stats, loading }) {
  if (loading || !stats) {
    return (
      <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-100">
        <Skeleton className="h-5 w-32" />
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const alerts = [];
  if (stats.products.withoutImage > 0) {
    alerts.push({
      icon: ImageIcon,
      text: `${stats.products.withoutImage} plan(es) sin imagen`,
      href: "/dashboard/planes",
      tone: "warning",
    });
  }
  if (stats.products.withoutPrice > 0) {
    alerts.push({
      icon: AlertTriangle,
      text: `${stats.products.withoutPrice} plan(es) sin precio`,
      href: "/dashboard/planes",
      tone: "warning",
    });
  }
  if (stats.products.withoutCategory > 0) {
    alerts.push({
      icon: Tag,
      text: `${stats.products.withoutCategory} plan(es) sin etiqueta`,
      href: "/dashboard/planes",
      tone: "warning",
    });
  }
  if (stats.categories.empty > 0) {
    alerts.push({
      icon: Tag,
      text: `${stats.categories.empty} etiqueta(s) sin planes`,
      href: "/dashboard/etiquetas",
      tone: "info",
    });
  }
  if (stats.promotions.expiringIn7d > 0) {
    alerts.push({
      icon: Calendar,
      text: `${stats.promotions.expiringIn7d} promoción(es) expiran en 7 días`,
      href: "/dashboard/promociones",
      tone: "warning",
    });
  }
  if (stats.products.draft > 0) {
    alerts.push({
      icon: Eye,
      text: `${stats.products.draft} plan(es) en borrador`,
      href: "/dashboard/planes",
      tone: "info",
    });
  }

  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-100">
      <h3 className="text-sm font-black uppercase tracking-wider text-graphite-900">
        Alertas
      </h3>
      <p className="text-xs text-gray-500">Qué requiere tu atención.</p>

      {alerts.length === 0 ? (
        <div className="mt-5 flex flex-col items-center justify-center py-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={22} />
          </div>
          <p className="mt-3 text-sm font-bold text-graphite-900">
            Todo en orden
          </p>
          <p className="text-xs text-gray-500">No hay nada urgente por hacer.</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {alerts.map((a, i) => {
            const Icon = a.icon;
            const styles =
              a.tone === "warning"
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-maastel-200 bg-maastel-50 text-graphite-900";
            return (
              <li key={i}>
                <Link
                  to={a.href}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-xs font-semibold transition hover:shadow-sm ${styles}`}
                >
                  <Icon size={16} className="shrink-0" />
                  <span className="flex-1">{a.text}</span>
                  <ArrowUpRight size={14} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function shortPosition(p) {
  if (p === "HOME_TOP") return "Top";
  if (p === "HOME_MIDDLE") return "Med";
  if (p === "HOME_BOTTOM") return "Btm";
  return p;
}
