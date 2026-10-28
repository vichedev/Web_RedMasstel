import { useState } from "react";
import { toast } from "sonner";
import {
  User,
  Lock,
  Save,
  Eye,
  EyeOff,
  Shield,
  ShieldCheck,
  Mail,
  Calendar,
} from "lucide-react";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { TwoFactorSection } from "../../components/dashboard/profile/TwoFactorSection";
import { PasswordStrengthMeter, isPasswordStrongEnough } from "../../components/dashboard/PasswordStrengthMeter";
import { useAuth } from "../../auth/useAuth";
import { authService } from "../../services/authService";

export function ProfilePage() {
  const { user, updateUser } = useAuth();

  // Formulario de datos personales
  const [name, setName] = useState(user?.name || "");
  const [savingName, setSavingName] = useState(false);

  // Formulario de cambio de contraseña
  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("El nombre no puede estar vacío");
    if (name === user.name) return toast.info("No has cambiado el nombre");

    setSavingName(true);
    try {
      const updated = await authService.updateProfile({ name });
      updateUser({ name: updated.name });
      toast.success("Perfil actualizado");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al actualizar");
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwords.old) return toast.error("Ingresa tu contraseña actual");
    if (passwords.new.length < 8)
      return toast.error(
        "La nueva contraseña debe tener al menos 8 caracteres",
      );
    if (passwords.new !== passwords.confirm)
      return toast.error("Las contraseñas no coinciden");
    if (passwords.new === passwords.old)
      return toast.error("La nueva contraseña debe ser diferente a la actual");

    setSavingPassword(true);
    try {
      await authService.changePassword(passwords.old, passwords.new);
      toast.success("Contraseña actualizada correctamente");
      setPasswords({ old: "", new: "", confirm: "" });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Error al cambiar la contraseña",
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const toggleShow = (field) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  return (
    <>
      <PageHeader
        title="Mi perfil"
        description="Administra tu información personal y seguridad."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna izquierda: tarjeta del usuario */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-3xl bg-gradient-to-br from-maastel-700 via-graphite-800 to-graphite-900 p-6 text-white shadow-xl">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-maastel-400/10 blur-2xl" />
            <div className="relative flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-maastel-400 to-maastel-500 text-3xl font-black text-graphite-900 shadow-2xl">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <h3 className="mt-4 text-xl font-black">{user?.name}</h3>
              <div className="mt-2">
                {isSuperAdmin ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-maastel-400 px-3 py-1 text-xs font-black uppercase tracking-wider text-graphite-900">
                    <ShieldCheck size={12} />
                    Super Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-white backdrop-blur">
                    <Shield size={12} />
                    Administrador
                  </span>
                )}
              </div>

              <div className="mt-5 w-full space-y-3 border-t border-white/10 pt-5 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    <Mail size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-maastel-400">
                      Email
                    </div>
                    <div className="truncate text-xs text-white">
                      {user?.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    <Calendar size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-maastel-400">
                      Rol
                    </div>
                    <div className="text-xs text-white">
                      {isSuperAdmin
                        ? "Acceso total al sistema"
                        : "Gestión de contenido"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha: formularios */}
        <div className="space-y-6 lg:col-span-2">
          {/* Datos personales */}
          <form
            onSubmit={handleSaveName}
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100"
          >
            <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-maastel-100 text-maastel-700">
                <User size={18} />
              </div>
              <div>
                <h3 className="text-lg font-black text-graphite-900">
                  Datos personales
                </h3>
                <p className="text-xs text-gray-500">
                  Actualiza tu nombre de visualización.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={savingName}
                  placeholder="Tu nombre"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Email{" "}
                  <span className="text-gray-400 normal-case">
                    (no se puede cambiar)
                  </span>
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end border-t border-gray-100 pt-5">
              <button
                type="submit"
                disabled={savingName || name === user?.name}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-maastel-700 to-graphite-800 px-5 py-2.5 text-sm font-black uppercase tracking-wider text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={16} />
                {savingName ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>

          {/* Cambiar contraseña */}
          <form
            onSubmit={handleChangePassword}
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100"
          >
            <div className="mb-5 flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Lock size={18} />
              </div>
              <div>
                <h3 className="text-lg font-black text-graphite-900">
                  Seguridad
                </h3>
                <p className="text-xs text-gray-500">
                  Cambia tu contraseña de acceso al sistema.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <PasswordField
                label="Contraseña actual"
                value={passwords.old}
                onChange={(v) => setPasswords({ ...passwords, old: v })}
                show={showPasswords.old}
                onToggle={() => toggleShow("old")}
                disabled={savingPassword}
              />
              <div>
                <PasswordField
                  label="Nueva contraseña"
                  value={passwords.new}
                  onChange={(v) => setPasswords({ ...passwords, new: v })}
                  show={showPasswords.new}
                  onToggle={() => toggleShow("new")}
                  disabled={savingPassword}
                  hint="Mínimo 8 caracteres"
                />
                <PasswordStrengthMeter value={passwords.new} minScore={2} />
              </div>
              <PasswordField
                label="Confirmar nueva contraseña"
                value={passwords.confirm}
                onChange={(v) => setPasswords({ ...passwords, confirm: v })}
                show={showPasswords.confirm}
                onToggle={() => toggleShow("confirm")}
                disabled={savingPassword}
              />
            </div>

            <div className="mt-5 flex justify-end border-t border-gray-100 pt-5">
              <button
                type="submit"
                disabled={savingPassword}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-5 py-2.5 text-sm font-black uppercase tracking-wider text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
              >
                <Lock size={16} />
                {savingPassword ? "Cambiando..." : "Cambiar contraseña"}
              </button>
            </div>
          </form>
        </div>

        {/* 2FA */}
        <div className="md:col-span-2">
          <TwoFactorSection />
        </div>
      </div>
    </>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
  disabled,
  hint,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="••••••••"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-12 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={onToggle}
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
