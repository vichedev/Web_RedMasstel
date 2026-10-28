import { useState } from "react";
import { Lock } from "lucide-react";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { ActivityFeed } from "../../components/dashboard/ActivityFeed";
import { useAuditLog } from "../../hooks/useAuditLog";
import { useAuth } from "../../auth/useAuth";

const ACTIONS = [
  { value: "", label: "Todas las acciones" },
  { value: "CREATE", label: "Crear" },
  { value: "UPDATE", label: "Actualizar" },
  { value: "DELETE", label: "Eliminar" },
  { value: "BULK_UPDATE", label: "Actualizar lote" },
  { value: "BULK_DELETE", label: "Eliminar lote" },
  { value: "REORDER", label: "Reordenar" },
  { value: "LOGIN", label: "Login" },
  { value: "LOGIN_FAILED", label: "Login fallido" },
  { value: "LOGOUT", label: "Logout" },
  { value: "PASSWORD_CHANGE", label: "Cambio de contraseña" },
  { value: "TWOFA_ENABLE", label: "2FA activado" },
  { value: "TWOFA_DISABLE", label: "2FA desactivado" },
];

const RESOURCES = [
  { value: "", label: "Todos los recursos" },
  { value: "products", label: "Productos" },
  { value: "categories", label: "Etiquetas" },
  { value: "promotions", label: "Promociones" },
  { value: "advertisements", label: "Publicidad" },
  { value: "users", label: "Usuarios" },
  { value: "auth", label: "Autenticación" },
  { value: "uploads", label: "Imágenes" },
];

export function ActivityPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [resource, setResource] = useState("");

  const { data, isLoading } = useAuditLog({
    page,
    limit: 50,
    action: action || undefined,
    resource: resource || undefined,
  });

  if (!isSuperAdmin) {
    return (
      <>
        <PageHeader
          title="Actividad"
          description="Historial de acciones del sistema."
        />
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50 p-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <Lock size={28} />
          </div>
          <h3 className="mt-4 text-xl font-black text-amber-900">
            Acceso restringido
          </h3>
          <p className="mt-2 max-w-md text-sm text-amber-800">
            Solo los <strong>Super Administradores</strong> pueden ver el log
            completo de actividad.
          </p>
        </div>
      </>
    );
  }

  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <>
      <PageHeader
        title="Actividad"
        description="Historial completo de acciones del sistema."
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100"
        >
          {ACTIONS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
        <select
          value={resource}
          onChange={(e) => {
            setResource(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100"
        >
          {RESOURCES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl bg-white p-4 ring-1 ring-gray-100">
        <ActivityFeed items={items} loading={isLoading} compact />
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
          <span>
            Página {meta.page} de {meta.totalPages} · {meta.total} registros
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={meta.page === 1}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-semibold disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={meta.page === meta.totalPages}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-semibold disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </>
  );
}
