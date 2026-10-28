import { useState } from "react";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";
import { z } from "zod";
import {
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../../auth/useAuth";
import { getErrorMessage } from "../../utils/errorMessage";
import logo from "../../assets/logo-redmaastel.svg";

const loginSchema = z.object({
  email: z.string().trim().email("Correo inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

// Whitelist de rutas internas válidas para redirección post-login.
function isSafeRedirect(path) {
  return (
    typeof path === "string" &&
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.includes("://")
  );
}

export function LoginPage() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needs2fa, setNeeds2fa] = useState(false);

  if (!authLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (needs2fa) {
      if (!/^\d{6}$/.test(totpCode)) {
        return setError("El código debe tener 6 dígitos");
      }
      setLoading(true);
      try {
        await login(email, password, totpCode);
        const from = location.state?.from?.pathname;
        navigate(isSafeRedirect(from) ? from : "/dashboard", { replace: true });
      } catch (err) {
        setError(getErrorMessage(err, "Código inválido"));
      } finally {
        setLoading(false);
      }
      return;
    }

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Datos inválidos");
      return;
    }

    setLoading(true);
    try {
      await login(parsed.data.email, parsed.data.password);
      const from = location.state?.from?.pathname;
      navigate(isSafeRedirect(from) ? from : "/dashboard", { replace: true });
    } catch (err) {
      // Si el backend pide 2FA, cambiamos de paso en lugar de mostrar error.
      if (err?.response?.data?.twoFactorRequired) {
        setNeeds2fa(true);
        setError("");
      } else {
        setError(
          getErrorMessage(err, "Credenciales inválidas. Intenta nuevamente."),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-graphite-950 px-4 py-12">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_20%,rgba(0,102,204,0.4),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_70%_80%,rgba(255,209,0,0.2),transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Orbes de luz */}
      <div className="absolute -left-20 top-20 h-72 w-72 animate-pulse-glow rounded-full bg-maastel-500 opacity-30 blur-[120px]" />
      <div
        className="absolute -right-20 bottom-0 h-96 w-96 animate-pulse-glow rounded-full bg-maastel-400 opacity-20 blur-[140px]"
        style={{ animationDelay: "2s" }}
      />

      {/* Volver a la home */}
      <Link
        to="/"
        className="absolute left-6 top-6 flex items-center gap-2 text-sm font-semibold text-maastel-200 transition hover:text-maastel-400"
      >
        <ArrowLeft size={16} />
        Volver al inicio
      </Link>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="rounded-2xl bg-white/95 p-4 shadow-2xl shadow-maastel-400/20">
            <img
              src={logo}
              alt="Red MaasTel"
              className="h-16 w-auto object-contain"
            />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-maastel-400">
            Panel Administrativo
          </p>
        </div>

        {/* Tarjeta del formulario */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-black text-white">
              Bienvenido de vuelta
            </h2>
            <p className="mt-1 text-sm text-maastel-200">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-maastel-200"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-maastel-300"
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder="admin@redmaastel.ec"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-maastel-300 transition focus:border-maastel-400 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-maastel-400/20 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-maastel-200"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-maastel-300"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-12 text-sm text-white placeholder:text-maastel-300 transition focus:border-maastel-400 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-maastel-400/20 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-maastel-300 transition hover:text-maastel-400"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Paso 2FA */}
            {needs2fa && (
              <div className="rounded-xl border border-maastel-400/30 bg-maastel-400/5 p-4">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-maastel-400">
                  Código de verificación
                </label>
                <p className="mb-2 text-xs text-maastel-200">
                  Abre tu app de autenticación e ingresa el código de 6 dígitos.
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) =>
                    setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  disabled={loading}
                  placeholder="123456"
                  autoFocus
                  autoComplete="one-time-code"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-center text-lg font-bold tracking-[0.4em] text-white placeholder:text-maastel-300 focus:border-maastel-400 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-maastel-400/20 disabled:opacity-50"
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-red-400"
                />
                <p className="text-sm font-semibold text-red-300">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-maastel-400 to-maastel-500 px-6 py-3.5 text-sm font-black uppercase tracking-wider text-graphite-900 shadow-lg shadow-maastel-400/30 transition hover:shadow-2xl hover:shadow-maastel-400/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="opacity-25"
                    />
                    <path
                      d="M4 12a8 8 0 018-8"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  Ingresando...
                </>
              ) : (
                <>
                  Iniciar sesión
                  <LogIn
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-maastel-300">
            Acceso restringido solo para administradores autorizados.
          </p>
        </div>
      </div>
    </div>
  );
}
