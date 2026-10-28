import { useEffect, useState } from "react";
import {
  Phone,
  MessageCircle,
  MapPin,
  Save,
  Wifi,
  Mail,
  Clock,
  Plus,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { Skeleton } from "../../components/dashboard/Skeleton";
import { useBranches, useUpdateBranch } from "../../hooks/useBranches";

const BRAND_META = {
  REDMAASTEL: {
    label: "Red MaasTel",
    accent: "from-maastel-500 to-maastel-700",
    icon: Wifi,
  },
};

const DAYS = [
  { n: 1, short: "L", name: "Lunes" },
  { n: 2, short: "M", name: "Martes" },
  { n: 3, short: "X", name: "Miércoles" },
  { n: 4, short: "J", name: "Jueves" },
  { n: 5, short: "V", name: "Viernes" },
  { n: 6, short: "S", name: "Sábado" },
  { n: 0, short: "D", name: "Domingo" },
];

const DEFAULT_SCHEDULE = [
  { label: "Lunes a Viernes", hours: "8:00 — 18:00", days: [1, 2, 3, 4, 5], closed: false },
  { label: "Sábado", hours: "8:30 — 12:30", days: [6], closed: false },
  { label: "Domingo", hours: "Cerrado", days: [0], closed: true },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputCls =
  "w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 transition focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100";

/** Convierte la sucursal del servidor al estado del formulario. */
function toForm(branch) {
  const schedule =
    Array.isArray(branch.schedule) && branch.schedule.length > 0
      ? branch.schedule
      : DEFAULT_SCHEDULE;
  return {
    name: branch.name ?? "",
    phone: branch.phone ?? "",
    whatsappPhone: branch.whatsappPhone ?? "",
    address: branch.address ?? "",
    email: branch.email ?? "",
    emailHint: branch.emailHint ?? "",
    schedule: schedule.map((r) => ({
      label: r.label ?? "",
      hours: r.hours ?? "",
      days: Array.isArray(r.days) ? r.days : [],
      closed: !!r.closed,
    })),
    isActive: branch.isActive ?? true,
  };
}

/**
 * Configura la sucursal de Red MaasTel: WhatsApp, teléfono, dirección,
 * correo y horario de atención que se muestran en la web pública.
 */
export function BranchesPage({ brand }) {
  const { data: branches = [], isLoading } = useBranches();
  const updateMut = useUpdateBranch();

  const filtered = brand
    ? branches.filter((b) => b.brand === brand)
    : branches;

  const meta = brand ? BRAND_META[brand] : null;

  return (
    <>
      <PageHeader
        title={meta ? `Sucursal · ${meta.label}` : "Sucursales y WhatsApp"}
        description={
          meta
            ? `Configura los datos de contacto de ${meta.label}: WhatsApp, teléfono, correo, dirección y horario. Todo se refleja en la página de contacto y en el pie de página.`
            : "Configura los datos de contacto de cada marca."
        }
      />

      {isLoading ? (
        <div className={`grid gap-4 ${brand ? "" : "md:grid-cols-2 xl:grid-cols-3"}`}>
          {(brand ? [0] : [0, 1, 2]).map((i) => (
            <Skeleton key={i} className="h-72 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
          No se encontró la sucursal para esta marca. Reinicia el backend para
          que la cree automáticamente.
        </div>
      ) : (
        <div className={`grid gap-4 ${brand ? "" : "md:grid-cols-2 xl:grid-cols-3"}`}>
          {filtered.map((branch) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              onSubmit={(payload) =>
                updateMut.mutateAsync({ brand: branch.brand, payload })
              }
              submitting={updateMut.isPending}
            />
          ))}
        </div>
      )}
    </>
  );
}

function BranchCard({ branch, onSubmit, submitting }) {
  const meta = BRAND_META[branch.brand] ?? {
    label: branch.brand,
    accent: "from-maastel-500 to-maastel-700",
    icon: Phone,
  };
  const Icon = meta.icon;

  const [form, setForm] = useState(() => toForm(branch));
  const [dirty, setDirty] = useState(false);

  // Si el server actualiza la sucursal por fuera, sincronizamos el form
  // mientras el usuario no esté editando.
  useEffect(() => {
    if (dirty) return;
    setForm(toForm(branch));
  }, [branch, dirty]);

  const set = (key, value) => {
    setDirty(true);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ─── Horario ───
  const setRow = (idx, key, value) => {
    setDirty(true);
    setForm((prev) => ({
      ...prev,
      schedule: prev.schedule.map((r, i) => (i === idx ? { ...r, [key]: value } : r)),
    }));
  };
  const toggleDay = (idx, n) => {
    const row = form.schedule[idx];
    const days = row.days.includes(n)
      ? row.days.filter((d) => d !== n)
      : [...row.days, n];
    setRow(idx, "days", days);
  };
  const addRow = () => {
    setDirty(true);
    setForm((prev) => ({
      ...prev,
      schedule: [...prev.schedule, { label: "", hours: "", days: [], closed: false }],
    }));
  };
  const removeRow = (idx) => {
    setDirty(true);
    setForm((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== idx),
    }));
  };
  const resetSchedule = () => {
    setDirty(true);
    setForm((prev) => ({
      ...prev,
      schedule: DEFAULT_SCHEDULE.map((r) => ({ ...r, days: [...r.days] })),
    }));
  };

  // ─── Validación ───
  const email = form.email.trim();
  const emailError = email && !EMAIL_RE.test(email) ? "Correo inválido" : null;
  const scheduleError = form.schedule.some(
    (r) => !r.label.trim() || !r.hours.trim(),
  )
    ? "Cada fila del horario necesita el texto de días y las horas"
    : null;
  const canSave = dirty && !submitting && !emailError && !scheduleError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) return;
    try {
      await onSubmit({
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        whatsappPhone: form.whatsappPhone.trim() || null,
        address: form.address.trim() || null,
        email: email || null,
        emailHint: form.emailHint.trim() || null,
        // Sin filas = volver al horario por defecto de la web.
        schedule:
          form.schedule.length > 0
            ? form.schedule.map((r) => ({
                label: r.label.trim(),
                hours: r.hours.trim(),
                days: r.days,
                closed: r.closed,
              }))
            : null,
        isActive: form.isActive,
      });
      setDirty(false);
    } catch {
      // toast manejado en el hook
    }
  };

  const hasWhatsapp = !!branch.whatsappPhone;

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100"
    >
      <div
        className={`flex items-center gap-3 bg-gradient-to-r ${meta.accent} px-5 py-4 text-white`}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
            Sucursal
          </div>
          <div className="truncate text-base font-black">{meta.label}</div>
        </div>
        <div className="ml-auto">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
              hasWhatsapp
                ? "bg-emerald-400/30 text-white ring-1 ring-emerald-200/50"
                : "bg-amber-400/30 text-white ring-1 ring-amber-200/50"
            }`}
          >
            {hasWhatsapp ? "Configurado" : "Sin número"}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <Field label="Nombre visible">
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            maxLength={120}
            className={inputCls}
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label={
              <span className="inline-flex items-center gap-1.5">
                <MessageCircle size={13} className="text-emerald-600" />
                WhatsApp (con código de país)
              </span>
            }
            hint="Ej: +593 99 123 4567 o 0991234567. Se usa para “Quiero este plan”."
          >
            <input
              type="tel"
              value={form.whatsappPhone}
              onChange={(e) => set("whatsappPhone", e.target.value)}
              placeholder="+593 99 123 4567"
              maxLength={30}
              className={inputCls}
            />
          </Field>

          <Field
            label={
              <span className="inline-flex items-center gap-1.5">
                <Phone size={13} className="text-maastel-600" />
                Teléfono (opcional)
              </span>
            }
            hint="Se muestra en “Llámanos”. Si está vacío se usa el WhatsApp."
          >
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="06 283 0000"
              maxLength={30}
              className={inputCls}
            />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label={
              <span className="inline-flex items-center gap-1.5">
                <Mail size={13} className="text-maastel-600" />
                Correo de contacto
              </span>
            }
            hint={
              emailError ??
              "Se muestra en “Escríbenos” y en el pie de página. Vacío = se oculta."
            }
            error={!!emailError}
          >
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="ventas@redmaastel.ec"
              maxLength={120}
              className={`${inputCls} ${
                emailError ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""
              }`}
            />
          </Field>

          <Field label="Texto bajo el correo (opcional)" hint="Ej: Respuesta en <24h">
            <input
              type="text"
              value={form.emailHint}
              onChange={(e) => set("emailHint", e.target.value)}
              placeholder="Respuesta en <24h"
              maxLength={80}
              className={inputCls}
            />
          </Field>
        </div>

        <Field
          label={
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} className="text-maastel-600" />
              Dirección (opcional)
            </span>
          }
        >
          <input
            type="text"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="Av. Unidad Nacional, Shushufindi"
            maxLength={255}
            className={inputCls}
          />
        </Field>

        {/* ─── Horario de atención ─── */}
        <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
              <Clock size={13} className="text-maastel-600" />
              Horario de atención
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetSchedule}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-500 transition hover:bg-gray-100"
              >
                <RotateCcw size={12} /> Restablecer
              </button>
              <button
                type="button"
                onClick={addRow}
                disabled={form.schedule.length >= 7}
                className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-maastel-700 ring-1 ring-maastel-200 transition hover:bg-maastel-50 disabled:opacity-40"
              >
                <Plus size={12} /> Agregar fila
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {form.schedule.map((row, idx) => (
              <div key={idx} className="rounded-xl bg-white p-3 ring-1 ring-gray-100">
                <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <input
                    type="text"
                    value={row.label}
                    onChange={(e) => setRow(idx, "label", e.target.value)}
                    placeholder="Lunes a Viernes"
                    maxLength={40}
                    aria-label="Días (texto visible)"
                    className={inputCls}
                  />
                  <input
                    type="text"
                    value={row.hours}
                    onChange={(e) => setRow(idx, "hours", e.target.value)}
                    placeholder="8:00 — 18:00"
                    maxLength={40}
                    aria-label="Horas"
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    title="Quitar fila"
                    className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {DAYS.map((d) => {
                    const on = row.days.includes(d.n);
                    return (
                      <button
                        key={d.n}
                        type="button"
                        title={d.name}
                        onClick={() => toggleDay(idx, d.n)}
                        className={`h-7 w-7 rounded-lg text-[11px] font-black transition ${
                          on
                            ? "bg-maastel-500 text-white shadow"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {d.short}
                      </button>
                    );
                  })}
                  <label className="ml-2 inline-flex items-center gap-1.5 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={row.closed}
                      onChange={(e) => setRow(idx, "closed", e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-red-500 focus:ring-red-400"
                    />
                    Cerrado (en rojo)
                  </label>
                </div>
              </div>
            ))}
            {form.schedule.length === 0 && (
              <p className="text-xs text-gray-500">
                Sin filas: la web mostrará el horario por defecto.
              </p>
            )}
          </div>
          <p className={`mt-2 text-[11px] ${scheduleError ? "text-red-600" : "text-gray-500"}`}>
            {scheduleError ?? "Los días marcados sirven para resaltar “Hoy” en la web."}
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => set("isActive", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-maastel-600 focus:ring-maastel-500"
          />
          Sucursal activa
        </label>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-5 py-3">
        <span className="text-xs text-gray-500">
          {dirty ? "Cambios sin guardar" : "Sin cambios"}
        </span>
        <button
          type="submit"
          disabled={!canSave}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black uppercase tracking-wider text-white shadow transition bg-gradient-to-r ${meta.accent} ${
            !canSave ? "cursor-not-allowed opacity-50" : "hover:shadow-lg"
          }`}
        >
          <Save size={14} />
          Guardar
        </button>
      </div>
    </form>
  );
}

function Field({ label, hint, error, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
        {label}
      </label>
      {children}
      {hint && (
        <p className={`mt-1 text-[11px] ${error ? "text-red-600" : "text-gray-500"}`}>
          {hint}
        </p>
      )}
    </div>
  );
}
