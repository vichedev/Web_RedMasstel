import { useState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Eye, EyeOff, ShieldAlert } from "lucide-react";
import { RoleSelector } from "./RoleSelector";

const INITIAL = {
  name: "",
  email: "",
  password: "",
  role: "ADMIN",
  isActive: true,
};

const baseUserSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(100),
  email: z.string().trim().email("Correo inválido"),
  role: z.enum(["SUPER_ADMIN", "ADMIN"]),
  isActive: z.boolean(),
});

const createUserSchema = baseUserSchema.extend({
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(128),
});

export function UserForm({
  initialData = null,
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const [form, setForm] = useState(INITIAL);
  const [showPassword, setShowPassword] = useState(false);
  const isEdit = !!initialData;
  const isSeed = initialData?.isSeed === true;

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        email: initialData.email || "",
        password: "",
        role: initialData.role || "ADMIN",
        isActive: initialData.isActive ?? true,
      });
    } else {
      setForm(INITIAL);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEdit) {
      const parsed = baseUserSchema.safeParse(form);
      if (!parsed.success) {
        return toast.error(parsed.error.issues[0]?.message ?? "Datos inválidos");
      }
      const { password: _password, email: _email, ...rest } = parsed.data;
      if (isSeed) {
        rest.isActive = true;
        rest.role = "SUPER_ADMIN";
      }
      onSubmit(rest);
    } else {
      const parsed = createUserSchema.safeParse(form);
      if (!parsed.success) {
        return toast.error(parsed.error.issues[0]?.message ?? "Datos inválidos");
      }
      onSubmit(parsed.data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Banner especial cuando es el super admin principal */}
      {isSeed && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-maastel-300 bg-maastel-50 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-maastel-400 text-graphite-900">
            <ShieldAlert size={18} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-black text-graphite-900">
              Super administrador principal
            </div>
            <p className="mt-0.5 text-xs text-gray-700">
              Este usuario es el creado al iniciar el sistema. Por seguridad, su
              rol y estado no se pueden modificar — así garantizamos que siempre
              haya acceso al panel.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Columna izquierda: datos personales */}
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">
              Nombre completo *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled={submitting}
              placeholder="Juan Pérez"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">
              Email *{" "}
              {isEdit && (
                <span className="text-gray-400 normal-case">
                  (no se puede cambiar)
                </span>
              )}
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              disabled={submitting || isEdit}
              placeholder="admin@redmaastel.ec"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          {!isEdit && (
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">
                Contraseña temporal *
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  disabled={submitting}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-12 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                El usuario podrá cambiarla al iniciar sesión.
              </p>
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">
              Estado
            </label>
            <div
              className={`rounded-xl p-4 ${isSeed ? "bg-maastel-50 ring-1 ring-maastel-200" : "bg-gray-50"}`}
            >
              <label
                className={`flex items-center gap-2 text-sm font-semibold ${isSeed ? "cursor-not-allowed text-gray-500" : "cursor-pointer text-gray-700"}`}
              >
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  disabled={submitting || isSeed}
                  className="h-4 w-4 rounded border-gray-300 text-maastel-600 focus:ring-maastel-500 disabled:cursor-not-allowed"
                />
                Usuario activo (puede iniciar sesión)
              </label>
              {isSeed && (
                <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-maastel-700">
                  <ShieldAlert size={11} />
                  No se puede desactivar al super admin principal.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Columna derecha: rol */}
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">
            Rol y permisos *
          </label>

          {isSeed ? (
            <div className="rounded-2xl border-2 border-maastel-300 bg-gradient-to-br from-maastel-400 to-maastel-500 p-5 text-graphite-900 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-graphite-900 text-maastel-400">
                  <ShieldAlert size={22} />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-black">Super Administrador</h4>
                  <p className="mt-1 text-xs">
                    Rol fijo para el administrador principal. No se puede
                    cambiar por motivos de seguridad.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <RoleSelector
              value={form.role}
              onChange={(role) => setForm({ ...form, role })}
              disabled={submitting}
            />
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-gradient-to-r from-maastel-700 to-graphite-800 px-5 py-2.5 text-sm font-black uppercase tracking-wider text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
        >
          {submitting
            ? "Guardando..."
            : isEdit
              ? "Actualizar usuario"
              : "Crear usuario"}
        </button>
      </div>
    </form>
  );
}
