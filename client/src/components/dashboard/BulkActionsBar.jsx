import { X } from "lucide-react";

/**
 * Barra flotante que aparece cuando hay items seleccionados en una tabla.
 *
 * Props:
 *   count: número de items seleccionados
 *   onClear: limpia la selección
 *   actions: array de { label, icon, onClick, variant }
 *           variant: "default" | "danger"
 */
export function BulkActionsBar({ count, onClear, actions = [] }) {
  if (count === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-maastel-200 bg-white p-2 pl-4 shadow-2xl ring-1 ring-maastel-100">
        <span className="flex items-center gap-2 pr-2 text-sm font-bold text-graphite-900">
          <span className="flex h-7 min-w-[28px] items-center justify-center rounded-full bg-maastel-700 px-2 text-xs font-black text-white">
            {count}
          </span>
          seleccionado{count !== 1 ? "s" : ""}
        </span>

        <span className="h-6 w-px bg-gray-200" />

        {actions.map((action, idx) => {
          const Icon = action.icon;
          const isDanger = action.variant === "danger";
          return (
            <button
              key={idx}
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isDanger
                  ? "text-red-700 hover:bg-red-50"
                  : "text-maastel-700 hover:bg-maastel-50"
              }`}
              title={action.label}
            >
              {Icon && <Icon size={16} />}
              <span className="hidden sm:inline">{action.label}</span>
            </button>
          );
        })}

        <span className="h-6 w-px bg-gray-200" />

        <button
          type="button"
          onClick={onClear}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100"
          title="Cancelar selección (Esc)"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
