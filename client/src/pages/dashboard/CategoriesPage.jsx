import { useState } from "react";
import { Plus, Tag } from "lucide-react";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { Modal } from "../../components/dashboard/Modal";
import { ConfirmDialog } from "../../components/dashboard/ConfirmDialog";
import { EmptyState } from "../../components/dashboard/EmptyState";
import { Skeleton } from "../../components/dashboard/Skeleton";
import { CategoryForm } from "../../components/dashboard/categories/CategoryForm";
import { CategoryTree } from "../../components/dashboard/categories/CategoryTree";
import {
  useCategoryTree,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../../hooks/useCategories";

export function CategoriesPage() {
  const { data: tree = [], isLoading } = useCategoryTree();
  const createMut = useCreateCategory();
  const updateMut = useUpdateCategory();
  const deleteMut = useDeleteCategory();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [defaultParentId, setDefaultParentId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const submitting = createMut.isPending || updateMut.isPending;
  const deleting = deleteMut.isPending;

  const handleCreate = () => {
    setEditing(null);
    setDefaultParentId(null);
    setModalOpen(true);
  };

  const handleAddChild = (parent) => {
    setEditing(null);
    setDefaultParentId(parent.id);
    setModalOpen(true);
  };

  const handleEdit = (cat) => {
    setEditing(cat);
    setDefaultParentId(null);
    setModalOpen(true);
  };

  const handleSubmit = async (payload) => {
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, payload });
      } else {
        await createMut.mutateAsync(payload);
      }
      setModalOpen(false);
    } catch {
      // toast manejado en hook
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // toast manejado
    }
  };

  return (
    <>
      <PageHeader
        title="Etiquetas"
        description='Etiquetas que aparecen bajo el precio de cada plan. Ej: "Incluye impuestos", "Promoción", "Solo nuevos clientes".'
        action={
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-maastel-700 to-graphite-800 px-4 py-2.5 text-sm font-black uppercase tracking-wider text-white shadow-lg transition hover:shadow-xl"
          >
            <Plus size={16} />
            Nueva etiqueta
          </button>
        }
      />

      <div className="rounded-2xl bg-white p-4 ring-1 ring-gray-100">
        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : tree.length === 0 ? (
          <EmptyState
            icon={Tag}
            title="Sin etiquetas"
            description="Crea tu primera etiqueta para organizar el catálogo."
            primaryAction={{ label: "Nueva etiqueta", onClick: handleCreate }}
          />
        ) : (
          <CategoryTree
            nodes={tree}
            onEdit={handleEdit}
            onDelete={(node) => setDeleteTarget(node)}
            onAddChild={handleAddChild}
          />
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar etiqueta" : "Nueva etiqueta"}
        size="md"
      >
        <CategoryForm
          initialData={editing}
          defaultParentId={defaultParentId}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar etiqueta"
        message={`¿Seguro que quieres eliminar "${deleteTarget?.name}"? Sus sub-etiquetas quedarán huérfanas (sin padre).`}
        confirmText="Sí, eliminar"
        loading={deleting}
      />
    </>
  );
}
