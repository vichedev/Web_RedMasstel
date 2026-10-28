import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff, Smartphone, Loader2 } from "lucide-react";
import { authService } from "../../../services/authService";
import { getErrorMessage } from "../../../utils/errorMessage";
import { useAuth } from "../../../auth/useAuth";

/**
 * Sección de doble factor (2FA) en el perfil del usuario.
 * - Si NO está habilitado, ofrece el flujo: setup (QR) → verify (código) → enable.
 * - Si SÍ está habilitado, ofrece desactivarlo (también requiere código).
 */
export function TwoFactorSection() {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState("idle"); // idle | setup | disabling
  const [qrUrl, setQrUrl] = useState(null);
  const [otpauthUrl, setOtpauthUrl] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  const enabled = user?.totpEnabled ?? false;

  const handleStartSetup = async () => {
    setLoading(true);
    try {
      const { qrDataUrl, otpauthUrl } = await authService.setup2fa();
      setQrUrl(qrDataUrl);
      setOtpauthUrl(otpauthUrl);
      setStep("setup");
    } catch (err) {
      toast.error(getErrorMessage(err, "No se pudo iniciar el setup de 2FA"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!/^\d{6}$/.test(token)) return toast.error("El código debe tener 6 dígitos");
    setLoading(true);
    try {
      await authService.verify2fa(token);
      updateUser({ totpEnabled: true });
      toast.success("2FA activado correctamente");
      setStep("idle");
      setToken("");
      setQrUrl(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Código inválido"));
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!/^\d{6}$/.test(token)) return toast.error("El código debe tener 6 dígitos");
    setLoading(true);
    try {
      await authService.disable2fa(token);
      updateUser({ totpEnabled: false });
      toast.success("2FA desactivado");
      setStep("idle");
      setToken("");
    } catch (err) {
      toast.error(getErrorMessage(err, "Código inválido"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-100">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
            enabled
              ? "bg-emerald-100 text-emerald-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {enabled ? <ShieldCheck size={22} /> : <Smartphone size={22} />}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-black text-graphite-900">
            Verificación en dos pasos (2FA)
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Una capa extra de seguridad. Cada login pedirá un código de 6 dígitos
            de tu app autenticadora (Google Authenticator, 1Password, Authy, etc).
          </p>
          <div className="mt-2">
            {enabled ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                <ShieldCheck size={11} /> Activado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600">
                <ShieldOff size={11} /> No activado
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Estado: idle */}
      {step === "idle" && (
        <div className="mt-5 flex justify-end">
          {enabled ? (
            <button
              type="button"
              onClick={() => setStep("disabling")}
              className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Desactivar 2FA
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartSetup}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-maastel-700 to-graphite-800 px-5 py-2.5 text-sm font-black uppercase tracking-wider text-white shadow-lg disabled:opacity-60"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Activar 2FA
            </button>
          )}
        </div>
      )}

      {/* Estado: setup (QR + verify) */}
      {step === "setup" && qrUrl && (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Paso 1
            </p>
            <p className="mt-1 text-sm text-gray-700">
              Escanea este QR con tu app autenticadora.
            </p>
            <img
              src={qrUrl}
              alt="QR para 2FA"
              className="mt-3 rounded-xl border border-gray-200 bg-white p-2"
            />
            {otpauthUrl && (
              <details className="mt-2 text-xs text-gray-500">
                <summary className="cursor-pointer">
                  ¿No puedes escanear? Copia el código manual
                </summary>
                <code className="mt-2 block break-all rounded bg-gray-50 p-2 text-[10px]">
                  {otpauthUrl}
                </code>
              </details>
            )}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Paso 2
            </p>
            <p className="mt-1 text-sm text-gray-700">
              Ingresa el código de 6 dígitos que muestra la app.
            </p>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              value={token}
              onChange={(e) =>
                setToken(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              disabled={loading}
              placeholder="123456"
              autoComplete="one-time-code"
              className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-center text-xl font-bold tracking-[0.4em] focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setStep("idle");
                  setToken("");
                  setQrUrl(null);
                }}
                disabled={loading}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleVerify}
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-maastel-700 to-graphite-800 px-5 py-2 text-sm font-black uppercase tracking-wider text-white shadow-lg disabled:opacity-60"
              >
                {loading ? "Verificando..." : "Activar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estado: disabling */}
      {step === "disabling" && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-900">
            Para desactivar 2FA, ingresa un código actual de tu app:
          </p>
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            value={token}
            onChange={(e) =>
              setToken(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            disabled={loading}
            placeholder="123456"
            autoFocus
            className="mt-3 w-full rounded-xl border border-red-300 bg-white px-4 py-3 text-center text-lg font-bold tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-red-200"
          />
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setStep("idle");
                setToken("");
              }}
              disabled={loading}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDisable}
              disabled={loading}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-black uppercase tracking-wider text-white shadow-lg disabled:opacity-60"
            >
              {loading ? "Desactivando..." : "Desactivar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
