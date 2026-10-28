import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Calendar, Megaphone, ArrowDownUp, Eye, Layers } from "lucide-react";
import { ImageUploader } from "../ImageUploader";

const INITIAL = {
  title: "",
  description: "",
  imageUrl: "",
  ctaText: "",
  isActive: true,
  displayOrder: 0,
  startDate: "",
  endDate: "",
  layout: "CINEMATIC",
  brand: null,
};

const LAYOUTS = [
  {
    value: "CINEMATIC",
    label: "Cinemática",
    desc: "Imagen + panel a la izquierda",
  },
  {
    value: "BILLBOARD",
    label: "Billboard",
    desc: "Imagen completa + título XXL",
  },
  {
    value: "SPOTLIGHT",
    label: "Spotlight",
    desc: "Producto al centro con luz",
  },
];

function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function PromotionForm({
  initialData = null,
  onSubmit,
  onCancel,
  submitting = false,
  lockedBrand = null,
}) {
  const [form, setForm] = useState(() => ({ ...INITIAL, brand: lockedBrand }));

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        imageUrl: initialData.imageUrl || "",
        ctaText: initialData.ctaText || "",
        isActive: initialData.isActive ?? true,
        displayOrder: initialData.displayOrder ?? 0,
        startDate: toLocalInput(initialData.startDate),
        endDate: toLocalInput(initialData.endDate),
        layout: initialData.layout || "CINEMATIC",
        brand: initialData.brand ?? null,
      });
    } else {
      setForm({ ...INITIAL, brand: lockedBrand });
    }
  }, [initialData, lockedBrand]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("El título es obligatorio");
    if (!form.description.trim())
      return toast.error("La descripción es obligatoria");
    if (!form.imageUrl) return toast.error("La imagen es obligatoria");

    const payload = {
      ...form,
      displayOrder: Number(form.displayOrder) || 0,
      startDate: form.startDate
        ? new Date(form.startDate).toISOString()
        : undefined,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      ctaText: form.ctaText || undefined,
      ctaLink: "/productos",
      brand: form.brand ?? null,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-5">
        {/* Columna izquierda — imagen */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-gray-700">
            Imagen del hero *
          </label>
          <ImageUploader
            value={form.imageUrl}
            onChange={(url) => setForm({ ...form, imageUrl: url })}
            disabled={submitting}
          />
          <p className="mt-2 text-xs text-gray-500">
            Recomendado: vertical o cuadrada, alta resolución.
          </p>
        </div>

        {/* Columna derecha — copy */}
        <div className="space-y-4 md:col-span-3">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-gray-700">
              Título *
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              disabled={submitting}
              placeholder="Ej: Descuento especial de temporada"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-gray-700">
              Descripción *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              disabled={submitting}
              rows={3}
              placeholder="Describe la promoción en pocas líneas…"
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-gray-700">
              Texto del botón
            </label>
            <input
              name="ctaText"
              value={form.ctaText}
              onChange={handleChange}
              disabled={submitting}
              placeholder='Ej: "Ver ofertas"'
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-gray-500">
              El botón siempre llevará a <code className="rounded bg-gray-100 px-1 py-0.5 text-[11px]">/productos</code>.
            </p>
          </div>
        </div>
      </div>

      {/* ── Microsite donde aparece ─────────────────────────── */}
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-gray-700">
          Microsite donde aparece
        </label>
        <select
          value={form.brand ?? ""}
          disabled={!!lockedBrand || submitting}
          onChange={(e) => setForm({ ...form, brand: e.target.value || null })}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:bg-gray-50 disabled:text-gray-500"
        >
          <option value="">Todo el sitio</option>
          <option value="REDMAASTEL">Red MaasTel</option>
        </select>
      </div>

      {/* ── Selector de layout ────────────────────────────── */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-gray-700">
          <Layers size={13} className="text-maastel-700" />
          Estilo del slide en el Hero
        </label>
        <div className="grid gap-2 sm:grid-cols-3">
          {LAYOUTS.map((opt) => {
            const active = form.layout === opt.value;
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() => setForm({ ...form, layout: opt.value })}
                disabled={submitting}
                className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition ${
                  active
                    ? "border-maastel-500 bg-maastel-50 shadow-sm ring-2 ring-maastel-100"
                    : "border-gray-200 bg-white hover:border-maastel-300"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                    active ? "border-maastel-500" : "border-gray-300"
                  }`}
                >
                  {active && (
                    <span className="h-2 w-2 rounded-full bg-maastel-500" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-black text-graphite-900">
                    {opt.label}
                  </span>
                  <span className="block text-xs leading-snug text-gray-600">
                    {opt.desc}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Bloque vigencia + orden + estado ──────────────── */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Vigencia (ocupa 2 cols) */}
        <div className="rounded-2xl border border-maastel-100 bg-maastel-50/40 p-4 md:col-span-2">
          <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-maastel-700">
            <Calendar size={13} />
            Vigencia
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">
                Desde
              </label>
              <input
                type="datetime-local"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">
                Hasta
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
              />
            </div>
          </div>
          <p className="mt-2 text-[11px] text-gray-500">
            Si dejas las fechas vacías, la promoción aparece siempre mientras
            esté activa.
          </p>
        </div>

        {/* Orden + Estado (col 1) */}
        <div className="space-y-3">
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-gray-700">
              <ArrowDownUp size={12} />
              Orden
            </label>
            <input
              name="displayOrder"
              type="number"
              min="0"
              value={form.displayOrder}
              onChange={handleChange}
              disabled={submitting}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
            />
            <p className="mt-1 text-[11px] text-gray-500">
              Menor = primero en el carrusel.
            </p>
          </div>

          <label
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
              form.isActive
                ? "border-emerald-300 bg-emerald-50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              disabled={submitting}
              className="h-4 w-4 rounded border-gray-300 text-maastel-600 focus:ring-maastel-500"
            />
            <span className="flex-1">
              <span className="flex items-center gap-1 text-xs font-black uppercase tracking-[0.18em] text-gray-700">
                <Eye size={12} />
                Activa
              </span>
              <span className="text-[11px] text-gray-500">
                Visible en el hero del sitio
              </span>
            </span>
            {form.isActive && (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
            )}
          </label>
        </div>
      </div>

      {/* ── Footer botones ────────────────────────────────── */}
      <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
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
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-maastel-700 to-graphite-800 px-5 py-2.5 text-sm font-black uppercase tracking-[0.18em] text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
        >
          <Megaphone size={14} />
          {submitting
            ? "Guardando..."
            : initialData
              ? "Actualizar"
              : "Crear promoción"}
        </button>
      </div>
    </form>
  );
}
