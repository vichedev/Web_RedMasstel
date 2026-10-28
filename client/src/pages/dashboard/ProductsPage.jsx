import { useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  Eye,
  EyeOff,
  Package,
  CheckCircle2,
  CircleSlash,
  StarOff,
  Wifi,
} from "lucide-react";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { DataTable } from "../../components/dashboard/DataTable";
import { Modal } from "../../components/dashboard/Modal";
import { ConfirmDialog } from "../../components/dashboard/ConfirmDialog";
import { EmptyState } from "../../components/dashboard/EmptyState";
import { SkeletonTable } from "../../components/dashboard/Skeleton";
import { BulkActionsBar } from "../../components/dashboard/BulkActionsBar";
import { ProductForm } from "../../components/dashboard/products/ProductForm";
import {
  useProductsAdmin,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useBulkUpdateProducts,
  useBulkDeleteProducts,
} from "../../hooks/useProducts";
import { useSelection } from "../../hooks/useSelection";
import { buildImageUrl } from "../../utils/imageUrl";

/**
 * Configuración de la página de planes (título, descripción, color,
 * planType por defecto del nuevo plan).
 */
const BRAND_CONFIG = {
  REDMAASTEL: {
    label: "Red MaasTel",
    title: "Planes de internet y TV",
    description:
      "Gestiona los planes de fibra óptica y los paquetes de televisión de Red MaasTel.",
    icon: Wifi,
    accent: "from-maastel-600 to-maastel-700",
    defaultPlanType: "INTERNET",
    emptyTitle: "Aún no hay planes",
    emptyDescription:
      "Crea tu primer plan de internet o paquete de TV, o impórtalos desde Excel.",
    primaryLabel: "Nuevo plan",
  },
  // Vista combinada (sin filtro) — equivalente con marca única.
  ALL: {
    label: "Todos los planes",
    title: "Catálogo de planes",
    description:
      "Todos los planes de internet y televisión de Red MaasTel.",
    icon: Package,
    accent: "from-maastel-700 to-graphite-800",
    defaultPlanType: "INTERNET",
    emptyTitle: "Aún no hay planes",
    emptyDescription:
      "Crea tu primer plan o impórtalos desde Excel para alimentar el catálogo.",
    primaryLabel: "Nuevo plan",
  },
};

const BRAND_BADGE = {
  REDMAASTEL: "bg-maastel-100 text-maastel-700",
};

const BRAND_LABEL = {
  REDMAASTEL: "Red MaasTel",
};

export function ProductsPage({ brand }) {
  const cfg = BRAND_CONFIG[brand] || BRAND_CONFIG.ALL;
  const isFiltered = !!brand;

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);

  const { data: products = [], isLoading } = useProductsAdmin(
    isFiltered ? { brand } : {},
  );
  const createMut = useCreateProduct();
  const updateMut = useUpdateProduct();
  const deleteMut = useDeleteProduct();
  const bulkUpdateMut = useBulkUpdateProducts();
  const bulkDeleteMut = useBulkDeleteProducts();

  const submitting = createMut.isPending || updateMut.isPending;
  const deleting = deleteMut.isPending;

  const selection = useSelection();
  const visibleIds = useMemo(() => products.map((p) => p.id), [products]);
  const allSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selection.isSelected(id));

  const handleCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditing(product);
    setModalOpen(true);
  };

  const handleSubmit = async (payload) => {
    try {
      // Si la página está filtrada por marca, forzamos esa marca al crear.
      const finalPayload =
        !editing && isFiltered ? { ...payload, brand } : payload;

      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, payload: finalPayload });
      } else {
        await createMut.mutateAsync(finalPayload);
      }
      setModalOpen(false);
    } catch {
      // toast ya manejado en el hook
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // toast ya manejado
    }
  };

  const handleBulkActivate = async () => {
    await bulkUpdateMut.mutateAsync({
      ids: selection.selectedArray,
      patch: { isActive: true },
    });
    selection.clear();
  };

  const handleBulkDeactivate = async () => {
    await bulkUpdateMut.mutateAsync({
      ids: selection.selectedArray,
      patch: { isActive: false },
    });
    selection.clear();
  };

  const handleBulkFeature = async () => {
    await bulkUpdateMut.mutateAsync({
      ids: selection.selectedArray,
      patch: { isFeatured: true },
    });
    selection.clear();
  };

  const handleBulkUnfeature = async () => {
    await bulkUpdateMut.mutateAsync({
      ids: selection.selectedArray,
      patch: { isFeatured: false },
    });
    selection.clear();
  };

  const handleBulkDelete = async () => {
    await bulkDeleteMut.mutateAsync(selection.selectedArray);
    selection.clear();
    setBulkConfirmOpen(false);
  };

  const Icon = cfg.icon;

  const columns = [
    {
      key: "select",
      label: (
        <input
          type="checkbox"
          checked={allSelected}
          onChange={() => selection.toggleAll(visibleIds)}
          className="h-4 w-4 cursor-pointer rounded border-gray-300 text-maastel-600 focus:ring-maastel-500"
          aria-label="Seleccionar todos"
        />
      ),
      className: "w-10",
      render: (p) => (
        <input
          type="checkbox"
          checked={selection.isSelected(p.id)}
          onChange={() => selection.toggle(p.id)}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4 cursor-pointer rounded border-gray-300 text-maastel-600 focus:ring-maastel-500"
          aria-label={`Seleccionar ${p.name}`}
        />
      ),
    },
    {
      key: "image",
      label: "Imagen",
      className: "w-20",
      render: (p) =>
        p.imageUrl ? (
          <img
            src={buildImageUrl(p.imageUrl)}
            alt={p.name}
            className="h-12 w-12 rounded-lg object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-[9px] font-bold text-gray-400">
            Sin foto
          </div>
        ),
    },
    {
      key: "name",
      label: "Plan",
      render: (p) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-graphite-900">{p.name}</span>
            {!isFiltered && p.brand && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${BRAND_BADGE[p.brand] ?? ""}`}
              >
                {BRAND_LABEL[p.brand] ?? p.brand}
              </span>
            )}
          </div>
          <div className="mt-0.5 text-xs text-gray-500">
            {p.category?.name || "Sin etiqueta"}
            {p.planType === "INTERNET" && p.downloadSpeed && (
              <> · {p.downloadSpeed} Mbps</>
            )}
            {p.planType === "TV" && p.channels && (
              <> · {p.channels} canales</>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "price",
      label: "Precio",
      render: (p) =>
        p.price ? (
          <span className="font-semibold">${Number(p.price).toFixed(2)}</span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      key: "status",
      label: "Estado",
      render: (p) => (
        <div className="flex flex-wrap gap-1">
          {p.isActive ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
              <Eye size={11} /> Activo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600">
              <EyeOff size={11} /> Oculto
            </span>
          )}
          {p.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-maastel-100 px-2 py-0.5 text-xs font-bold text-maastel-600">
              <Star size={11} /> Destacado
            </span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      className: "w-32 text-right",
      cellClassName: "text-right",
      render: (p) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => handleEdit(p)}
            className="rounded-lg p-2 text-maastel-600 transition hover:bg-maastel-50"
            title="Editar"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => setDeleteTarget(p)}
            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${cfg.accent} text-white shadow-md`}>
              <Icon size={18} />
            </span>
            {cfg.title}
          </span>
        }
        description={cfg.description}
        action={
          <button
            onClick={handleCreate}
            className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${cfg.accent} px-4 py-2.5 text-sm font-black uppercase tracking-wider text-white shadow-lg transition hover:shadow-xl`}
          >
            <Plus size={16} />
            {cfg.primaryLabel}
          </button>
        }
      />

      {isLoading ? (
        <SkeletonTable rows={6} cols={5} />
      ) : products.length === 0 ? (
        <EmptyState
          icon={cfg.icon}
          title={cfg.emptyTitle}
          description={cfg.emptyDescription}
          primaryAction={{ label: cfg.primaryLabel, onClick: handleCreate }}
        />
      ) : (
        <DataTable columns={columns} data={products} />
      )}

      <BulkActionsBar
        count={selection.count}
        onClear={selection.clear}
        actions={[
          {
            label: "Activar",
            icon: CheckCircle2,
            onClick: handleBulkActivate,
            disabled: bulkUpdateMut.isPending,
          },
          {
            label: "Desactivar",
            icon: CircleSlash,
            onClick: handleBulkDeactivate,
            disabled: bulkUpdateMut.isPending,
          },
          {
            label: "Destacar",
            icon: Star,
            onClick: handleBulkFeature,
            disabled: bulkUpdateMut.isPending,
          },
          {
            label: "Quitar destacado",
            icon: StarOff,
            onClick: handleBulkUnfeature,
            disabled: bulkUpdateMut.isPending,
          },
          {
            label: "Eliminar",
            icon: Trash2,
            onClick: () => setBulkConfirmOpen(true),
            variant: "danger",
            disabled: bulkDeleteMut.isPending,
          },
        ]}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar plan" : cfg.primaryLabel}
        size="lg"
      >
        <ProductForm
          initialData={editing}
          defaultBrand={isFiltered ? brand : undefined}
          lockBrand={isFiltered && !editing}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar plan"
        message={`¿Seguro que quieres eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        loading={deleting}
      />

      <ConfirmDialog
        isOpen={bulkConfirmOpen}
        onClose={() => setBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={`Eliminar ${selection.count} planes`}
        message={`Vas a eliminar ${selection.count} planes. Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar todo"
        loading={bulkDeleteMut.isPending}
      />
    </>
  );
}
