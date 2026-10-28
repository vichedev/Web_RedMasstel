import { useState } from "react";
import {
  Plus,
  FileText,
  Pencil,
  Trash2,
  ExternalLink as ExtIcon,
  Eye,
  EyeOff,
  Star,
} from "lucide-react";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { Modal } from "../../components/dashboard/Modal";
import { ConfirmDialog } from "../../components/dashboard/ConfirmDialog";
import { EmptyState } from "../../components/dashboard/EmptyState";
import { Skeleton } from "../../components/dashboard/Skeleton";
import { DocumentUploader } from "../../components/dashboard/DocumentUploader";
import { buildImageUrl } from "../../utils/imageUrl";
import {
  useAdminDocuments,
  useCreateDocument,
  useUpdateDocument,
  useDeleteDocument,
} from "../../hooks/useDocuments";

const CATEGORY_LABELS = {
  LEGAL: "Legal",
  TARIFFS: "Tarifarios",
  REGULATORY: "Normativa",
  CONTRACT: "Contratos",
  OTHER: "Otros",
};

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const INITIAL_FORM = {
  title: "",
  description: "",
  category: "LEGAL",
  fileUrl: "",
  originalName: "",
  fileSize: null,
  isActive: true,
  showInFooter: false,
  sortOrder: 0,
};

const BRAND_LABEL = {
  REDMAASTEL: "Red MaasTel",
};

export function DocumentsPage({ brand }) {
  const { data: documents = [], isLoading } = useAdminDocuments(brand);
  const createMut = useCreateDocument();
  const updateMut = useUpdateDocument();
  const deleteMut = useDeleteDocument();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const submitting = createMut.isPending || updateMut.isPending;

  const handleCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (doc) => {
    setEditing(doc);
    setModalOpen(true);
  };

  const handleSubmit = async (payload) => {
    try {
      // Si la página vive en /dashboard/:brand/documentos asignamos la
      // marca automáticamente al documento (a menos que el form diga
      // explícitamente otra cosa). Si es la vista global, deja que el
      // form decida (puede dejar `null` para "global").
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

  const handleQuickToggle = async (doc, key) => {
    try {
      await updateMut.mutateAsync({
        id: doc.id,
        payload: { [key]: !doc[key] },
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

  const headerTitle = brand
    ? `Documentos · ${BRAND_LABEL[brand] ?? brand}`
    : "Documentos";
  const headerDescription = brand
    ? `PDFs visibles en el microsite ${BRAND_LABEL[brand] ?? brand}. La lista incluye los marcados como globales.`
    : "Sube los documentos administrativos / legales (PDF). Marca con la estrella los que quieres mostrar también en el footer del sitio.";

  return (
    <>
      <PageHeader
        title={headerTitle}
        description={headerDescription}
        action={
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-maastel-700 to-graphite-800 px-4 py-2.5 text-sm font-black uppercase tracking-wider text-white shadow-lg transition hover:shadow-xl"
          >
            <Plus size={16} />
            Nuevo documento
          </button>
        }
      />

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Sin documentos"
          description="Sube el primer PDF para que aparezca en el sitio público."
          primaryAction={{ label: "Nuevo documento", onClick: handleCreate }}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-[11px] font-black uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3 text-center">Activo</th>
                <th className="px-4 py-3 text-center">Footer</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-maastel-50 text-maastel-600">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-bold text-graphite-900">
                          {doc.title}
                        </div>
                        {doc.description && (
                          <div className="truncate text-xs text-gray-500">
                            {doc.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className="rounded-full bg-maastel-50 px-2.5 py-1 font-bold text-maastel-700">
                      {CATEGORY_LABELS[doc.category] ?? doc.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleQuickToggle(doc, "isActive")}
                      title={doc.isActive ? "Activo" : "Inactivo"}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition ${
                        doc.isActive
                          ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                    >
                      {doc.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleQuickToggle(doc, "showInFooter")}
                      title={
                        doc.showInFooter ? "Visible en footer" : "Oculto en footer"
                      }
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition ${
                        doc.showInFooter
                          ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                    >
                      <Star
                        size={16}
                        className={doc.showInFooter ? "fill-current" : ""}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      {doc.fileUrl && (
                        <a
                          href={buildImageUrl(doc.fileUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-maastel-50 hover:text-maastel-600"
                          title="Abrir PDF"
                        >
                          <ExtIcon size={15} />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleEdit(doc)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-maastel-50 hover:text-maastel-600"
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(doc)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                        title="Eliminar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar documento" : "Nuevo documento"}
        size="lg"
      >
        <DocumentForm
          initialData={editing}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
          lockedBrand={brand}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar documento"
        message={`¿Seguro que quieres eliminar "${deleteTarget?.title}"? Esta acción no se puede deshacer. El archivo PDF quedará huérfano en el almacenamiento.`}
        confirmText="Sí, eliminar"
        loading={deleteMut.isPending}
      />
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

function DocumentForm({
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
          title: initialData.title ?? "",
          description: initialData.description ?? "",
          category: initialData.category ?? "LEGAL",
          fileUrl: initialData.fileUrl ?? "",
          originalName: initialData.originalName ?? "",
          fileSize: initialData.fileSize ?? null,
          isActive: initialData.isActive ?? true,
          showInFooter: initialData.showInFooter ?? false,
          sortOrder: initialData.sortOrder ?? 0,
          brand: initialData.brand ?? null,
        }
      : {}),
  }));

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (!form.fileUrl) return;
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category,
      fileUrl: form.fileUrl,
      originalName: form.originalName || null,
      fileSize: form.fileSize ?? null,
      isActive: form.isActive,
      showInFooter: form.showInFooter,
      sortOrder: Number(form.sortOrder) || 0,
      brand: form.brand ?? null,
    });
  };

  const fileValue = form.fileUrl
    ? {
        url: form.fileUrl,
        originalName: form.originalName,
        size: form.fileSize,
      }
    : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
          Título *
        </label>
        <input
          type="text"
          required
          maxLength={200}
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100"
          placeholder="Términos y condiciones"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
          Descripción
        </label>
        <input
          type="text"
          maxLength={500}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100"
          placeholder="Vigente desde marzo 2025"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
            Categoría
          </label>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
            Microsite
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
          {lockedBrand && (
            <p className="mt-1 text-[11px] text-gray-500">
              Estás editando dentro del microsite {BRAND_LABEL[lockedBrand]}.
            </p>
          )}
        </div>
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
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-maastel-500 focus:outline-none focus:ring-2 focus:ring-maastel-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
          Archivo PDF *
        </label>
        <DocumentUploader
          value={fileValue}
          onChange={(next) => {
            if (!next) {
              set("fileUrl", "");
              set("originalName", "");
              set("fileSize", null);
              return;
            }
            set("fileUrl", next.url);
            set("originalName", next.originalName);
            set("fileSize", next.size);
          }}
          disabled={submitting}
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
              Visible en la página pública /documentos.
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
            <div className="text-xs text-gray-500">
              Aparece como acceso directo en el pie de página.
            </div>
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
          disabled={submitting || !form.fileUrl || !form.title.trim()}
          className="rounded-xl bg-gradient-to-r from-maastel-700 to-graphite-800 px-5 py-2 text-sm font-black uppercase tracking-wider text-white shadow transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
