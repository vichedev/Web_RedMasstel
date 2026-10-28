import {
  Plus,
  Pencil,
  Trash2,
  LogIn,
  LogOut,
  Lock,
  ShieldCheck,
  ShieldOff,
  Layers,
  XCircle,
  GripVertical,
  Activity,
} from "lucide-react";
import { Skeleton } from "./Skeleton";

const ACTION_META = {
  CREATE: { label: "creó", icon: Plus, color: "text-emerald-600 bg-emerald-50" },
  UPDATE: { label: "actualizó", icon: Pencil, color: "text-maastel-600 bg-maastel-50" },
  DELETE: { label: "eliminó", icon: Trash2, color: "text-red-600 bg-red-50" },
  BULK_UPDATE: { label: "actualizó (lote)", icon: Layers, color: "text-maastel-600 bg-maastel-50" },
  BULK_DELETE: { label: "eliminó (lote)", icon: Layers, color: "text-red-600 bg-red-50" },
  REORDER: { label: "reordenó", icon: GripVertical, color: "text-purple-600 bg-purple-50" },
  LOGIN: { label: "inició sesión", icon: LogIn, color: "text-emerald-600 bg-emerald-50" },
  LOGIN_FAILED: { label: "intento fallido de login", icon: XCircle, color: "text-red-600 bg-red-50" },
  LOGOUT: { label: "cerró sesión", icon: LogOut, color: "text-gray-600 bg-gray-50" },
  PASSWORD_CHANGE: { label: "cambió su contraseña", icon: Lock, color: "text-amber-600 bg-amber-50" },
  TWOFA_ENABLE: { label: "activó 2FA", icon: ShieldCheck, color: "text-emerald-600 bg-emerald-50" },
  TWOFA_DISABLE: { label: "desactivó 2FA", icon: ShieldOff, color: "text-amber-600 bg-amber-50" },
};

const RESOURCE_LABELS = {
  products: "producto",
  categories: "etiqueta",
  promotions: "promoción",
  advertisements: "publicidad",
  users: "usuario",
  uploads: "imagen",
  auth: "sesión",
};

function formatRelative(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  if (hours < 24) return `hace ${hours}h`;
  if (days < 7) return `hace ${days}d`;
  return new Date(iso).toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "short",
  });
}

export function ActivityFeed({ items, loading, compact = false }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50 py-8 text-center">
        <Activity size={24} className="text-gray-400" />
        <p className="mt-2 text-sm font-semibold text-gray-700">
          Sin actividad aún
        </p>
        <p className="text-xs text-gray-500">
          Aquí verás los cambios que se hagan en el sistema.
        </p>
      </div>
    );
  }

  return (
    <ul className={compact ? "divide-y divide-gray-100" : "space-y-2"}>
      {items.map((item) => {
        const meta = ACTION_META[item.action] ?? {
          label: item.action.toLowerCase(),
          icon: Activity,
          color: "text-gray-600 bg-gray-50",
        };
        const Icon = meta.icon;
        const resourceLabel =
          RESOURCE_LABELS[item.resource] ?? item.resource;
        const who =
          item.userEmail?.split("@")[0] ??
          (item.userId ? "Usuario" : "Anónimo");

        return (
          <li
            key={item.id}
            className={
              compact
                ? "flex items-start gap-3 py-2.5"
                : "flex items-start gap-3 rounded-xl bg-white p-3 ring-1 ring-gray-100"
            }
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.color}`}
            >
              <Icon size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs leading-snug">
                <span className="font-bold text-graphite-900">{who}</span>{" "}
                <span className="text-gray-600">{meta.label}</span>{" "}
                {item.resourceId ? (
                  <>
                    <span className="font-semibold text-maastel-700">
                      {resourceLabel}
                    </span>
                  </>
                ) : (
                  <span className="font-semibold text-maastel-700">
                    {resourceLabel}
                  </span>
                )}
              </p>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-400">
                <span>{formatRelative(item.createdAt)}</span>
                {item.ip && (
                  <>
                    <span>·</span>
                    <span className="font-mono">{item.ip}</span>
                  </>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
