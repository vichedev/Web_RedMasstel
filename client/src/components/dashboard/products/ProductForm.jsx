import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Plus, X, Wifi, Tv } from "lucide-react";
import { ImageUploader } from "../ImageUploader";
import { ProductGallery } from "./ProductGallery";
import { useCategories } from "../../../hooks/useCategories";

const INITIAL = {
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  categoryId: "",
  isActive: true,
  isFeatured: false,
  status: "PUBLISHED",
  scheduledAt: "",
  brand: "REDMAASTEL",
  planType: "INTERNET",
  downloadSpeed: "",
  uploadSpeed: "",
  channels: "",
  hdChannels: "",
  features: [],
  badge: "",
};

const productSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(150),
  description: z.string().trim().min(1, "La descripción es obligatoria"),
  imageUrl: z.string().min(1, "La imagen principal es obligatoria"),
  price: z.union([z.number().min(0), z.literal("")]).optional(),
  categoryId: z.string().uuid().or(z.literal("")).optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]),
  scheduledAt: z.string().optional(),
  brand: z.literal("REDMAASTEL"),
  planType: z.enum(["INTERNET", "TV", "COMBO"]),
  downloadSpeed: z.union([z.number().int().min(0), z.literal("")]).optional(),
  uploadSpeed: z.union([z.number().int().min(0), z.literal("")]).optional(),
  channels: z.union([z.number().int().min(0), z.literal("")]).optional(),
  hdChannels: z.union([z.number().int().min(0), z.literal("")]).optional(),
  features: z.array(z.string()).max(20),
  badge: z.string().max(60).optional(),
});

const PLAN_TYPE_OPTIONS = [
  { value: "INTERNET", label: "Internet (fibra óptica)" },
  { value: "TV", label: "Televisión" },
  { value: "COMBO", label: "Combo (Internet + TV)" },
];

/**
 * El tipo de plan decide qué campos numéricos aplican:
 *  - INTERNET / COMBO → velocidades.
 *  - TV → canales.
 */
function isInternetPlan(planType) {
  return planType !== "TV";
}

export function ProductForm({
  initialData = null,
  defaultBrand,
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const baseInitial = useMemo(
    () => ({
      ...INITIAL,
      brand: defaultBrand ?? INITIAL.brand,
    }),
    [defaultBrand],
  );

  const [form, setForm] = useState(baseInitial);
  const [tab, setTab] = useState("info"); // "info" | "plan" | "gallery"
  const [featureDraft, setFeatureDraft] = useState("");
  const { data: categories = [] } = useCategories();

  const isEdit = !!initialData?.id;
  const isInternet = isInternetPlan(form.planType);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        description: initialData.description || "",
        price: initialData.price ?? "",
        imageUrl: initialData.imageUrl || "",
        categoryId: initialData.categoryId || initialData.category?.id || "",
        isActive: initialData.isActive ?? true,
        isFeatured: initialData.isFeatured ?? false,
        status: initialData.status || "PUBLISHED",
        scheduledAt: initialData.scheduledAt
          ? new Date(initialData.scheduledAt).toISOString().slice(0, 16)
          : "",
        brand: "REDMAASTEL",
        planType: initialData.planType || "INTERNET",
        downloadSpeed: initialData.downloadSpeed ?? "",
        uploadSpeed: initialData.uploadSpeed ?? "",
        channels: initialData.channels ?? "",
        hdChannels: initialData.hdChannels ?? "",
        features: Array.isArray(initialData.features) ? initialData.features : [],
        badge: initialData.badge || "",
      });
    } else {
      setForm(baseInitial);
      setTab("info");
    }
    setFeatureDraft("");
  }, [initialData, baseInitial, defaultBrand]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const addFeature = () => {
    const v = featureDraft.trim();
    if (!v) return;
    if (form.features.includes(v)) {
      setFeatureDraft("");
      return;
    }
    if (form.features.length >= 20) {
      toast.error("Máximo 20 características");
      return;
    }
    setForm({ ...form, features: [...form.features, v] });
    setFeatureDraft("");
  };

  const removeFeature = (idx) => {
    setForm({
      ...form,
      features: form.features.filter((_, i) => i !== idx),
    });
  };

  const handleFeatureKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addFeature();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const toNumOrEmpty = (v) => (v === "" || v === null ? "" : Number(v));

    const candidate = {
      ...form,
      price: toNumOrEmpty(form.price),
      downloadSpeed: toNumOrEmpty(form.downloadSpeed),
      uploadSpeed: toNumOrEmpty(form.uploadSpeed),
      channels: toNumOrEmpty(form.channels),
      hdChannels: toNumOrEmpty(form.hdChannels),
    };
    const parsed = productSchema.safeParse(candidate);
    if (!parsed.success) {
      return toast.error(parsed.error.issues[0]?.message ?? "Datos inválidos");
    }

    const d = parsed.data;
    const internet = isInternetPlan(d.planType);

    // Solo enviamos los campos numéricos relevantes al tipo de plan.
    const payload = {
      name: d.name,
      description: d.description,
      imageUrl: d.imageUrl,
      categoryId: d.categoryId || undefined,
      isActive: d.isActive,
      isFeatured: d.isFeatured,
      status: d.status,
      brand: "REDMAASTEL",
      planType: d.planType,
      features: d.features,
      badge: d.badge?.trim() || undefined,
      price: d.price === "" ? undefined : d.price,
      downloadSpeed: internet
        ? d.downloadSpeed === ""
          ? undefined
          : d.downloadSpeed
        : undefined,
      uploadSpeed: internet
        ? d.uploadSpeed === ""
          ? undefined
          : d.uploadSpeed
        : undefined,
      channels: !internet
        ? d.channels === ""
          ? undefined
          : d.channels
        : undefined,
      hdChannels: !internet
        ? d.hdChannels === ""
          ? undefined
          : d.hdChannels
        : undefined,
      scheduledAt:
        d.status === "SCHEDULED" && d.scheduledAt
          ? new Date(d.scheduledAt).toISOString()
          : null,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl bg-gray-100 p-1">
        <TabButton active={tab === "info"} onClick={() => setTab("info")}>
          Información
        </TabButton>
        <TabButton active={tab === "plan"} onClick={() => setTab("plan")}>
          Plan
        </TabButton>
        {isEdit && (
          <TabButton active={tab === "gallery"} onClick={() => setTab("gallery")}>
            Galería
          </TabButton>
        )}
      </div>

      {tab === "gallery" && isEdit ? (
        <ProductGallery productId={initialData.id} />
      ) : tab === "plan" ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">
                Tipo de plan *
              </label>
              <select
                name="planType"
                value={form.planType}
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-60"
              >
                {PLAN_TYPE_OPTIONS.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {isInternet
                  ? "Plan de internet — completa las velocidades a la derecha."
                  : "Plan de televisión — completa los canales a la derecha."}
              </p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">
                Etiqueta destacada (opcional)
              </label>
              <input
                name="badge"
                value={form.badge}
                onChange={handleChange}
                disabled={submitting}
                maxLength={60}
                placeholder='Ej: "Más vendido", "Promoción"'
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
              />
              <p className="mt-1 text-xs text-gray-500">
                Aparecerá como badge sobre la tarjeta del plan en el sitio.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {isInternet ? (
              <div className="rounded-2xl border border-maastel-100 bg-maastel-50/50 p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-maastel-700">
                  <Wifi size={14} /> Velocidades de internet
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">
                      Bajada (Mbps)
                    </label>
                    <input
                      type="number"
                      name="downloadSpeed"
                      min="0"
                      value={form.downloadSpeed}
                      onChange={handleChange}
                      disabled={submitting}
                      placeholder="100"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">
                      Subida (Mbps)
                    </label>
                    <input
                      type="number"
                      name="uploadSpeed"
                      min="0"
                      value={form.uploadSpeed}
                      onChange={handleChange}
                      disabled={submitting}
                      placeholder="100"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-maastel-100 bg-maastel-50/50 p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-maastel-700">
                  <Tv size={14} /> Paquete de televisión
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">
                      Canales totales
                    </label>
                    <input
                      type="number"
                      name="channels"
                      min="0"
                      value={form.channels}
                      onChange={handleChange}
                      disabled={submitting}
                      placeholder="120"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">
                      Canales en HD
                    </label>
                    <input
                      type="number"
                      name="hdChannels"
                      min="0"
                      value={form.hdChannels}
                      onChange={handleChange}
                      disabled={submitting}
                      placeholder="80"
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">
                Características destacadas
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={featureDraft}
                  onChange={(e) => setFeatureDraft(e.target.value)}
                  onKeyDown={handleFeatureKeyDown}
                  disabled={submitting}
                  placeholder={
                    isInternet
                      ? 'Ej: "Wi-Fi 6 incluido"'
                      : 'Ej: "Decodificador 4K incluido"'
                  }
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  disabled={submitting || !featureDraft.trim()}
                  className="inline-flex items-center gap-1 rounded-xl bg-maastel-600 px-3 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-sm transition hover:bg-maastel-700 disabled:opacity-50"
                >
                  <Plus size={14} />
                  Añadir
                </button>
              </div>
              {form.features.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {form.features.map((f, idx) => (
                    <span
                      key={`${f}-${idx}`}
                      className="inline-flex items-center gap-1 rounded-full bg-maastel-100 py-1 pl-3 pr-1 text-xs font-semibold text-graphite-800"
                    >
                      {f}
                      <button
                        type="button"
                        onClick={() => removeFeature(idx)}
                        disabled={submitting}
                        className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-maastel-200 text-maastel-700 transition hover:bg-maastel-500 hover:text-white"
                        aria-label={`Eliminar ${f}`}
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Aparecen como bullets en la tarjeta del plan.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Columna izquierda */}
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">
                Imagen principal *
              </label>
              <ImageUploader
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
                disabled={submitting}
              />
              {isEdit && (
                <p className="mt-2 text-xs text-gray-500">
                  Para más imágenes, usa la pestaña "Galería" arriba.
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">
                Nombre del plan *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                disabled={submitting}
                placeholder={
                  isInternet
                    ? 'Ej: "Hogar 100 Mbps"'
                    : 'Ej: "TV Plus HD"'
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">
                Descripción *
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                disabled={submitting}
                rows={5}
                placeholder="Describe el plan, beneficios y a quién está dirigido..."
                className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
              />
              <p className="mt-1 text-xs text-gray-500">
                Mínimo 50 caracteres para una buena salud del catálogo.
              </p>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">
                Precio mensual (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                  $
                </span>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  disabled={submitting}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-8 pr-4 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Deja vacío para "consultar precio".
              </p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">
                Etiqueta
              </label>
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
              >
                <option value="">Sin etiqueta</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Aparecerá bajo el precio en la tarjeta del plan. Ej:
                "Incluye impuestos", "Promoción", "Solo nuevos clientes".
              </p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">
                Estado de publicación
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
              >
                <option value="DRAFT">Borrador (no visible)</option>
                <option value="SCHEDULED">Programado</option>
                <option value="PUBLISHED">Publicado</option>
                <option value="ARCHIVED">Archivado</option>
              </select>
              {form.status === "SCHEDULED" && (
                <input
                  type="datetime-local"
                  name="scheduledAt"
                  value={form.scheduledAt}
                  onChange={handleChange}
                  disabled={submitting}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:opacity-50"
                />
              )}
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">
                Opciones
              </label>
              <div className="space-y-2 rounded-xl bg-gray-50 p-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    disabled={submitting}
                    className="h-4 w-4 rounded border-gray-300 text-maastel-600 focus:ring-maastel-500"
                  />
                  Activo
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={form.isFeatured}
                    onChange={handleChange}
                    disabled={submitting}
                    className="h-4 w-4 rounded border-gray-300 text-maastel-600 focus:ring-maastel-500"
                  />
                  Destacado
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

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
          {submitting ? "Guardando..." : isEdit ? "Actualizar plan" : "Crear plan"}
        </button>
      </div>
    </form>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition ${
        active
          ? "bg-white text-maastel-700 shadow-sm"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}
