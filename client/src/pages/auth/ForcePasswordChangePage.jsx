import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { z } from "zod";
import { authService } from "../../services/authService";
import {
  PasswordStrengthMeter,
  isPasswordStrongEnough,
} from "../../components/dashboard/PasswordStrengthMeter";
import { getErrorMessage } from "../../utils/errorMessage";
import { useAuth } from "../../auth/useAuth";

const schema = z
  .object({
    oldPassword: z.string().min(1, "Contraseña actual obligatoria"),
    newPassword: z.string().min(8, "Mínimo 8 caracteres"),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })
  .refine((d) => d.oldPassword !== d.newPassword, {
    message: "La nueva no puede ser igual a la actual",
    path: ["newPassword"],
  });

export function ForcePasswordChangePage() {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const parsed = schema.safeParse({ oldPassword, newPassword, confirmPassword });
    if (!parsed.success) {
      return setError(parsed.error.issues[0]?.message ?? "Datos inválidos");
    }
    if (!isPasswordStrongEnough(newPassword, 2)) {
      return setError("La nueva contraseña no es suficientemente fuerte");
    }

    setLoading(true);
    try {
      await authService.changePassword(oldPassword, newPassword);
      updateUser({ mustChangePassword: false });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-graphite-950 via-graphite-900 to-graphite-800 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-maastel-400 text-graphite-900 shadow-lg">
            <ShieldAlert size={28} />
          </div>
          <h1 className="mt-4 text-2xl font-black text-white">
            Cambia tu contraseña
          </h1>
          <p className="mt-1 text-sm text-maastel-200">
            Por seguridad, debes establecer una nueva antes de continuar.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
        >
          <Field
            label="Contraseña actual"
            type={showPassword ? "text" : "password"}
            value={oldPassword}
            onChange={setOldPassword}
            disabled={loading}
            autoComplete="current-password"
          />

          <Field
            label="Nueva contraseña"
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={setNewPassword}
            disabled={loading}
            autoComplete="new-password"
            extra={<PasswordStrengthMeter value={newPassword} minScore={2} />}
          />

          <Field
            label="Confirmar nueva contraseña"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={setConfirmPassword}
            disabled={loading}
            autoComplete="new-password"
          />

          <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs font-semibold text-maastel-200">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-white/20"
            />
            Mostrar contraseñas
          </label>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm font-semibold text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-maastel-400 to-maastel-500 px-6 py-3 text-sm font-black uppercase tracking-wider text-graphite-900 shadow-lg transition hover:shadow-xl disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Cambiar y continuar"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, disabled, autoComplete, extra }) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-maastel-200">
        {label}
      </label>
      <div className="relative">
        <Lock
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-maastel-300"
        />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete={autoComplete}
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-maastel-300 focus:border-maastel-400 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-maastel-400/20"
        />
      </div>
      {extra}
    </div>
  );
}
