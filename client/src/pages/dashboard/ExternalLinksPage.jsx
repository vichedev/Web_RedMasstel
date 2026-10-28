import { useState } from "react";
import {
  Plus,
  Link as LinkIcon,
  Pencil,
  Trash2,
  ExternalLink as ExtIcon,
  Eye,
  EyeOff,
  Star,
  Globe,
  Gauge,
  Building2,
  Wrench,
  Share2,
} from "lucide-react";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { Modal } from "../../components/dashboard/Modal";
import { ConfirmDialog } from "../../components/dashboard/ConfirmDialog";
import { EmptyState } from "../../components/dashboard/EmptyState";
import { Skeleton } from "../../components/dashboard/Skeleton";
import {
  useAdminExternalLinks,
  useCreateExternalLink,
  useUpdateExternalLink,
  useDeleteExternalLink,
} from "../../hooks/useExternalLinks";

const KIND_META = {
  ARCOTEL: { label: "ARCOTEL", icon: Building2, accent: "bg-blue-50 text-blue-700" },
  MINTEL: { label: "MINTEL", icon: Building2, accent: "bg-violet-50 text-violet-700" },
  SPEEDTEST: { label: "Speedtest", icon: Gauge, accent: "bg-emerald-50 text-emerald-700" },
  GOVERNMENT: { label: "Gobierno", icon: Building2, accent: "bg-maastel-50 text-maastel-700" },
  TOOL: { label: "Herramienta", icon: Wrench, accent: "bg-amber-50 text-amber-700" },
  SOCIAL: { label: "Red social", icon: Share2, accent: "bg-pink-50 text-pink-700" },
  GENERIC: { label: "Genérico", icon: Globe, accent: "bg-gray-50 text-gray-700" },
};

const KIND_OPTIONS = Object.entries(KIND_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

const INITIAL_FORM = {
  label: "",
  description: "",
  url: "",
  kind: "GENERIC",
  isActive: true,
  showInFooter: true,
  sortOrder: 0,
  brand: null,
};

const BRAND_LABEL = {
  REDMAASTEL: "Red MaasTel",
};

export function ExternalLinksPage({ brand }) {
  const { data: links = [], isLoading } = useAdminExternalLinks(brand);
  const createMut = useCreateExternalLink();
  const updateMut = useUpdateExternalLink();
  const deleteMut = useDeleteExternalLink();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const submitting = createMut.isPending || updateMut.isPending;

  const handleCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const handleEdit = (link) => {
    setEditing(link);
    setModalOpen(true);
  };

  const handleSubmit = async (payload) => {
    try {
      const finalPayload =
        brand && payload.brand === undefined
          ? { ...payload, brand }
          : payload;
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, payload: finalPayload });
      } else {
        await createMut.mutateAsync(finalPayload);
      }
      setModalOpen(false);
    } catch {
      /* toast en hook */
    }
  };

  const handleQuickToggle = async (link, key) => {
    try {
      await updateMut.mutateAsync({
        id: link.id,
        payload: { [key]: !link[key] },
      });
    } catch {
      /* toast en hook */
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      /* toast en hook */
    }
  };

  return (
    <>
      <PageHeader
        title={
          brand ? `Enlaces útiles · ${BRAND_LABEL[brand] ?? brand}` : "Enlaces útiles"
        }
        description={
          brand
            ? `Enlaces externos del microsite ${BRAND_LABEL[brand] ?? brand}. La lista incluye los marcados como globales.`
            : "Redirecciones a sitios externos (ARCOTEL, MINTEL, Speedtest, etc.). Marca con la estrella los que se listan en el footer."
        }
        action={
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-maastel-600 to-maastel-700 px-4 py-2.5 text-sm font-black uppercase tracking-wider text-white shadow-lg transition hover:shadow-xl"
          >
            <Plus size={16} />
            Nuevo enlace
          </button>
        }
      />

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : links.length === 0 ? (
        <EmptyState
          icon={LinkIcon}
          title="Sin enlaces externos"
          description="Agrega los primeros enlaces (ARCOTEL, MINTEL, Speedtest…)."
          primaryAction={{ label: "Nuevo enlace", onClick: handleCreate }}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-[11px] font-black uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">Enlace</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3 text-center">Activo</th>
                <th className="px-4 py-3 text-center">Footer</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {links.map((link) => {
                const meta = KIND_META[link.kind] ?? KIND_META.GENERIC;
                const Icon = meta.icon;
                return (
                  <tr key={link.id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meta.accent}`}
                        >
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-bold text-graphite-900">
                            {link.label}
                          </div>
                          <div className="truncate text-xs text-gray-500">
                            {link.url}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`rounded-full px-2.5 py-1 font-bold ${meta.accent}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleQuickToggle(link, "isActive")}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition ${
                          link.isActive
                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        }`}
                      >
                        {link.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleQuickToggle(link, "showInFooter")}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition ${
                          link.showInFooter
                            ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        }`}
                      >
                        <Star size={16} className={link.showInFooter ? "fill-current" : ""} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-maastel-50 hover:text-maastel-600"
                          title="Probar enlace"
                        >
                          <ExtIcon size={15} />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleEdit(link)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-maastel-50 hover:text-maastel-600"
                          title="Editar"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(link)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                          title="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar enlace" : "Nuevo enlace"}
        size="md"
      >
        <ExternalLinkForm
          initialData={editing}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
          lockedBrand={brand ?? null}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar enlace"
        message={`¿Seguro que quieres eliminar "${deleteTarget?.label}"? Desaparecerá del footer y de las páginas públicas.`}
        confirmText="Sí, eliminar"
        loading={deleteMut.isPending}
      />
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

function ExternalLinkForm({
  initialData,
  onSubmit,
  onCancel,
  submitting,
  lockedBrand,
}) {
  const [form, setForm] = useState(() => ({
    ...INITIAL_FORM,
    brand: lockedBrand ?? null,
    ...(initialData
      ? {
          label: initialData.label ?? "",
          description: initialData.description ?? "",
          url: initialData.url ?? "",
          kind: initialData.kind ?? "GENERIC",
          isActive: initialData.isActive ?? true,
          showInFooter: initialData.showInFooter ?? true,
          sortOrder: initialData.sortOrder ?? 0,
          brand: initialData.brand ?? null,
        }
      : {}),
  }));

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.label.trim() || !form.url.trim()) return;
    onSubmit({
      label: form.label.trim(),
      description: form.description.trim() || null,
      url: form.url.trim(),
      kind: form.kind,
      isActive: form.isActive,
      showInFooter: form.showInFooter,
      sortOrder: Number(form.sortOrder) || 0,
      brand: form.brand ?? null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
            Etiqueta *
          </label>
          <input
            type="text"
            required
            maxLength={120}
            value={form.label}
            onChange={(e) => set("label", e.target.value)}
            placeholder="ARCOTEL"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
            Tipo
          </label>
          <select
            value={form.kind}
            onChange={(e) => set("kind", e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100"
          >
            {KIND_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
          Microsite donde aparece
        </label>
        <select
          value={form.brand ?? ""}
          disabled={!!lockedBrand}
          onChange={(e) => set("brand", e.target.value || null)}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100 disabled:bg-gray-50 disabled:text-gray-500"
        >
          <option value="">Todo el sitio</option>
          <option value="REDMAASTEL">Red MaasTel</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
          URL externa *
        </label>
        <input
          type="url"
          required
          maxLength={500}
          value={form.url}
          onChange={(e) => set("url", e.target.value)}
          placeholder="https://www.arcotel.gob.ec"
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100"
        />
        <p className="mt-1 text-[11px] text-gray-500">
          Debe incluir <code>https://</code>. Se abre en una pestaña nueva.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
          Descripción
        </label>
        <input
          type="text"
          maxLength={300}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Mide tu velocidad de internet"
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
          Orden de presentación
        </label>
        <input
          type="number"
          min="0"
          max="9999"
          value={form.sortOrder}
          onChange={(e) => set("sortOrder", e.target.value)}
          className="w-32 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-start gap-3 rounded-xl border border-gray-200 p-3 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => set("isActive", e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-maastel-600"
          />
          <div>
            <div className="font-bold text-gray-800">Activo</div>
            <div className="text-xs text-gray-500">
              Visible en el sitio público.
            </div>
          </div>
        </label>
        <label className="flex items-start gap-3 rounded-xl border border-gray-200 p-3 text-sm">
          <input
            type="checkbox"
            checked={form.showInFooter}
            onChange={(e) => set("showInFooter", e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-amber-500"
          />
          <div>
            <div className="font-bold text-gray-800">Mostrar en footer</div>
            <div className="text-xs text-gray-500">Aparece en el pie de página.</div>
          </div>
        </label>
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting || !form.label.trim() || !form.url.trim()}
          className="rounded-xl bg-gradient-to-r from-maastel-600 to-maastel-700 px-5 py-2 text-sm font-black uppercase tracking-wider text-white shadow transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
