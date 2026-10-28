import { Inbox } from "lucide-react";

/**
 * Estado vacío reutilizable.
 *
 * Uso:
 *   <EmptyState
 *     icon={Package}
 *     title="Aún no hay productos"
 *     description="Empieza creando tu primer producto o importa desde Excel."
 *     primaryAction={{ label: "Crear producto", onClick: handleCreate }}
 *     secondaryAction={{ label: "Importar Excel", onClick: handleImport }}
 *   />
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  primaryAction,
  secondaryAction,
  variant = "default",
}) {
  const isError = variant === "error";

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-12 text-center ${
        isError
          ? "border-red-200 bg-red-50"
          : "border-gray-200 bg-gray-50/50"
      }`}
      role="status"
    >
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
          isError
            ? "bg-red-100 text-red-600"
            : "bg-maastel-100 text-maastel-700"
        }`}
      >
        <Icon size={28} strokeWidth={2} aria-hidden="true" />
      </div>

      <h3
        className={`mt-5 text-lg font-black ${
          isError ? "text-red-900" : "text-graphite-900"
        }`}
      >
        {title}
      </h3>

      {description && (
        <p
          className={`mt-2 max-w-md text-sm ${
            isError ? "text-red-800" : "text-gray-600"
          }`}
        >
          {description}
        </p>
      )}

      {(primaryAction || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              className="rounded-xl bg-gradient-to-r from-maastel-700 to-graphite-800 px-5 py-2.5 text-sm font-black uppercase tracking-wider text-white shadow-lg transition hover:shadow-xl"
            >
              {primaryAction.label}
            </button>
          )}
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
