import { ROLES } from "../../../utils/roles";
import { Check } from "lucide-react";

export function RoleSelector({ value, onChange, disabled }) {
  return (
    <div className="space-y-3">
      {Object.values(ROLES).map((role) => {
        const Icon = role.icon;
        const isSelected = value === role.key;

        return (
          <button
            key={role.key}
            type="button"
            onClick={() => !disabled && onChange(role.key)}
            disabled={disabled}
            className={`group relative w-full overflow-hidden rounded-2xl border-2 p-4 text-left transition ${isSelected ? `border-transparent bg-gradient-to-br ${role.color} shadow-lg ${role.darkText ? "text-graphite-900" : "text-white"}` : "border-gray-200 bg-white text-gray-700 hover:border-maastel-300 hover:bg-gray-50"} ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${isSelected ? (role.darkText ? "bg-graphite-900 text-maastel-400" : "bg-white/20 text-white") : `${role.bgColor} ${role.textColor}`}`}
              >
                <Icon size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4
                    className={`text-base font-black ${isSelected ? "" : "text-graphite-900"}`}
                  >
                    {role.label}
                  </h4>
                  {isSelected && (
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full ${role.darkText ? "bg-graphite-900 text-maastel-400" : "bg-white/20 text-white"}`}
                    >
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <p
                  className={`mt-1 text-xs ${isSelected ? (role.darkText ? "text-graphite-800" : "text-white/90") : "text-gray-600"}`}
                >
                  {role.description}
                </p>

                {/* Lista de permisos */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {role.permissions.map((perm) => {
                    const PermIcon = perm.icon;
                    return (
                      <div
                        key={perm.label}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${isSelected ? (role.darkText ? "bg-graphite-900/20 text-graphite-900" : "bg-white/20 text-white") : "bg-gray-100 text-gray-700"}`}
                      >
                        <PermIcon size={10} />
                        {perm.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
