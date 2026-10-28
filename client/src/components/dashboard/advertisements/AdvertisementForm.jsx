import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ImageUploader } from "../ImageUploader";

const POSITIONS = [
  { value: "HOME_TOP", label: "Home Superior" },
  { value: "HOME_MIDDLE", label: "Home Medio" },
  { value: "HOME_BOTTOM", label: "Home Inferior" },
];

const BADGE_COLORS = [
  { value: "SUN", label: "Amarillo", bg: "bg-maastel-400" },
  { value: "RED", label: "Rojo", bg: "bg-red-500" },
  { value: "AMBER", label: "Naranja", bg: "bg-amber-500" },
  { value: "GREEN", label: "Verde", bg: "bg-emerald-500" },
  { value: "BLUE", label: "Azul", bg: "bg-maastel-600" },
  { value: "PURPLE", label: "Morado", bg: "bg-purple-500" },
];

const INITIAL = {
  title: "",
  subtitle: "",
  imageUrl: "",
  badgeText: "",
  badgeColor: "SUN",
  ctaText: "",
  link: "",
  position: "HOME_MIDDLE",
  isActive: true,
  displayOrder: 0,
  brand: null,
};

export function AdvertisementForm({
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
        subtitle: initialData.subtitle || "",
        imageUrl: initialData.imageUrl || "",
        badgeText: initialData.badgeText || "",
        badgeColor: initialData.badgeColor || "SUN",
        ctaText: initialData.ctaText || "",
        link: initialData.link || "",
        position: initialData.position || "HOME_MIDDLE",
        isActive: initialData.isActive ?? true,
        displayOrder: initialData.displayOrder ?? 0,
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
    if (!form.imageUrl) return toast.error("La imagen es obligatoria");

    const payload = {
      ...form,
      displayOrder: Number(form.displayOrder) || 0,
      subtitle: form.subtitle || undefined,
      badgeText: form.badgeText || undefined,
      ctaText: form.ctaText || undefined,
      link: form.link || undefined,
      brand: form.brand ?? null,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Imagen ancho completo */}
      <div>
        <label className="mb-2 block text-sm font-bold text-gray-700">
          Imagen del banner <span className="text-red-500">*</span>
        </label>
        <ImageUploader
          value={form.imageUrl}
          onChange={(url) => setForm({ ...form, imageUrl: url })}
          disabled={submitting}
        />
      </div>

      {/* Título + Subtítulo */}
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            disabled={submitting}
            placeholder="Ej: Ofertas de temporada"
            maxLength={150}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Subtítulo
          </label>
          <input
            name="subtitle"
            value={form.subtitle}
            onChange={handleChange}
            disabled={submitting}
            placeholder="Ej: Hasta 40% de descuento"
            maxLength={200}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
          />
        </div>
      </div>

      {/* Badge + Color del badge */}
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Badge destacado
          </label>
          <input
            name="badgeText"
            value={form.badgeText}
            onChange={handleChange}
            disabled={submitting}
            placeholder="Ej: OFERTA, -30%, NUEVO"
            maxLength={30}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-gray-500">
            Texto corto llamativo que aparecerá sobre la imagen
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Color del badge
          </label>
          <div className="flex gap-2">
            {BADGE_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setForm({ ...form, badgeColor: c.value })}
                title={c.label}
                className={`h-10 w-10 rounded-xl transition ${c.bg} ${
                  form.badgeColor === c.value
                    ? "ring-2 ring-maastel-600 ring-offset-2"
                    : "opacity-60 hover:opacity-100"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Enlace + Texto del botón */}
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Enlace
          </label>
          <input
            name="link"
            value={form.link}
            onChange={handleChange}
            disabled={submitting}
            placeholder="/productos o https://..."
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-gray-500">
            Déjalo vacío si el banner será solo visual
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Texto del botón
          </label>
          <input
            name="ctaText"
            value={form.ctaText}
            onChange={handleChange}
            disabled={submitting || !form.link}
            placeholder={
              form.link ? "Ej: Ver más, Cotizar" : "Requiere enlace primero"
            }
            maxLength={50}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-gray-500">
            Solo se muestra si hay enlace
          </p>
        </div>
      </div>

      {/* Microsite + Ubicación + Orden + Estado */}
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Microsite donde aparece
          </label>
          <select
            value={form.brand ?? ""}
            disabled={!!lockedBrand || submitting}
            onChange={(e) =>
              setForm({ ...form, brand: e.target.value || null })
            }
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:bg-gray-50 disabled:text-gray-500"
          >
            <option value="">Todo el sitio</option>
            <option value="REDMAASTEL">Red MaasTel</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Ubicación
          </label>
          <select
            name="position"
            value={form.position}
            onChange={handleChange}
            disabled={submitting}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
          >
            {POSITIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Orden
          </label>
          <input
            name="displayOrder"
            type="number"
            min="0"
            value={form.displayOrder}
            onChange={handleChange}
            disabled={submitting}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">
            Estado
          </label>
          <label className="flex h-[42px] cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              disabled={submitting}
              className="h-4 w-4 rounded border-gray-300 text-maastel-600 focus:ring-maastel-500"
            />
            Activa
          </label>
        </div>
      </div>

      {/* Footer */}
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
          className="rounded-xl bg-gradient-to-r from-maastel-700 to-graphite-800 px-5 py-2.5 text-sm font-black uppercase tracking-wider text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
        >
          {submitting
            ? "Guardando..."
            : initialData
              ? "Actualizar"
              : "Crear publicidad"}
        </button>
      </div>
    </form>
  );
}
